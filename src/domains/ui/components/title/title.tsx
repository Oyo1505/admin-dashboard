import cn from 'clsx';
import { useTranslations } from 'next-intl';
import React, { memo, type JSX } from 'react';

const Title = memo(
  ({
    translationTheme,
    translationText,
    type = 'h1',
    text,
    children,
    className,
    textColor = 'text-primary',
  }: {
    translationTheme?: string;
    translationText?: string;
    type: string;
    text?: string;
    textColor?: string;
    children?: React.ReactNode;
    className?: string;
  }) => {
    const t = useTranslations(translationTheme);

    const Tag = type.toLowerCase() as keyof JSX.IntrinsicElements;

    return (
      <Tag className={cn(className, textColor)}>
        {text || t(translationText)}
        {children}
      </Tag>
    );
  }
);
Title.displayName = 'Title';
export default Title;
