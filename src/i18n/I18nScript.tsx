/**
 * Inline script that runs before React hydrates so <html lang> matches
 * the user's preferred locale on first paint. Prevents the brief
 * English flash before client JS swaps in their language.
 */
const SCRIPT = `(function(){try{var l=localStorage.getItem('bb_locale');if(['en','fr','es','de','ja','zh'].indexOf(l)>=0)document.documentElement.lang=l;}catch(e){}})();`;

export function I18nScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
