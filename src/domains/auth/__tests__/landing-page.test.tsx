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

    it('should display NOTHING for an authenticated user (session exists)', () => {
      // Arrange: Simulate a logged-in user
      (useSession as jest.Mock).mockReturnValue({
        data: { user: { email: 'test@example.com' } },
        isPending: false,
        error: null,
      });

      // Act: Render the component
      const { container } = render(<LandingPage />);

      // Assert: No content should be displayed (renders nothing/null)
      expect(screen.queryByText('translated.welcome')).not.toBeInTheDocument();
      // Container should be empty or contain only null/false
      expect(container.textContent).toBe('');
    });

    it('should display content during initial load when session is null', () => {
      // Arrange: Simulate initial state (no session yet)
      (useSession as jest.Mock).mockReturnValue({
        data: null,
        isPending: true,
        error: null,
      });

      // Act
      render(<LandingPage />);

      // Assert: Component renders content when session is null (even if pending)
      expect(screen.getByText('translated.welcome')).toBeInTheDocument();
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

  /**
   * Learning points:
   *
   * 1. **Better Auth Mocking**: Mock @/lib/auth-client instead of better-auth/react
   *    - Avoids nanostores import issues in Jest
   *    - Cleaner mock at the app boundary
   *    - Better encapsulation of auth logic
   *
   * 2. **Conditional Rendering**: Test all branches
   *    - session === null → show content
   *    - session exists → hide content
   *    - Test render output, not internal logic
   *
   * 3. **Font Mocking**: Mock next/font/google to avoid font loading
   *    - Return a className for styling tests
   *    - Prevents network requests in tests
   *
   * 4. **Component Mocking**: Mock child components for isolation
   *    - Use data-testid for identifying mocked components
   *    - Maintain same prop interface
   *    - Focus tests on component under test
   *
   * 5. **i18n Testing**: Verify translation system usage
   *    - Check for translation keys in output
   *    - Ensure no hardcoded strings
   *    - Test all translatable content
   *
   * 6. **Layout Testing**: Test CSS classes for layout
   *    - Use querySelector for class-based selection
   *    - Test semantic structure (flexbox, grid)
   *    - Verify responsive classes
   *
   * 7. **Better Auth Integration**: session.data pattern
   *    - data: null → unauthenticated
   *    - data: { user } → authenticated
   *    - isPending: loading state
   *    - error: error state
   */
});
