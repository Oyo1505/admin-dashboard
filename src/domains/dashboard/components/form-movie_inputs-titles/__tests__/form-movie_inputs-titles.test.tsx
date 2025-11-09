import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { UseFormRegister } from 'react-hook-form';
import FormMovieInputsTitles from '../form-movie_inputs-titles';

const messages = {
  AddMovie: {
    titleMovie: 'Titre du film',
    originalTitle: 'Titre original',
    titleJapanese: 'Titre japonais',
    titleEnglish: 'Titre anglais',
    director: 'Réalisateur',
    link: 'Lien',
    imdbId: 'IMDb ID',
  },
};

const mockRegister = jest.fn() as unknown as UseFormRegister<any>;

describe('FormMovieInputsTitles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockRegister as jest.Mock).mockReturnValue({
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
      name: '',
    });
  });

  it('should render all input fields', () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieInputsTitles register={mockRegister} />
      </NextIntlClientProvider>
    );

    // Check for label elements with translation keys
    expect(screen.getByText('titleMovie')).toBeInTheDocument();
    expect(screen.getByText('originalTitle')).toBeInTheDocument();
    expect(screen.getByText('titleJapanese')).toBeInTheDocument();
    expect(screen.getByText('titleEnglish')).toBeInTheDocument();
    expect(screen.getByText('director')).toBeInTheDocument();
    expect(screen.getByText('link')).toBeInTheDocument();
    expect(screen.getByText('imdbId')).toBeInTheDocument();
  });

  it('should call register for each field', () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieInputsTitles register={mockRegister} />
      </NextIntlClientProvider>
    );

    expect(mockRegister).toHaveBeenCalledWith('title');
    expect(mockRegister).toHaveBeenCalledWith('originalTitle');
    expect(mockRegister).toHaveBeenCalledWith('titleJapanese');
    expect(mockRegister).toHaveBeenCalledWith('titleEnglish');
    expect(mockRegister).toHaveBeenCalledWith('director');
    expect(mockRegister).toHaveBeenCalledWith('link');
    expect(mockRegister).toHaveBeenCalledWith('imdbId');
  });

  it('should display error messages when errors are provided', () => {
    const errors = {
      title: { message: 'Le titre est requis' },
      director: { message: 'Le réalisateur est requis' },
    };

    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieInputsTitles register={mockRegister} errors={errors as any} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Le titre est requis')).toBeInTheDocument();
    expect(screen.getByText('Le réalisateur est requis')).toBeInTheDocument();
  });

  it('should render without errors when no errors prop is provided', () => {
    const { container } = render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieInputsTitles register={mockRegister} />
      </NextIntlClientProvider>
    );

    const errorElements = container.querySelectorAll('.text-red-600');
    expect(errorElements).toHaveLength(0);
  });
});
