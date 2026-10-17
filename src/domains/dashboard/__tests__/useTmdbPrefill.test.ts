import { MovieSchema } from '@/shared/schema/movieSchema';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTmdbPrefill } from '../hooks/useTmdbPrefill';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'TestQueryWrapper';
  return Wrapper;
};

const mockFetch = (status: number, body: unknown = {}) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
};

const renderPrefill = (defaultValues: Partial<MovieSchema>) =>
  renderHook(
    () => {
      const form = useForm<MovieSchema>({ defaultValues });
      return { form, ...useTmdbPrefill(form) };
    },
    { wrapper: createWrapper() }
  );

describe('useTmdbPrefill', () => {
  const currentYear = new Date().getFullYear();

  it('should fill only empty fields and the untouched default year', async () => {
    mockFetch(200, {
      title: 'Titre TMDB',
      director: 'Hayao Miyazaki',
      year: 1997,
      duration: 134,
    });
    const { result } = renderPrefill({
      title: 'Saisie manuelle',
      director: '',
      year: currentYear,
      duration: 0,
    });

    act(() => result.current.prefill('tt0119698'));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(global.fetch).toHaveBeenCalledWith('/api/tmdb/prefill/tt0119698');
    expect(result.current.form.getValues()).toMatchObject({
      title: 'Saisie manuelle',
      director: 'Hayao Miyazaki',
      year: 1997,
      duration: 134,
    });
  });

  it('should not override a year edited by the user', async () => {
    mockFetch(200, { year: 1997 });
    const { result } = renderPrefill({ year: currentYear });

    act(() => {
      result.current.form.setValue('year', 2001, { shouldDirty: true });
    });
    act(() => result.current.prefill('tt0119698'));

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.form.getValues('year')).toBe(2001);
  });

  it('should expose a notFound status on 404', async () => {
    mockFetch(404);
    const { result } = renderPrefill({});

    act(() => result.current.prefill('tt0000000'));

    await waitFor(() => expect(result.current.status).toBe('notFound'));
  });

  it('should expose an error status on server failure', async () => {
    mockFetch(500);
    const { result } = renderPrefill({});

    act(() => result.current.prefill('tt0119698'));

    await waitFor(() => expect(result.current.status).toBe('error'));
  });

  it('should be idle by default', () => {
    const { result } = renderPrefill({});

    expect(result.current.status).toBe('idle');
  });
});
