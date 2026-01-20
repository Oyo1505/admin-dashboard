import LabelForm from '@/domains/ui/components/label-form/label-form';
import { Textarea } from '@/domains/ui/components/textarea/textarea';
import { FieldError, FieldErrors, FieldPath } from 'react-hook-form';

const FormTextAreaInput = <T extends Record<string, unknown>>({
  htmlFor,
  titleLabel,
  keyValue,
  errors,
  ...props
}: {
  htmlFor: string;
  titleLabel: string;
  keyValue?: FieldPath<T>;
  errors?: FieldErrors<T>;
}) => {
  const error = keyValue
    ? (errors?.[keyValue as keyof FieldErrors<T>] as FieldError | undefined)
    : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className="mb-[15px] flex flex-col items-center gap-5">
      <LabelForm
        className="text-left w-full text-md"
        titleLabel={titleLabel}
        htmlFor={htmlFor}
      />
      <Textarea
        id={htmlFor}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] focus-visible:ring-2 focus-visible:ring-violet8 focus-visible:ring-offset-1 focus:shadow-[0_0_0_2px]"
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="text-red-600 text-xs">
          {error.message}
        </p>
      )}
    </div>
  );
};

export default FormTextAreaInput;
