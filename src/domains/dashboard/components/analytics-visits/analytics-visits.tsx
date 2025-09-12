import { getAnalyticsApplicationVisits } from '@/domains/auth/actions/action.analytics';
import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import { useQuery } from '@tanstack/react-query';

const AnalyticsVisits = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-visits'],
    queryFn: getAnalyticsApplicationVisits,
  });
  if (isLoading) {
    return <LoadingSpinner />;
  }
  return <div>AnalyticsVisits {data?.visits} visites</div>;
};

export default AnalyticsVisits;
