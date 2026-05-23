/**
 * Inline script that runs before React hydrates so the theme is applied
 * on the very first paint — no flash of the wrong palette during SSR.
 * Reads bb_theme from localStorage, falls back to "warm" (the default).
 */
const SCRIPT = `(function(){try{var t=localStorage.getItem('bb_theme');if(t!=='warm'&&t!=='light'&&t!=='dark')t='warm';document.documentElement.classList.add('theme-'+t);}catch(e){document.documentElement.classList.add('theme-warm');}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
