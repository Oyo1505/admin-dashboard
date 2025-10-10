import { getAnalyticsApplicationVisits } from '@/domains/auth/actions/action.analytics';
import { getAllAnalyticsUser } from '@/domains/auth/actions/action.users';
import { useQuery } from '@tanstack/react-query';

const useAnalyticsUsersVisits = () => {
  const getAnalyticsUsersVisits = useQuery({
    queryKey: ['analytics-visits'],
    queryFn: getAnalyticsApplicationVisits,
  });
  const getAllAnalyticsUserVisits = useQuery({
    queryKey: ['analytics'],
    queryFn: getAllAnalyticsUser,
  });
  return { getAnalyticsUsersVisits, getAllAnalyticsUserVisits };
};

export default useAnalyticsUsersVisits;
