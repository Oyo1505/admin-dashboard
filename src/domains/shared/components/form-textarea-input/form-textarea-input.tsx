import LabelForm from '@/domains/ui/components/label-form/label-form';
import { Textarea } from '@/domains/ui/components/textarea/textarea';

const FormTextAreaInput = ({
  htmlFor,
  titleLabel,
  ...props
}: {
  htmlFor: string;
  titleLabel: string;
}) => {
  return (
    <div className="mb-[15px] flex flex-col items-center gap-5">
      <LabelForm
        className="text-left w-full text-md"
        titleLabel={titleLabel}
        htmlFor={htmlFor}
      />
      <Textarea
        className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
        {...props}
      />
    </div>
  );
};

export default FormTextAreaInput;
