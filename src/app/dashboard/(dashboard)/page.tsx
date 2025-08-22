import Analytics from '@/domains/dashboard/components/analytics/analytics';
import TitleDashboard from '@/domains/dashboard/components/title-dashoard/tite-dashboard';

const Page = () => {
  return (
    <div className="flex flex-1 lg:h-[calc(100vh-10rem)] flex-col gap-4 p-4 md:gap-8 md:p-6">
      <TitleDashboard />
      <Analytics />
    </div>
  );
};

export default Page;
