import cn from 'clsx';
import { useTranslations } from 'next-intl';
import React, { memo } from 'react';

type TypeTitleType = 'span' | 'div' | 'p';

const Text = memo(
  ({
    translationTheme,
    translationText,
    type = 'div',
    text,
    children,
    className,
    textColor,
  }: {
    translationTheme?: string;
    translationText?: string;
    type?: TypeTitleType;
    text?: string;
    textColor?: string;
    children?: React.ReactNode;
    className?: string;
  }) => {
    const t = useTranslations(translationTheme || '');
    const Tag = React.createElement;

    return Tag(type.toLowerCase(), { className: cn(className, textColor) }, [
      text || (translationText && translationTheme && t(translationText)),
      children,
    ]);
  }
);
Text.displayName = 'Text';
export default Text;
