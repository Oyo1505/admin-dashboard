import { useTranslations } from 'next-intl';
import React, { type JSX } from 'react';
import cn from 'clsx';

const Title = ({
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
};

export default Title;
