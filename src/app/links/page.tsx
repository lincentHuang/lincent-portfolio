import type { Metadata } from 'next';
import { LinksPage } from '../../features/links/links-page';
import { getPublicContent } from '../../server/content-repo';

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getPublicContent();
  const { profile, links } = site;
  return {
    title: links.title.zh || profile.name.zh,
    description: links.bio.zh || profile.tagline.zh,
  };
}

export default function Links() {
  return <LinksPage />;
}
