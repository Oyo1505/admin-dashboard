import { Checkbox } from '@/domains/ui/components/checkbox/checkbox';
import LabelForm from '@/domains/ui/components/label-form/label-form';

type FormCheckBox = {
  checked: Array<string>;
  titleLabel: string;
  onChange: () => void;
  value: string;
  id: string;
};

const FormCheckBox = ({
  onChange,
  checked,
  id,
  value,
  titleLabel,
  ...props
}: FormCheckBox) => {
  return (
    <>
      <Checkbox
        id={id}
        value={value}
        checked={checked.includes(value)}
        onChange={onChange}
        {...props}
      />
      <LabelForm
        className="text-violet11  text-right text-[15px]"
        titleLabel={titleLabel}
        htmlFor={id}
      />
    </>
  );
};
export default FormCheckBox;
