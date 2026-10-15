import type { Metadata } from 'next';
import { FrontendShell } from '../../components/layouts/frontend-shell';
import { Footer } from '../../components/layouts/footer';
import { ContactWizard } from '../../features/inquiries/components/contact-wizard';
import { CONTACT_OPTIONS } from '../../features/inquiries/pricing';

export const metadata: Metadata = {
  title: '聯繫合作 | Lincent Huang',
  description: '正職機會、合作邀約或任何問題，幾個步驟送出，24 小時內回覆。',
};

export default function ContactPage({ searchParams }: { searchParams: { type?: string } }) {
  // 從首頁卡片點進來會帶 ?type=，直接跳過第一步
  const initialType = CONTACT_OPTIONS.find((o) => o.id === searchParams.type)?.id;
  return (
    <FrontendShell>
      <main className="w-full flex-1">
        <ContactWizard key={initialType ?? 'none'} initialType={initialType} />
      </main>
      <Footer />
    </FrontendShell>
  );
}
