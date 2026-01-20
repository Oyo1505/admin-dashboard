import LabelForm from '@/domains/ui/components/label-form/label-form';
import SelectInput from '@/domains/ui/components/select/select';

type formData = {
  langage: string | undefined;
  country: string | undefined;
  idGoogleDive: string;
};

type FromSelectInput = {
  locale: string;
  formData: formData;
  optionsList: Array<{ value: string; label: Record<string, string> }>;
  formDataKey: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // eslint-disable-line no-unused-vars
  titleLabel: string;
  htmlFor: string;
};

const FromSelectInput = ({
  locale,
  formData,
  optionsList,
  formDataKey,
  onChange,
  titleLabel,
  htmlFor,
}: FromSelectInput) => {
  return (
    <div className="mb-[15px] flex flex-col items-center gap-5">
      <LabelForm
        className="text-violet11  text-right text-[15px]"
        titleLabel={titleLabel}
        htmlFor={htmlFor}
      />
      <SelectInput
        id={htmlFor}
        optionsList={optionsList}
        formData={formData}
        formDataKey={formDataKey}
        locale={locale}
        onChange={onChange}
      />
    </div>
  );
};

export default FromSelectInput;
