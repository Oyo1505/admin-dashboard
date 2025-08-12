import { useTranslations } from 'next-intl'
import React from 'react'
import cn from 'clsx';

type TypeTitleType = 'span' | 'div' | 'p'

const Text = (
  {
    translationTheme,
    translationText,
    type = 'div',
    text,
    children,
    className,
    textColor,
  }
    : {
      translationTheme?: string,
      translationText?: string,
      type?: TypeTitleType,
      text?: string,
      textColor?: string,
      children?: React.ReactNode,
      className?: string
    }) => {
  const t = useTranslations(translationTheme || '');
  const Tag = React.createElement;

  return (
    Tag(type.toLowerCase(), { className: cn(className, textColor) }, [
      text || (translationText && translationTheme && t(translationText)),
      children
    ])
  );
};

export default Text
