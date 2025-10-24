import React from 'react';

const LabelGenre = ({
  nameFR,
  nameEN,
  nameJP,
  onClick,
  locale,
}: {
  nameFR: string;
  nameEN: string;
  nameJP: string;
  onClick: React.MouseEventHandler<HTMLSpanElement>;
  locale: string;
}) => {
  const genreName =
    locale === 'fr' ? nameFR : locale === 'en' ? nameEN : nameJP;
  return (
    <div className="text-black rounded-sm pr-4 pl-2 relative bg-primary text-center  min-w-16 ">
      {locale === 'fr' ? nameFR : locale === 'en' ? nameEN : nameJP}{' '}
      <button
        type="button"
        aria-label={`Supprimer le genre ${genreName}`}
        onClick={onClick}
        className="text-xs absolute top-0 right-1 hover:cursor-pointer"
      >
        x
      </button>
    </div>
  );
};

export default LabelGenre;
