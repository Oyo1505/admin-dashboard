import React from 'react';

const LabelForm = ({
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
};

export default LabelForm;
