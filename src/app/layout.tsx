import type { Metadata } from 'next';
import './globals.css';
import { PageTransitionProvider } from '../components/providers/page-transition-provider';
import { ContentProvider } from '../content/content-provider';
import { getPublicContent } from '../server/content-repo';

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getPublicContent();
  return {
    title: site.seo.title.zh,
    description: site.seo.description.zh,
    icons: {
      icon: '/favicon.svg',
      apple: '/images/lincent-logo.png',
    },
    openGraph: site.seo.ogImage ? { images: [site.seo.ogImage] } : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getPublicContent();
  return (
    <html lang="zh-TW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Inter:wght@300;400;500;600;700;800&family=Lora:ital,wght@0,400..700;1,400..700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased text-[#121218] selection:text-[#121218]">
        <ContentProvider content={content}>
          <PageTransitionProvider>{children}</PageTransitionProvider>
        </ContentProvider>
      </body>
    </html>
  );
}
