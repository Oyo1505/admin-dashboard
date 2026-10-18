import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { useHydrated } from '../use-hydrated';

const Probe = () => <span>{useHydrated() ? 'client' : 'server'}</span>;

describe('useHydrated', () => {
  it('should be false during server rendering', () => {
    expect(renderToString(<Probe />)).toContain('server');
  });

  it('should be true once rendered on the client', () => {
    render(<Probe />);

    expect(screen.getByText('client')).toBeInTheDocument();
  });
});
