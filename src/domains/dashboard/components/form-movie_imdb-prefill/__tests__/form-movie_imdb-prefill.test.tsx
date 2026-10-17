import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { TmdbPrefillStatus } from '../../../hooks/useTmdbPrefill';
import FormMovieImdbPrefill from '../form-movie_imdb-prefill';

const messages = {
  AddMovie: {
    prefillButton: 'Pré-remplir depuis IMDb',
    prefillHint: 'Saisissez un identifiant IMDb',
    prefillLoading: 'Chargement',
    prefillSuccess: 'Champs pré-remplis',
    prefillNotFound: 'Aucun film trouvé',
    prefillError: 'Erreur',
  },
};

const renderComponent = (
  imdbId: string | undefined,
  status: TmdbPrefillStatus = 'idle',
  onPrefill = jest.fn()
) =>
  render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <FormMovieImdbPrefill
        imdbId={imdbId}
        status={status}
        onPrefill={onPrefill}
      />
    </NextIntlClientProvider>
  );

describe('FormMovieImdbPrefill', () => {
  it('should disable the button for an invalid IMDb id', () => {
    renderComponent('tt12');

    expect(
      screen.getByRole('button', { name: 'prefillButton' })
    ).toBeDisabled();
  });

  it('should call onPrefill with the IMDb id on click', () => {
    const onPrefill = jest.fn();
    renderComponent('tt0119698', 'idle', onPrefill);

    fireEvent.click(screen.getByRole('button'));

    expect(onPrefill).toHaveBeenCalledWith('tt0119698');
  });

  it('should be busy and disabled while loading', () => {
    renderComponent('tt0119698', 'loading');

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('prefillLoading');
  });

  it('should link the button to its hint', () => {
    renderComponent('tt0119698');

    expect(screen.getByRole('button')).toHaveAccessibleDescription(
      'prefillHint'
    );
  });

  it.each<[TmdbPrefillStatus, string]>([
    ['success', 'prefillSuccess'],
    ['notFound', 'prefillNotFound'],
    ['error', 'prefillError'],
  ])('should announce the %s status', (status, message) => {
    renderComponent('tt0119698', status);

    expect(screen.getByRole('status')).toHaveTextContent(message);
  });

  it('should render an empty live region when idle', () => {
    renderComponent('tt0119698');

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
