'use client';
import { Input } from '@/domains/ui/components/input/input';
import LabelForm from '@/domains/ui/components/label-form/label-form';
import { FieldError, FieldErrors, FieldPath } from 'react-hook-form';
import {
  FORM_ERROR_CLASS,
  FORM_FIELD_CLASS,
  FORM_LABEL_CLASS,
  fieldErrorId,
} from '../form-field-styles';

const FormTextInput = <T extends Record<string, unknown>>({
  textTranslated,
  keyValue,
  htmlFor,
  errors,
  ...props
}: {
  textTranslated: string;
  keyValue: FieldPath<T>;
  htmlFor: string;
  errors?: FieldErrors<T>;
}) => {
  const error = errors?.[keyValue as keyof FieldErrors<T>] as
    FieldError | undefined;
  const errorId = fieldErrorId(htmlFor);

  return (
    <div className="mb-[15px] flex flex-col items-center gap-5">
      <LabelForm
        className={FORM_LABEL_CLASS}
        titleLabel={textTranslated}
        htmlFor={htmlFor}
      />
      <Input
        id={htmlFor}
        className={`${FORM_FIELD_CLASS} h-[35px]`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className={FORM_ERROR_CLASS}>
          {error.message}
        </p>
      )}
    </div>
  );
};

export default FormTextInput;
