import React from 'react'

const LabelForm = ({ className, titleLabel, htmlFor }: { className: string, titleLabel: string, htmlFor: string }) => {
  return (
    <label className={className} htmlFor={htmlFor}>{titleLabel}</label>
  )
}

export default LabelForm