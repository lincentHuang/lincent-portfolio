import type { Metadata } from 'next';
import { FrontendShell } from '../../components/layouts/frontend-shell';
import { ContactCta } from '../../features/inquiries/components/contact-cta';
import { Footer } from '../../components/layouts/footer';
import { ProjectShowcase } from '../../features/projects/components/project-showcase';

export const metadata: Metadata = {
  title: 'Selected Projects & Engineering Showcase | Lincent Huang',
  description: 'Explore full case studies, architecture decisions, and performance metrics across flagship projects.',
};

export default function ProjectsPage() {
  return (
    <FrontendShell>
      <main className="w-full flex-1">
        <ProjectShowcase />
      </main>
      <ContactCta />
      <Footer />
    </FrontendShell>
  );
}
