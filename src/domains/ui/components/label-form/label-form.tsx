import { memo } from 'react';

const LabelForm = memo(
  ({
    className,
    titleLabel,
    htmlFor,
    role,
    ...props
  }: {
    className?: string;
    titleLabel: string;
    htmlFor: string;
    role?: string;
  }) => {
    return (
      <label className={className} htmlFor={htmlFor} role={role} {...props}>
        {titleLabel}
      </label>
    );
  }
);
LabelForm.displayName = 'LabelForm';
export default LabelForm;
