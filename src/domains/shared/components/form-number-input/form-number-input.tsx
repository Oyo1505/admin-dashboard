import { Input } from '@/domains/ui/components/input/input';
import LabelForm from '@/domains/ui/components/label-form/label-form';
import { FORM_FIELD_CLASS, FORM_LABEL_CLASS } from '../form-field-styles';

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
        className={FORM_LABEL_CLASS}
        titleLabel={titleLabel}
        htmlFor={htmlFor}
      />
      <Input
        id={htmlFor}
        className={`${FORM_FIELD_CLASS} h-[35px]`}
        type="number"
        step={step}
        {...props}
      />
    </div>
  );
};

export default FormNumberInput;
