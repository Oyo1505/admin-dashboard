import LabelForm from '@/domains/ui/components/label-form/label-form';
import { Textarea } from '@/domains/ui/components/textarea/textarea';
import { FORM_FIELD_CLASS, FORM_LABEL_CLASS } from '../form-field-styles';

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
        className={FORM_LABEL_CLASS}
        titleLabel={titleLabel}
        htmlFor={htmlFor}
      />
      <Textarea
        id={htmlFor}
        className={`${FORM_FIELD_CLASS} min-h-24 py-2`}
        {...props}
      />
    </div>
  );
};

export default FormTextAreaInput;
