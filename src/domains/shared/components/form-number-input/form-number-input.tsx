import { Input } from '@/domains/ui/components/input/input';
import LabelForm from '@/domains/ui/components/label-form/label-form';

const FormNumberInput = ({
  step,
  htmlFor,
  titleLabel,
  ...props
}: {
  step?: string;
  titleLabel: string;
  htmlFor: string;
}) => {
  return (
    <div className="mb-[15px] flex flex-col items-center gap-5">
      <LabelForm
        className="text-violet11  text-right text-[15px]"
        titleLabel={titleLabel}
        htmlFor={htmlFor}
      />
      <Input
        className="text-violet11  shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
        type="number"
        step={step}
        {...props}
      />
    </div>
  );
};

export default FormNumberInput;
