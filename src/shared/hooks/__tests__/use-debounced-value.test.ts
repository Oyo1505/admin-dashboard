import { act, renderHook } from '@testing-library/react';
import { useDebouncedValue } from '../use-debounced-value';

describe('useDebouncedValue', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('a'));

    expect(result.current).toBe('a');
  });

  it('should only update after the delay without new changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'ab' });
    act(() => jest.advanceTimersByTime(200));
    rerender({ value: 'abc' });
    act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe('a');

    act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe('abc');
  });
});
