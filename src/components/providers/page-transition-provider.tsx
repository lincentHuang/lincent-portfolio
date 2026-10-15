'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface PageTransitionContextType {
  transitionTo: (href: string, coords?: { x?: number; y?: number }) => void;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  transitionTo: () => {},
});

export const usePageTransition = () => useContext(PageTransitionContext);

interface PageTransitionProviderProps {
  children: React.ReactNode;
}

type TransitionStage = 'idle' | 'entering' | 'covered' | 'exiting';

export const PageTransitionProvider: React.FC<PageTransitionProviderProps> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [stage, setStage] = useState<TransitionStage>('idle');
  const isTransitioningRef = useRef<boolean>(false);
  const currentPathnameRef = useRef<string>(pathname);
  const pendingHrefRef = useRef<string | null>(null);
  const enterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const exitTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger exit (slide away) when new page rendered
  const triggerExit = useCallback(() => {
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }

    setStage('exiting');

    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
    exitTimerRef.current = setTimeout(() => {
      setStage('idle');
      isTransitioningRef.current = false;
      pendingHrefRef.current = null;
    }, 420); // match 400ms transition duration
  }, []);

  // Detect pathname change when Next.js loads the new page
  useEffect(() => {
    if (currentPathnameRef.current !== pathname) {
      currentPathnameRef.current = pathname;

      if (isTransitioningRef.current) {
        // Small delay to ensure new page DOM has painted behind the curtain
        const timer = setTimeout(() => {
          triggerExit();
        }, 80);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, triggerExit]);

  // Main transition trigger
  const transitionTo = useCallback(
    (href: string) => {
      if (!href) return;

      const targetPath = href.split('?')[0].split('#')[0] || '/';
      const currentPath = window.location.pathname;

      // Same-page hash link -> smooth scroll without curtain
      if (targetPath === currentPath && href.includes('#')) {
        const hash = href.split('#')[1];
        if (hash) {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            return;
          }
        }
      }

      // Same page without query
      if (targetPath === currentPath && !href.includes('?')) {
        return;
      }

      if (isTransitioningRef.current) return;

      isTransitioningRef.current = true;
      pendingHrefRef.current = href;

      // Start entering from bottom
      setStage('entering');

      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      enterTimerRef.current = setTimeout(() => {
        setStage('covered');
        router.push(href);

        // Safety fallback in case pathname doesn't update
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = setTimeout(() => {
          if (isTransitioningRef.current) {
            triggerExit();
          }
        }, 1200);
      }, 400); // 400ms enter duration
    },
    [router, triggerExit]
  );

  // Global click interception for standard internal <a> links
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
        return;
      }

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      if (
        anchor.target === '_blank' ||
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        anchor.hasAttribute('download')
      ) {
        return;
      }

      if (href.startsWith('#')) {
        return;
      }

      const currentPath = window.location.pathname;
      const targetUrl = new URL(anchor.href, window.location.origin);

      if (targetUrl.origin !== window.location.origin) {
        return;
      }

      if (targetUrl.pathname === currentPath && targetUrl.hash) {
        return;
      }

      if (targetUrl.pathname === currentPath && !targetUrl.search) {
        return;
      }

      // Intercept and slide curtain
      e.preventDefault();
      e.stopPropagation();
      transitionTo(href);
    };

    document.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, [transitionTo]);

  // Clean up timers
  useEffect(() => {
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  // Compute transform & visibility based on stage
  let transformValue = 'translate3d(0, 100%, 0)';
  let transitionValue = 'none';
  let isVisible = false;

  if (stage === 'entering') {
    transformValue = 'translate3d(0, 0%, 0)';
    transitionValue = 'transform 0.4s cubic-bezier(0.76, 0, 0.24, 1)';
    isVisible = true;
  } else if (stage === 'covered') {
    transformValue = 'translate3d(0, 0%, 0)';
    transitionValue = 'none';
    isVisible = true;
  } else if (stage === 'exiting') {
    transformValue = 'translate3d(0, -100%, 0)';
    transitionValue = 'transform 0.4s cubic-bezier(0.76, 0, 0.24, 1)';
    isVisible = true;
  }

  return (
    <PageTransitionContext.Provider value={{ transitionTo }}>
      {children}

      {/* BOTTOM-TO-TOP CURTAIN PAGE TRANSITION OVERLAY */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999999,
          pointerEvents: isVisible ? 'auto' : 'none',
          visibility: isVisible ? 'visible' : 'hidden',
          backgroundColor: '#121218',
          transform: transformValue,
          transition: transitionValue,
          willChange: 'transform',
        }}
        className="w-full h-full flex items-center justify-center select-none"
      >
        {/* Subtle center brand mark during transition */}
        <div className="flex flex-col items-center justify-center gap-3">
          <img
            src="/images/lincent-logo.svg"
            alt="lincent"
            className="w-12 h-12 object-contain opacity-90 animate-pulse invert"
          />
        </div>
      </div>
    </PageTransitionContext.Provider>
  );
};
