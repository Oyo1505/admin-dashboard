import LoadingSpinner from '@/domains/shared/components/loading-spinner/loading-spinner';
import useAnalyticsUsersVisits from '../../hooks/useAnalyticsUsersVisits';

const AnalyticsVisits = () => {
  const { getAnalyticsUsersVisits } = useAnalyticsUsersVisits();
  const { data, isLoading } = getAnalyticsUsersVisits;

  if (isLoading) {
    return <LoadingSpinner />;
  }
  return <div>AnalyticsVisits {data?.visits} visites</div>;
};

export default AnalyticsVisits;
