import { Input } from '@/domains/ui/components/input/input';
import LabelForm from '@/domains/ui/components/label-form/label-form';
import { FieldError, FieldErrors, FieldPath } from 'react-hook-form';

const FormNumberInput = <T extends Record<string, unknown>>({
  step,
  htmlFor,
  titleLabel,
  keyValue,
  errors,
  ...props
}: {
  step?: string;
  titleLabel: string;
  htmlFor: string;
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
        className="text-violet11  text-right text-[15px]"
        titleLabel={titleLabel}
        htmlFor={htmlFor}
      />
      <Input
        id={htmlFor}
        aria-invalid={!!error}
        aria-describedby={errorId}
        className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] focus-visible:ring-2 focus-visible:ring-violet8 focus-visible:ring-offset-1 focus:shadow-[0_0_0_2px]"
        type="number"
        step={step}
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

export default FormNumberInput;
