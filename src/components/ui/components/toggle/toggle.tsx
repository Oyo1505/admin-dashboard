'use client'
import React from 'react'
import { Input } from '../input/input'
import { useTranslations } from 'next-intl';

const Toggle = ({toggle, publish, isFetching}: {toggle:any, publish:boolean | undefined, isFetching:boolean}) => {
  const t = useTranslations('Dashboard');
  
  return (
    publish === undefined ? null : (  
    <label className="inline-flex items-center cursor-pointer">
      <Input type="checkbox"  checked={publish} disabled={isFetching} value={publish? 'true': undefined} className="sr-only peer"  onChange={toggle} />
      <div className={`relative w-11 h-6 bg-gray-200  peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full ${publish === true ? 'rtl:peer-checked:after:-translate-x-full' : ''} peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600`}></div>
      <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">{publish ? t('toggleUnpublished') : t('togglePublished')}</span>
    </label>
  ))
}

export default Toggle