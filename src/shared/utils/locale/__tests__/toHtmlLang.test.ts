import { toHtmlLang } from '../toHtmlLang';

describe('toHtmlLang', () => {
  it('should map the app Japanese locale to the BCP 47 tag', () => {
    expect(toHtmlLang('jp')).toBe('ja');
  });

  it.each(['fr', 'en'])('should keep %s unchanged', (locale) => {
    expect(toHtmlLang(locale)).toBe(locale);
  });
});
