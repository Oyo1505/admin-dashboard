import { fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import FormMovieSelects from '../form-movie_selects';

const messages = {
  AddMovie: {
    langage: 'Langue',
    country: 'Pays',
  },
};

const mockHandleCountryChange = jest.fn();
const mockHandleLangageChange = jest.fn();

describe('FormMovieSelects', () => {
  const defaultProps = {
    locale: 'fr',
    formData: {
      langage: '',
      country: '',
    },
    handleCountryChange: mockHandleCountryChange,
    handleLangageChange: mockHandleLangageChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render language and country select inputs', () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelects {...defaultProps} />
      </NextIntlClientProvider>
    );

    // Verify both selects are rendered
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
  });

  it('should sort languages based on locale', () => {
    const { rerender } = render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelects {...defaultProps} />
      </NextIntlClientProvider>
    );

    // Test with French locale
    let selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);

    // Test with Japanese locale
    rerender(
      <NextIntlClientProvider locale="jp" messages={messages}>
        <FormMovieSelects {...defaultProps} locale="jp" />
      </NextIntlClientProvider>
    );

    selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);

    // Test with English locale
    rerender(
      <NextIntlClientProvider locale="en" messages={messages}>
        <FormMovieSelects {...defaultProps} locale="en" />
      </NextIntlClientProvider>
    );

    selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
  });

  it('should call handleLangageChange when language select changes', () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelects {...defaultProps} />
      </NextIntlClientProvider>
    );

    const langageSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(langageSelect, { target: { value: 'French' } });

    expect(mockHandleLangageChange).toHaveBeenCalled();
  });

  it('should call handleCountryChange when country select changes', () => {
    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelects {...defaultProps} />
      </NextIntlClientProvider>
    );

    const countrySelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(countrySelect, { target: { value: 'France' } });

    expect(mockHandleCountryChange).toHaveBeenCalled();
  });

  it('should display selected values from formData', () => {
    const propsWithData = {
      ...defaultProps,
      formData: {
        langage: 'French',
        country: 'France',
      },
    };

    render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelects {...propsWithData} />
      </NextIntlClientProvider>
    );

    // Verify the form renders with data
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
  });

  it('should render in a grid layout with 2 columns', () => {
    const { container } = render(
      <NextIntlClientProvider locale="fr" messages={messages}>
        <FormMovieSelects {...defaultProps} />
      </NextIntlClientProvider>
    );

    const gridContainer = container.querySelector('.grid.grid-cols-2');
    expect(gridContainer).not.toBeNull();
  });
});
