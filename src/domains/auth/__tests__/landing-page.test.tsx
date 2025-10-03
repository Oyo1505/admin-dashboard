/**
 * Unit tests for the LandingPage component
 *
 * 📚 Concepts tested:
 * - Conditional rendering based on authentication
 * - Mocking external hooks (NextAuth, i18n)
 * - Dependency isolation (Zustand store)
 * - Accessibility and HTML semantics tests
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import React from 'react';
import LandingPage from '../components/landing-page/landing-page';
// Mock NextAuth - returns a session object with status
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock next-intl - returns a function that returns the translation key
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `translated.${key}`,
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

describe('LandingPage', () => {
  /**
   * Group 1: Conditional rendering based on authentication state
   *
   * The component only displays when status === 'unauthenticated'
   */
  describe('Conditional rendering based on authentication', () => {
    it('displays content for an unauthenticated user', () => {
      // Arrange: Simulate a non-logged-in user
      (useSession as jest.Mock).mockReturnValue({
        status: 'unauthenticated',
        data: null,
      });

      // Act: Render the component
      render(<LandingPage />);

      // Assert: The welcome title should be visible
      expect(screen.getByText('translated.welcome')).toBeInTheDocument();
    });

    it('displays NOTHING for an authenticated user', () => {
      // Arrange: Simulate a logged-in user
      (useSession as jest.Mock).mockReturnValue({
        status: 'authenticated',
        data: { user: { email: 'test@example.com' } },
      });

      // Act: Render the component
      render(<LandingPage />);

      // Assert: No content should be displayed (render = false)
      expect(screen.queryByText('translated.welcome')).not.toBeInTheDocument();
    });

    it('displays NOTHING during loading', () => {
      // Arrange: Simulate loading state
      (useSession as jest.Mock).mockReturnValue({
        status: 'loading',
        data: null,
      });

      // Act
      render(<LandingPage />);

      // Assert: Component renders nothing during loading
      expect(screen.queryByText('translated.welcome')).not.toBeInTheDocument();
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
        status: 'unauthenticated',
        data: null,
      });
    });

    it('displays the h1 heading with "welcome" translation', () => {
      render(<LandingPage />);

      const heading = screen.getByText('translated.welcome');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });

    it('displays the description with "title" translation', () => {
      render(<LandingPage />);

      expect(screen.getByText('translated.title')).toBeInTheDocument();
    });

    it('displays the "Privacy" link with the correct href', () => {
      render(<LandingPage />);

      const privacyLink = screen.getByText('translated.privacy');
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink).toHaveAttribute('href', '/regles-de-confidentialite');
    });

    it('displays the "Legal Mentions" link with the correct href', () => {
      render(<LandingPage />);

      const legalLink = screen.getByText('translated.legalMentions');
      expect(legalLink).toBeInTheDocument();
      expect(legalLink).toHaveAttribute('href', '/mentions-legales');
    });
  });

  /**
   * Group 3: Internationalization (i18n)
   *
   * Verifies that all strings use the translation system
   */
  describe('Internationalization', () => {
    beforeEach(() => {
      (useSession as jest.Mock).mockReturnValue({
        status: 'unauthenticated',
        data: null,
      });
    });

    it('uses useTranslations for all texts', () => {
      render(<LandingPage />);

      // Verify that all expected translation keys are present
      expect(screen.getByText('translated.welcome')).toBeInTheDocument();
      expect(screen.getByText('translated.title')).toBeInTheDocument();
      expect(screen.getByText('translated.privacy')).toBeInTheDocument();
      expect(screen.getByText('translated.legalMentions')).toBeInTheDocument();
    });
  });

  /**
   * 💡 Learning points:
   *
   * 1. **Conditional rendering**: The component returns `false` when not authenticated
   *    - Use `queryBy*` to verify the absence of elements
   *
   * 2. **Hook mocking**: NextAuth and i18n are external dependencies
   *    - Mock at module level with `jest.mock()`
   *    - TypeScript cast with `as jest.Mock` to access Jest methods
   *
   * 3. **beforeEach**: Common setup to avoid repetition
   *    - Configures authentication state for a group of tests
   *
   * 4. **Semantic assertions**:
   *    - `toBeInTheDocument()`: Element in the DOM
   *    - `toHaveAttribute()`: Verify HTML attributes
   *    - `tagName`: Verify HTML tag type
   *
   * 5. **"Arrange-Act-Assert" pattern**:
   *    - Arrange: Prepare mocks and data
   *    - Act: Execute the action (render)
   *    - Assert: Verify the results (expect)
   */
});
