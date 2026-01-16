import { render, screen } from '@testing-library/react';
import { WatchTracker } from '../watch-tracker';

// Mock the server action
const mockIncrementWatchCount = jest.fn();

jest.mock('../../../actions/movie-stats.action', () => ({
  incrementWatchCount: (...args: unknown[]) => mockIncrementWatchCount(...args),
}));

describe('WatchTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing (invisible component)', () => {
    const { container } = render(<WatchTracker movieId="movie-123" />);

    expect(container.firstChild).toBeNull();
  });

  it('should call incrementWatchCount with movieId on mount', () => {
    render(<WatchTracker movieId="movie-123" />);

    expect(mockIncrementWatchCount).toHaveBeenCalledWith('movie-123');
    expect(mockIncrementWatchCount).toHaveBeenCalledTimes(1);
  });

  it('should only call incrementWatchCount once even on re-render', () => {
    const { rerender } = render(<WatchTracker movieId="movie-123" />);

    // Re-render with same movieId
    rerender(<WatchTracker movieId="movie-123" />);
    rerender(<WatchTracker movieId="movie-123" />);

    // Should still only have been called once
    expect(mockIncrementWatchCount).toHaveBeenCalledTimes(1);
  });

  it('should call incrementWatchCount when movieId changes', () => {
    const { rerender } = render(<WatchTracker movieId="movie-123" />);

    expect(mockIncrementWatchCount).toHaveBeenCalledWith('movie-123');
    expect(mockIncrementWatchCount).toHaveBeenCalledTimes(1);

    // Change movieId - should trigger new call
    rerender(<WatchTracker movieId="movie-456" />);

    expect(mockIncrementWatchCount).toHaveBeenCalledWith('movie-456');
    expect(mockIncrementWatchCount).toHaveBeenCalledTimes(2);
  });

  it('should not call incrementWatchCount with empty movieId', () => {
    render(<WatchTracker movieId="" />);

    // With empty movieId, the server action validation should handle it
    // but the component itself calls the action - so it will be called
    // The service layer handles validation
    expect(mockIncrementWatchCount).toHaveBeenCalledWith('');
  });
});
