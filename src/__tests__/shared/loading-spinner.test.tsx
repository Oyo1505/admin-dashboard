import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoadingSpinner from '@/components/shared/loading-spinner/loading-spinner';
import { describe, it } from '@jest/globals';

describe('LoadingSpinner Component', () => {
  it('renders without crashing', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
  });

  it('applies default classes', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('flex w-full h-full justify-center items-center');
  });

  it('applies additional class names when provided', () => {
    const additionalClass = 'custom-class';
    render(<LoadingSpinner className={additionalClass} />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass(additionalClass);
  });

  it('renders the SVG spinner', () => {
    render(<LoadingSpinner />);
    const svg = screen.getByRole('status').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-red-500');
  });

  it('includes accessible loading text for screen readers', () => {
    render(<LoadingSpinner />);
    const srText = screen.getByText('Loading...');
    expect(srText).toBeInTheDocument();
    expect(srText).toHaveClass('sr-only');
  });
});
