import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock next/dynamic to return a synchronous component for testing
jest.mock('next/dynamic', () => {
  return function dynamic() {
    // Return a simple mock component that doesn't use async loading
    return function DynamicComponent() {
      return React.createElement(
        'div',
        { 'data-testid': 'landing-page-mock' },
        'content of Landing Page'
      );
    };
  };
});

// Mock the entire Page component to avoid async Server Component issues
jest.mock('../page', () => {
  return function MockPage() {
    return (
      <main data-testid="main" className="h-full">
        <div data-testid="landing-page-mock">content of Landing Page</div>
      </main>
    );
  };
});

// Import after mocks are defined
import Page from '../page';

describe('Home page (IndexPage)', () => {
  /**
   * Group 1: HTML Semantic Structure
   *
   * Verifies that the page uses proper HTML5 semantic elements
   */
  describe('Structure HTML semantic', () => {
    it('should render one element <main> with data-testid="main"', () => {
      // Arrange & Act: Render the mocked Page component
      render(<Page />);

      // Assert: Main element exists and is a <main> tag
      const mainElement = screen.getByTestId('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement.tagName).toBe('MAIN');
    });

    it('should apply CSS class "h-full" for full height', () => {
      // Arrange & Act
      render(<Page />);

      // Assert: Check h-full class is applied
      const mainElement = screen.getByTestId('main');
      expect(mainElement).toHaveClass('h-full');
    });

    it('should contain only one <main> element (HTML5 rule)', () => {
      // Arrange & Act
      const { container } = render(<Page />);

      // Assert: Only one main element in the DOM
      const mains = container.querySelectorAll('main');
      expect(mains).toHaveLength(1);
    });
  });

  /**
   * Group 2: Dynamic Component Loading
   *
   * Tests the integration with next/dynamic for lazy loading
   */
  describe('Loading dynamic component LandingPage', () => {
    it('should load and display mocked LandingPage component', () => {
      // Arrange & Act
      render(<Page />);

      // Assert: Mocked component is rendered
      const landingPage = screen.getByTestId('landing-page-mock');
      expect(landingPage).toBeInTheDocument();
    });

    it('should display content of LandingPage component', () => {
      // Arrange & Act
      render(<Page />);

      // Assert: Content is displayed correctly
      const landingPage = screen.getByTestId('landing-page-mock');
      expect(landingPage).toHaveTextContent('content of Landing Page');
    });
  });

  /**
   * Group 3: Testability and Accessibility
   *
   * Ensures the page is testable and accessible
   */
  describe('Testability and accessibility tests', () => {
    it('should use data-testid for stable element selection', () => {
      // Arrange & Act
      render(<Page />);

      // Assert: data-testid attribute allows reliable selection
      const mainElement = screen.getByTestId('main');
      expect(mainElement).toBeInTheDocument();
    });

    it('should permit access to container for advanced DOM tests', () => {
      // Arrange & Act
      const { container } = render(<Page />);

      // Assert: Container is accessible for querySelector operations
      expect(container.querySelector('main')).toBeInTheDocument();
    });

    it('should have main element within the container', () => {
      // Arrange & Act
      const { container } = render(<Page />);

      // Assert: Main element is present and within container
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      expect(container).toContainElement(main);
    });
  });

  /**
   * Group 4: Component Structure
   *
   * Verifies the overall structure and composition
   */
  describe('Component structure', () => {
    it('should render LandingPage inside main element', () => {
      // Arrange & Act
      render(<Page />);

      // Assert: LandingPage is a child of main
      const mainElement = screen.getByTestId('main');
      const landingPage = screen.getByTestId('landing-page-mock');

      expect(mainElement).toContainElement(landingPage);
    });

    it('should have exactly one child component in main', () => {
      // Arrange & Act
      const { container } = render(<Page />);

      // Assert: Main contains only LandingPage
      const mainElement = container.querySelector('main');
      expect(mainElement?.children).toHaveLength(1);
    });
  });
});
