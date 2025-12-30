/**
 * Unit tests for the LandingPage component
 *
 * Concepts tested:
 * - Conditional rendering based on authentication state
 * - Better Auth integration (useSession hook)
 * - Internationalization (next-intl)
 * - Component composition and UI elements
 * - Link navigation
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock @/lib/auth-client - Uses manual mock from src/lib/__mocks__/auth-client.ts
// This avoids importing nanostores which causes Jest parsing errors
jest.mock('@/lib/auth-client');

// Mock Zustand user store - needed for userIsNotLogged check
jest.mock('@/store/user/user-store', () => ({
  __esModule: true,
  default: jest.fn(() => ({ user: {} })),
}));

// Mock next-intl - returns a function that returns the translation key
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `translated.${key}`,
}));

// Mock next/font/google - avoids font loading in tests
jest.mock('next/font/google', () => ({
  Lobster: () => ({
    className: 'mocked-lobster-font',
  }),
}));

// Mock ButtonLogin component with relative path (avoids alias issues)
jest.mock('../../ui/components/button-login/button-login', () => {
  return {
    __esModule: true,
    default: function MockButtonLogin() {
      return React.createElement(
        'button',
        { 'data-testid': 'button-login' },
        'Login'
      );
    },
  };
});

// Mock Container component
jest.mock('../../ui/components/container/container', () => {
  return {
    __esModule: true,
    default: function MockContainer({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return React.createElement(
        'div',
        { 'data-testid': 'container' },
        children
      );
    },
  };
});

// Import after mocks are set up
import { useSession } from '@/lib/auth-client';
import LandingPage from '../components/landing-page/landing-page';

describe('LandingPage', () => {
  beforeEach(() => {
    // Reset user store mock to empty user for each test
    const mockUseUserStore = jest.requireMock(
      '@/store/user/user-store'
    ).default;
    mockUseUserStore.mockReturnValue({ user: {} });
  });

  /**
   * Group 1: Conditional rendering based on authentication state
   *
   * The component only displays when session === null (unauthenticated)
   */
  describe('Conditional rendering based on authentication', () => {
    it('should display content for an unauthenticated user (session = null)', () => {
      // Arrange: Simulate a non-logged-in user
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        isPending: false,
        error: null,
      });

      // Act: Render the component
      render(<LandingPage />);

      // Assert: The welcome title should be visible
      expect(screen.getByText('translated.welcome')).toBeInTheDocument();
    });

    it('should display LoadingSpinner for the session isPending to true', () => {
      // Arrange: Simulate a non-logged-in user
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        isPending: true,
        error: null,
      });

      // Act: Render the component
      render(<LandingPage />);

      // Assert: The loading-spinner should be visible
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
    it('should not display LoadingSpinner when session isPending is false', () => {
      // Arrange: Simulate a non-logged-in user with session loaded
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        isPending: false,
        error: null,
      });

      // Act: Render the component
      render(<LandingPage />);

      // Assert: The loading-spinner should NOT be visible
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
    it('should hide login content for authenticated users but keep welcome heading', () => {
      // Arrange: Simulate a logged-in user with session
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        isPending: false,
        error: null,
      });
      // Also mock user store with populated user
      const mockUseUserStore = jest.requireMock(
        '@/store/user/user-store'
      ).default;
      mockUseUserStore.mockReturnValue({
        user: { email: 'test@example.com', id: '1' },
      });

      // Act: Render the component
      render(<LandingPage />);

      // Assert: Welcome heading is visible (always renders)
      expect(screen.getByText('translated.welcome')).toBeInTheDocument();

      // Assert: Login-specific content is hidden
      expect(screen.queryByText('translated.title')).not.toBeVisible();
      expect(screen.queryByTestId('button-login')).not.toBeVisible();

      // Assert: Loading spinner is not present
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();

      // Assert: Footer links are still visible
      expect(screen.getByText('translated.privacy')).toBeInTheDocument();
      expect(screen.getByText('translated.legalMentions')).toBeInTheDocument();
    });

    it('should display loading spinner and welcome during initial load', () => {
      // Arrange: Simulate initial state (session loading)
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        isPending: true,
        error: null,
      });

      // Act
      render(<LandingPage />);

      // Assert: Welcome heading is visible during loading
      expect(screen.getByText('translated.welcome')).toBeInTheDocument();

      // Assert: Loading spinner is displayed
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

      // Assert: Login content is hidden while loading
      expect(screen.queryByText('translated.title')).not.toBeVisible();
      expect(screen.queryByTestId('button-login')).not.toBeVisible();
    });
  });

  /**
   * Group 2: Main UI elements
   *
   * Verifies the presence and structure of key elements
   */
  describe('UI Elements', () => {
    beforeEach(() => {
      // Setup: Unauthenticated user for all these tests
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        isPending: false,
        error: null,
      });
    });

    it('should display the h1 heading with "welcome" translation', () => {
      // Arrange & Act
      render(<LandingPage />);

      // Assert
      const heading = screen.getByText('translated.welcome');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('should apply Lobster font class to the heading', () => {
      // Arrange & Act
      render(<LandingPage />);

      // Assert: Heading uses mocked font class
      const heading = screen.getByText('translated.welcome');
      expect(heading).toHaveClass('mocked-lobster-font');
    });

    it('should display the description with "title" translation', () => {
      // Arrange & Act
      render(<LandingPage />);

      // Assert
      expect(screen.getByText('translated.title')).toBeInTheDocument();
    });

    it('should display the ButtonLogin component', () => {
      // Arrange & Act
      render(<LandingPage />);

      // Assert: Mocked button is rendered
      const loginButton = screen.getByTestId('button-login');
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveTextContent('Login');
    });

    it('should display the "Privacy" link with the correct href', () => {
      // Arrange & Act
      render(<LandingPage />);

      // Assert
      const privacyLink = screen.getByText('translated.privacy');
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink).toHaveAttribute('href', '/regles-de-confidentialite');
    });

    it('should display the "Legal Mentions" link with the correct href', () => {
      // Arrange & Act
      render(<LandingPage />);

      // Assert
      const legalLink = screen.getByText('translated.legalMentions');
      expect(legalLink).toBeInTheDocument();
      expect(legalLink).toHaveAttribute('href', '/mentions-legales');
    });
  });

  /**
   * Group 3: Component structure and layout
   *
   * Verifies the DOM structure and layout classes
   */
  describe('Component structure', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        isPending: false,
        error: null,
      });
    });

    it('should render inside a Container component', () => {
      // Arrange & Act
      render(<LandingPage />);

      // Assert: Mocked container is present
      expect(screen.getByTestId('container')).toBeInTheDocument();
    });

    it('should have proper layout structure with flexbox classes', () => {
      // Arrange & Act
      const { container } = render(<LandingPage />);

      // Assert: Check for flexbox layout classes
      const flexContainer = container.querySelector(
        '.flex.flex-col.items-center.justify-center'
      );
      expect(flexContainer).toBeInTheDocument();
    });

    it('should have full screen height class', () => {
      // Arrange & Act
      const { container } = render(<LandingPage />);

      // Assert: h-screen class for full height
      const screenContainer = container.querySelector('.h-screen');
      expect(screenContainer).toBeInTheDocument();
    });

    it('should render footer links in a flex container with gap', () => {
      // Arrange & Act
      const { container } = render(<LandingPage />);

      // Assert: Footer links container has proper styling
      const footerLinks = container.querySelector('.flex.gap-6');
      expect(footerLinks).toBeInTheDocument();
    });
  });

  /**
   * Group 4: Internationalization (i18n)
   *
   * Verifies that all strings use the translation system
   */
  describe('Internationalization', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        isPending: false,
        error: null,
      });
    });

    it('should use useTranslations for all text content', () => {
      // Arrange & Act
      render(<LandingPage />);

      // Assert: All expected translation keys are present
      expect(screen.getByText('translated.welcome')).toBeInTheDocument();
      expect(screen.getByText('translated.title')).toBeInTheDocument();
      expect(screen.getByText('translated.privacy')).toBeInTheDocument();
      expect(screen.getByText('translated.legalMentions')).toBeInTheDocument();
    });

    it('should not have any hardcoded English text', () => {
      // Arrange & Act
      const { container } = render(<LandingPage />);

      // Assert: All text uses translation keys (no direct "Welcome", "Privacy", etc.)
      expect(container.textContent).not.toContain('Welcome');
      expect(container.textContent).not.toContain('Privacy');
      expect(container.textContent).not.toContain('Legal Mentions');
    });
  });

  /**
   * Group 5: Better Auth integration
   *
   * Tests the integration with Better Auth
   */
  describe('Better Auth integration', () => {
    it('should call useSession hook', () => {
      // Arrange
      const mockUseSession = useSession as jest.Mock;
      mockUseSession.mockReturnValue({
        data: null,
        isPending: false,
        error: null,
      });

      // Act
      render(<LandingPage />);

      // Assert: useSession was called
      expect(mockUseSession).toHaveBeenCalled();
    });

    it('should handle undefined session data gracefully', () => {
      // Arrange: Simulate undefined data
      (useSession as jest.Mock).mockReturnValue({
        data: undefined,
        isPending: false,
        error: null,
      });

      // Act & Assert: Should not throw error
      expect(() => render(<LandingPage />)).not.toThrow();
    });

    it('should handle error state in session', () => {
      // Arrange: Simulate error in session
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        isPending: false,
        error: new Error('Auth error'),
      });

      // Act: Render with error state
      render(<LandingPage />);

      // Assert: Component still renders (shows landing page)
      expect(screen.getByText('translated.welcome')).toBeInTheDocument();
    });
  });
});
