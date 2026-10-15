import type { Metadata } from 'next';
import { FrontendShell } from '../../components/layouts/frontend-shell';
import { ContactCta } from '../../features/inquiries/components/contact-cta';
import { Footer } from '../../components/layouts/footer';
import { ProjectsOverview } from '../../features/projects/components/projects-overview';

export const metadata: Metadata = {
  title: 'All Projects | Lincent Huang',
  description: 'Browse every project at a glance and open any one for the full case study.',
};

export default function ProjectsPage() {
  return (
    <FrontendShell>
      <main className="w-full flex-1">
        <ProjectsOverview />
      </main>
      <ContactCta />
      <Footer />
    </FrontendShell>
  );
}
