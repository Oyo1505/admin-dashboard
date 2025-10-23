import { useQuery } from '@tanstack/react-query';

const useAnalyticsUsersVisits = () => {
  const getAnalyticsUsersVisits = useQuery({
    queryKey: ['analytics-visits'],
    queryFn: async () => {
      const response = await fetch(
        '/api/analytics/get-analytics-application-visits'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch analytics visits');
      }
      const { visits } = await response.json();

      return visits;
    },
  });

  const getAllAnalyticsUserVisits = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await fetch(
        '/api/analytics/get-all-analytics-users-visits'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch user analytics details');
      }
      const data = await response.json();

      return data;
    },
  });
  return { getAnalyticsUsersVisits, getAllAnalyticsUserVisits };
};

export default useAnalyticsUsersVisits;
