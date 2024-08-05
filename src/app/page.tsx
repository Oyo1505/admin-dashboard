
import LandingPage from '@/components/auth/components/landing-page/landing-page';
import { useTranslations } from 'next-intl';

export default function IndexPage() {
  const t = useTranslations('HomePage');
  return (
    <main className="h-full">
        <LandingPage />
    </main>
  );
}
