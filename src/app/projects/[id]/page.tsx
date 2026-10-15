import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FrontendShell } from '../../../components/layouts/frontend-shell';
import { ContactCta } from '../../../features/inquiries/components/contact-cta';
import { Footer } from '../../../components/layouts/footer';
import { ProjectShowcase } from '../../../features/projects/components/project-showcase';
import { getProjectById, getProjects } from '../../../features/projects/server/queries';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProjectById(params.id);
  if (!project) {
    return {
      title: 'Project Case Study | Lincent Huang',
    };
  }
  return {
    title: `${project.title} | Lincent Huang`,
    description: project.summary,
    openGraph: project.coverImage ? { images: [project.coverImage] } : undefined,
  };
}

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const project = await getProjectById(params.id);
  if (!project) notFound();
  const projectId = params.id;

  return (
    <FrontendShell activeProjectId={projectId}>
      <main className="w-full flex-1">
        <ProjectShowcase initialSelectedId={projectId} />
      </main>
      <ContactCta />
      <Footer />
    </FrontendShell>
  );
}
