export const en = {
  // Navigation
  'nav.convert': 'Convert',
  'nav.dashboard': 'Dashboard',
  'nav.admin': 'Admin',
  'nav.signIn': 'Sign in',
  'nav.signUp': 'Sign up',
  'nav.signOut': 'Sign out',
  'nav.language': 'Language',

  // Footer
  'footer.tagline': 'Free, open-source bilingual book generator.',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Terms',
  'footer.cookiePreferences': 'Cookie preferences',

  // Converter tabs
  'tab.paste': 'Paste text',
  'tab.epub': 'Upload EPUB',
  'tab.popular': 'Popular books',
  'tab.gutenberg': 'Search Gutenberg',

  // Converter shell
  'converter.title': 'Bilingual Book Generator',
  'converter.info': 'Information',

  // Common buttons / labels
  'common.sourceLanguage': 'Source language',
  'common.targetLanguage': 'Target language',
  'common.bookTitle': 'Book title',
  'common.generate': 'Generate Book',
  'common.translating': 'Translating…',
  'common.cancel': 'Cancel',
  'common.download': 'Download EPUB',
  'common.saveAsPdf': 'Save as PDF',
  'common.startOver': 'Start over',
  'common.search': 'Search',
  'common.searching': 'Searching…',
  'common.loading': 'Loading…',
  'common.convertEpub': 'Convert EPUB',
} as const;

export type TKey = keyof typeof en;
