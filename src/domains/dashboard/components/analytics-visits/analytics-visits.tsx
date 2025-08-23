import { useQuery } from '@tanstack/react-query';
import { getAnalyticsApplicationVisits } from '@/domains/auth/actions/action.analytics';
import LoadingSpinner from '@/domains/shared/loading-spinner/loading-spinner';

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
