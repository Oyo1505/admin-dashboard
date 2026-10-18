import { IUser } from '@/models/user/user';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { EmailAuthrizedEmailRow } from '../email-user-authorized-row/email-user-authorized-row';
import UsersTable from '../user-table/users-table';

const mockDeleteUserById = jest.fn();
jest.mock('../../actions/user', () => ({
  deleteUserById: (args: unknown) => mockDeleteUserById(args),
}));

jest.mock('@/lib/auth-client', () => ({
  useSession: () => ({ data: { user: { id: 'admin-1', role: 'ADMIN' } } }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: jest.fn() }),
}));

const mockMutate = jest.fn();
jest.mock('@/domains/auth/hooks/use-emails-autorized', () => ({
  __esModule: true,
  default: () => ({
    deleteEmailMutation: { mutate: mockMutate, isPending: false },
  }),
}));

describe('Delete confirmations', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('UsersTable', () => {
    const users = [
      { id: 'user-2', name: 'Akira', email: 'akira@test.fr', role: 'USER' },
    ] as IUser[];

    it('should not delete a user before confirmation', () => {
      render(<UsersTable users={users} />);

      fireEvent.click(
        screen.getByRole('button', { name: 'deleteButton Akira' })
      );

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
      expect(mockDeleteUserById).not.toHaveBeenCalled();
    });

    it('should delete the user once confirmed', async () => {
      render(<UsersTable users={users} />);

      fireEvent.click(
        screen.getByRole('button', { name: 'deleteButton Akira' })
      );
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'deleteButton' }));
      });

      expect(mockDeleteUserById).toHaveBeenCalledWith({
        id: 'user-2',
        user: { id: 'admin-1', role: 'ADMIN' },
      });
    });

    it('should use translated column headers', () => {
      render(<UsersTable users={users} />);

      expect(
        screen.getByRole('columnheader', { name: 'usersName' })
      ).toBeInTheDocument();
    });
  });

  describe('EmailAuthrizedEmailRow', () => {
    it('should remove the email only after confirmation', () => {
      render(<EmailAuthrizedEmailRow email="a@test.fr" hasPermission />);

      fireEvent.click(
        screen.getByRole('button', { name: 'deleteButton a@test.fr' })
      );
      expect(mockMutate).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'deleteButton' }));
      expect(mockMutate).toHaveBeenCalledWith('a@test.fr');
    });

    it('should hide the delete action without permission', () => {
      render(
        <EmailAuthrizedEmailRow email="a@test.fr" hasPermission={false} />
      );

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });
});
