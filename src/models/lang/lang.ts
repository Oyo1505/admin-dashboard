/* eslint-disable no-unused-vars */
export enum Locale {
  FR = 'fr',
  EN = 'en',
  JP = 'jp',
}
export interface Language {
  value: string;
  label: {
    fr: string;
    jp: string;
    en: string;
  };
}
export type SelectLanguageProps = {
  language?: string;
  // eslint-disable-next-line no-unused-vars
  onChangeLanguage: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  filters?: { language?: string };
  listLanguages: Language[];
};

export type SelectSubtitlesProps = {
  subtitles?: string;
  // eslint-disable-next-line no-unused-vars
  onChangeSubtitles: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  filters?: { subtitles?: string };
};
