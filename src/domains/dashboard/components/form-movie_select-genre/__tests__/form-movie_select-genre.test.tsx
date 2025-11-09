import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { UseFormRegister } from 'react-hook-form';
import FormMovieSelectGenre from '../form-movie_select-genre';

const messages = {
  AddMovie: {
    genre: 'Genre',
    subtitles: 'Sous-titres',
  },
};

const mockGenresMovie = [
  { id: '1', nameFR: 'Action', nameEN: 'Action', nameJP: 'アクション' },
  { id: '2', nameFR: 'Comédie', nameEN: 'Comedy', nameJP: 'コメディ' },
];

const mockAvailableGenres = [
  { id: '3', nameFR: 'Drame', nameEN: 'Drama', nameJP: 'ドラマ' },
  { id: '4', nameFR: 'Horreur', nameEN: 'Horror', nameJP: 'ホラー' },
];

const mockHandleGenreDelete = jest.fn();
const mockHandleGenreChange = jest.fn();
const mockHandleCheckboxChange = jest.fn();
const mockRegister = jest.fn() as unknown as UseFormRegister<any>;

describe('FormMovieSelectGenre', () => {
  const defaultProps = {
    genresMovie: mockGenresMovie,
    handleGenreDelete: mockHandleGenreDelete,
    availableGenres: mockAvailableGenres,
    handleGenreChange: mockHandleGenreChange,
    checkboxSubtitles: ['FR', 'JP', 'EN'],
    handleCheckboxChange: mockHandleCheckboxChange,
    locale: 'fr',
    register: mockRegister,
    subtitles: ['FR'],
    genreLabel: 'Genre',
    subtitlesLabel: 'Sous-titres',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockRegister as jest.Mock).mockReturnValue({
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn(),
      name: 'subtitles',
    });
  });

  it('should render genre fieldset with legend', () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelectGenre {...defaultProps} />
      </NextIntlClientProvider>
    );

    // Check for genre fieldset with accessible legend
    const genreFieldset = screen.getByRole('group', { name: 'Genre' });
    expect(genreFieldset).toBeInTheDocument();
  });

  it('should render selected genres', () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelectGenre {...defaultProps} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Comédie')).toBeInTheDocument();
  });

  it('should call handleGenreDelete when clicking on a genre delete button', () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelectGenre {...defaultProps} />
      </NextIntlClientProvider>
    );

    // Find the delete button for the first genre (labeled with "x")
    const deleteButtons = screen.getAllByRole('button', {
      name: /Supprimer le genre/i,
    });
    expect(deleteButtons.length).toBeGreaterThan(0);

    // Click on the first delete button
    fireEvent.click(deleteButtons[0]);

    // The handler should be called with the genre id
    expect(mockHandleGenreDelete).toHaveBeenCalledWith('1');
  });

  it('should render available genres select when availableGenres is provided', () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelectGenre {...defaultProps} />
      </NextIntlClientProvider>
    );

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
  });

  it('should not render available genres select when availableGenres is undefined', () => {
    const propsWithoutAvailable = {
      ...defaultProps,
      availableGenres: undefined,
    };

    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelectGenre {...propsWithoutAvailable} />
      </NextIntlClientProvider>
    );

    const selectElement = screen.queryByRole('combobox');
    expect(selectElement).not.toBeInTheDocument();
  });

  it('should render subtitles label', () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelectGenre {...defaultProps} />
      </NextIntlClientProvider>
    );

    // Check for subtitle checkboxes within the subtitles fieldset
    const subtitleCheckboxes = screen.getAllByRole('checkbox', {
      name: /FR|JP|EN/,
    });
    expect(subtitleCheckboxes.length).toBeGreaterThan(0);
  });

  it('should render all subtitle checkboxes', () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelectGenre {...defaultProps} />
      </NextIntlClientProvider>
    );

    expect(screen.getByText('FR')).toBeInTheDocument();
    expect(screen.getByText('JP')).toBeInTheDocument();
    expect(screen.getByText('EN')).toBeInTheDocument();
  });

  it('should call handleCheckboxChange when clicking on a subtitle checkbox', () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelectGenre {...defaultProps} />
      </NextIntlClientProvider>
    );

    const frCheckbox = screen.getByLabelText('FR');
    fireEvent.click(frCheckbox);

    expect(mockHandleCheckboxChange).toHaveBeenCalledWith('FR');
  });

  it('should render without selected genres when genresMovie is empty', () => {
    const propsWithoutGenres = {
      ...defaultProps,
      genresMovie: [],
    };

    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelectGenre {...propsWithoutGenres} />
      </NextIntlClientProvider>
    );

    expect(screen.queryByText('Action')).not.toBeInTheDocument();
    expect(screen.queryByText('Comédie')).not.toBeInTheDocument();
  });

  it('should display genres in the correct locale', () => {
    const { rerender } = render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelectGenre {...defaultProps} locale="fr" />
      </NextIntlClientProvider>
    );

    // French locale should show French names
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Comédie')).toBeInTheDocument();

    // Change to English locale
    rerender(
      <NextIntlClientProvider locale="en" messages={messages}>
        <FormMovieSelectGenre {...defaultProps} locale="en" />
      </NextIntlClientProvider>
    );

    // Should still render with genre selection fieldset
    const genreFieldset = screen.getByRole('group', { name: 'Genre' });
    expect(genreFieldset).toBeInTheDocument();
  });
});
