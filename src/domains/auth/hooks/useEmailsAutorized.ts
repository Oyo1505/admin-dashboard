import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import {
  deleteEmailAuthorized,
  getAuthorizedEmailsPagination,
  postAuthorizedEmail,
} from '../actions/action.email';

interface UseEmailsAutorizedProps {
  email?: string;
  reset?: () => void;
  page?: number;
}

interface EmailFormData {
  email: string;
}

const useEmailsAutorized = ({ reset, page = 0 }: UseEmailsAutorizedProps) => {
  const queryClient = useQueryClient();
  const t = useTranslations('Dashboard');

  const addEmailMutation = useMutation({
    mutationFn: async (formData: EmailFormData) => {
      const { status, message } = await postAuthorizedEmail(formData.email);
      if (status === 200) {
        toast.success(t('userEmailAdded'));
        reset?.();
      } else if (status === 409) {
        toast.error(message || 'Email already authorized');
      } else {
        toast.error('Failed to add email');
      }
      return { status, email: formData.email };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users-mails-authorized'],
        exact: false,
      });
    },
  });
  const deleteEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      const { status } = await deleteEmailAuthorized(email);
      if (status === 200) {
        toast.success('Email deleted successfully');
      } else {
        toast.error('Email not deleted');
      }
      return { status, email };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['users-mails-authorized'],
        exact: false,
      });
    },
  });

  const getAuthorizedEmails = useQuery({
    queryKey: ['users-mails-authorized', page],
    queryFn: async () =>
      await getAuthorizedEmailsPagination({ pageParam: page * 5 }),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
  return { addEmailMutation, getAuthorizedEmails, deleteEmailMutation };
};

export default useEmailsAutorized;
