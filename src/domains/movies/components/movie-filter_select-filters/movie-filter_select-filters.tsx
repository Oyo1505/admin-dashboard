import LabelForm from '@/domains/ui/components/label-form/label-form';
import { SelectFiltersProps } from '@/models/movie/movie';

const SelectFilters = ({
  onChange,
  filters,
  filterKey,
  displayedOptionValues,
  titleLabel,
  defaultValue,
  isClearing = false,
}: SelectFiltersProps) => {
  const selectValue = isClearing
    ? ''
    : ((filterKey && filters?.[filterKey]?.toString()) ?? '');

  return (
    <div className="flex flex-col gap-2 md:w-64">
      <LabelForm
        titleLabel={titleLabel}
        className="hidden"
        htmlFor={titleLabel}
      />
      <select
        aria-label={titleLabel}
        aria-describedby={`${titleLabel}-description`}
        onChange={onChange}
        value={selectValue}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5"
      >
        {displayedOptionValues}
      </select>
    </div>
  );
};

export default SelectFilters;
