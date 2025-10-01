import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
const Page = require('../page').default;

jest.mock('next/dynamic', () => {
  return function dynamic() {
    const React = require('react');
    return function DynamicComponent() {
      return React.createElement(
        'div',
        { 'data-testid': 'landing-page-mock' },
        'content of Landing Page'
      );
    };
  };
});

describe('Home page (IndexPage)', () => {
  describe('Structure HTML semantic', () => {
    it('rended one element <main> with data-testid="main"', () => {
      render(<Page />);
      const mainElement = screen.getByTestId('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement.tagName).toBe('MAIN');
    });

    it('applied class CSS "h-full" for the high', () => {
      render(<Page />);

      const mainElement = screen.getByTestId('main');
      expect(mainElement).toHaveClass('h-full');
    });

    it('Content only one element <main> (rule HTML)', () => {
      const { container } = render(<Page />);
      const mains = container.querySelectorAll('main');
      expect(mains).toHaveLength(1);
    });
  });

  describe('Loading dynamic component LandingPage', () => {
    it('load and display mocked component LandingPage ', () => {
      render(<Page />);
      const landingPage = screen.getByTestId('landing-page-mock');
      expect(landingPage).toBeInTheDocument();
    });

    it('display content of component LandingPage', () => {
      render(<Page />);

      const landingPage = screen.getByTestId('landing-page-mock');
      expect(landingPage).toHaveTextContent('content of Landing Page');
    });
  });

  describe('Testability et accessibility tests', () => {
    it('use data-testid for a selection stable', () => {
      render(<Page />);

      const mainElement = screen.getByTestId('main');
      expect(mainElement).toBeInTheDocument();
    });

    it('Permit acces container for advanced tests DOM', () => {
      const { container } = render(<Page />);
      expect(container.querySelector('main')).toBeInTheDocument();
    });
  });
});
