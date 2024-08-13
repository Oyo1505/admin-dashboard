import { useTranslations } from 'next-intl'
import React from 'react'
import cn from 'clsx';

const Title = (
  { 
    translationTheme, 
    translationText, 
    type='h1', 
    text, 
    children, 
    className 
  }
  :{
    translationTheme?: string, 
    translationText?: string, 
    type: string, 
    text?: string, 
    children?: React.ReactNode, 
    className?: string 
  }) => {
  const t = useTranslations(translationTheme);

  const Tag = type.toLowerCase() as keyof JSX.IntrinsicElements;

  return (
    <Tag className={cn(className, 'text-primary')}>
      {text || t(translationText)}
      {children}
    </Tag>
  );
};


export default Title