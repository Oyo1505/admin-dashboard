import dynamic from 'next/dynamic';

const LandingPage = dynamic(
  () => import('@/domains/auth/components/landing-page/landing-page')
);

export default function IndexPage() {
  return (
    <main className="h-full">
      <LandingPage />
    </main>
  );
}
