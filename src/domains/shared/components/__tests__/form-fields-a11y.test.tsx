import { render, screen } from '@testing-library/react';
import FormNumberInput from '../form-number-input/form-number-input';
import FromSelectInput from '../form-select-input/form-select-input';
import FormTextInput from '../form-text-input/form-text-input';
import FormTextAreaInput from '../form-textarea-input/form-textarea-input';

const options = [
  { value: 'fr', label: { fr: 'Français', en: 'French', jp: 'フランス語' } },
  { value: 'ja', label: { fr: 'Japonais', en: 'Japanese', jp: '日本語' } },
];

describe('Form fields accessibility', () => {
  it('links the text input to its label and error message', () => {
    render(
      <FormTextInput<{ title: string }>
        textTranslated="Titre"
        htmlFor="title"
        keyValue="title"
        errors={{ title: { type: 'required', message: 'Un titre est requis' } }}
      />
    );

    const input = screen.getByLabelText('Titre');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Un titre est requis');
  });

  it('does not flag a valid text input as invalid', () => {
    render(
      <FormTextInput<{ title: string }>
        textTranslated="Titre"
        htmlFor="title"
        keyValue="title"
      />
    );

    const input = screen.getByLabelText('Titre');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('links the number input to its label', () => {
    render(<FormNumberInput titleLabel="Année" htmlFor="year" />);

    expect(screen.getByLabelText('Année')).toHaveAttribute('type', 'number');
  });

  it('links the textarea to its label', () => {
    render(<FormTextAreaInput titleLabel="Synopsis" htmlFor="synopsis" />);

    expect(screen.getByLabelText('Synopsis').tagName).toBe('TEXTAREA');
  });

  it('links the select to its label and reflects form data changes', () => {
    const props = {
      optionsList: options,
      formDataKey: 'langage',
      titleLabel: 'Langue',
      htmlFor: 'langage',
      locale: 'fr',
      onChange: jest.fn(),
    };
    const { rerender } = render(
      <FromSelectInput
        {...props}
        formData={{ langage: 'fr', country: '', idGoogleDive: '' }}
      />
    );

    const select = screen.getByLabelText('Langue');
    expect(select).toHaveValue('fr');

    rerender(
      <FromSelectInput
        {...props}
        formData={{ langage: 'ja', country: '', idGoogleDive: '' }}
      />
    );

    expect(screen.getByLabelText('Langue')).toHaveValue('ja');
  });
});
