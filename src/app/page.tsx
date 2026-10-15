import type { Metadata } from 'next';
import { getPublicContent } from '../server/content-repo';
import { tx } from '../content/types';
import { FrontendShell } from '../components/layouts/frontend-shell';
import { HeroSection } from '../features/portfolio/components/hero-section';
import { BenefitsSection } from '../features/portfolio/components/benefits-section';
import { FeaturedProjects } from '../features/projects/components/featured-projects';
import { WhyChooseMeSection } from '../features/portfolio/components/why-choose-me';
import { ServicesSection } from '../features/portfolio/components/services-section';
import { ProcessSection } from '../features/portfolio/components/process-section';
import { TestimonialsSection } from '../features/portfolio/components/testimonials-section';
import { ResumeSection } from '../features/portfolio/components/resume-section';
import { ContactCta } from '../features/inquiries/components/contact-cta';
import { Footer } from '../components/layouts/footer';

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getPublicContent();
  return {
    title: tx(site.seo.title, 'zh') || 'Lincent Huang',
    description: tx(site.seo.description, 'zh'),
    openGraph: site.seo.ogImage ? { images: [site.seo.ogImage] } : undefined,
  };
}

export default async function HomePage() {
  const { site } = await getPublicContent();
  const s = site.sections;

  return (
    <FrontendShell>
      <div className="w-full pt-4 sm:pt-6">
        {/* Hero 永遠顯示 */}
        <HeroSection />

        {s.benefits && <BenefitsSection />}

        {s.projects && <FeaturedProjects />}

        {s.whyChooseMe && <WhyChooseMeSection />}

        {s.services && <ServicesSection />}

        {s.process && <ProcessSection />}

        {s.testimonials && <TestimonialsSection />}

        {s.experience && <ResumeSection />}

        {s.contact && <ContactCta />}

        <Footer />
      </div>
    </FrontendShell>
  );
}
