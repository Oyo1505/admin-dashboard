'use client'
import React, { ChangeEvent, useState } from 'react'
import { Input } from '../input/input';

const Fieldset = ({ label, id, defaultValue }: { label: string, id: string, defaultValue?: string }) => {
  const [value, setValue] = useState<string>();

  const handleChange = (event:ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };
  return (
    <div className="mb-[15px] flex items-center gap-5">
      <label className="text-violet11 w-[90px] text-right text-[15px]" htmlFor={id}>
        {label}
      </label>
      <Input
        className="text-violet11 shadow-violet7 focus:shadow-violet8 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] text-[15px] leading-none shadow-[0_0_0_1px] outline-hidden focus:shadow-[0_0_0_2px]"
        id={id}
        defaultValue={defaultValue}
        onChange={handleChange}
        value={value}
      />
    </div>
  );
}

export default Fieldset