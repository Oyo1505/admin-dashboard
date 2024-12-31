import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import useUserStore from '../../store/user/user-store';
import { useTranslations } from 'next-intl';
import jestConfig from 'jest.config';
import { describe, it } from 'node:test';

jestConfig.mock('store/user/user-store');
jestConfig.mock('next-intl', () => ({ useTranslations: jestConfig.fn() }));

describe('ButtonLogin', () => {
  it('renders the button with the correct text', () => {
    useUserStore.mockReturnValue({ login: jest.fn() });
    useTranslations.mockReturnValue((key) => (key === 'login' ? 'Log In' : key));

    render(<ButtonLogin />);

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('calls login function on click', () => {
    const loginMock = jest.fn();
    useUserStore.mockReturnValue({ login: loginMock });
    useTranslations.mockReturnValue((key) => (key === 'login' ? 'Log In' : key));

    render(<ButtonLogin />);

    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(loginMock).toHaveBeenCalledTimes(1);
  });
});
