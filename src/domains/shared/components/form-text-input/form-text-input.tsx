'use client';
import { Input } from '@/domains/ui/components/input/input';
import LabelForm from '@/domains/ui/components/label-form/label-form';
import { FieldError, FieldErrors } from 'react-hook-form';

const FormTextInput = <T extends Record<string, unknown>>({
  textTranslated,
  keyValue,
  htmlFor,
  errors,
  ...props
}: {
  textTranslated: string;
  keyValue: keyof T;
  htmlFor: string;
  errors?: FieldErrors<T>;
}) => {
  return (
    <div className="mb-[15px] flex flex-col items-center gap-5">
      <LabelForm
        className="text-left w-full text-md"
        titleLabel={textTranslated}
        htmlFor={htmlFor}
      />
      <Input
        className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
        {...props}
      />
      {errors?.[keyValue] && (
        <p className="text-red-600 text-xs">
          {(errors[keyValue] as FieldError)?.message}
        </p>
      )}
    </div>
  );
};

export default FormTextInput;
