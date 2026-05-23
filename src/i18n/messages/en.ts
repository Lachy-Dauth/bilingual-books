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
  'common.email': 'Email',
  'common.password': 'Password',
  'common.or': 'or',
  'common.thanksBmc': 'Liked it? Buy me a coffee',
  'common.buyMeACoffee': 'Buy me a coffee',

  // Auth — sign in
  'auth.signIn.title': 'Sign in',
  'auth.signIn.submit': 'Sign in',
  'auth.signIn.submitting': 'Signing in…',
  'auth.signIn.failed': 'Sign in failed',
  'auth.signIn.continueGoogle': 'Continue with Google',
  'auth.signIn.newHere': 'New here?',
  'auth.signIn.createAccount': 'Create an account',

  // Auth — sign up
  'auth.signUp.title': 'Create account',
  'auth.signUp.name': 'Name (optional)',
  'auth.signUp.submit': 'Create account',
  'auth.signUp.submitting': 'Creating…',
  'auth.signUp.failed': 'Sign up failed',
  'auth.signUp.haveAccount': 'Already have an account?',

  // Auth — sign out
  'auth.signOut.message': 'Signing out…',

  // Dashboard
  'dashboard.title': 'Your dashboard',
  'dashboard.plan': 'Plan',
  'dashboard.adminTag': 'admin',
  'dashboard.cards.books': 'Books converted',
  'dashboard.cards.words': 'Words translated',
  'dashboard.cards.topPair': 'Top pair',
  'dashboard.cards.sources': 'Sources used',
  'dashboard.cards.booksSub': '{count} book(s)',
  'dashboard.recent': 'Recent conversions',
  'dashboard.dangerZone': 'Danger zone',

  // Delete account
  'delete.button': 'Delete account',
  'delete.confirmTitle': 'Delete your account?',
  'delete.confirmBody':
    'This is permanent. Your user record, sessions, and OAuth links are removed. Past conversions stay in aggregate stats but are no longer linked to you.',
  'delete.confirmYes': 'Yes, delete my account',
  'delete.deleting': 'Deleting…',

  // Conversion table
  'table.empty': 'No conversions yet.',
  'table.when': 'When',
  'table.title': 'Title',
  'table.languages': 'Languages',
  'table.words': 'Words',
  'table.source': 'Source',
  'table.status': 'Status',

  // Paste tab
  'paste.sourceLangPlaceholder': 'e.g. fr',
  'paste.targetLangPlaceholder': 'e.g. en',
  'paste.bookTitlePlaceholder': 'My Bilingual Book',
  'paste.sourceText': 'Source text',
  'paste.sourceTextHint': 'Text is split at full stops, one pair per sentence.',
  'paste.sourceTextPlaceholder': 'Enter your source text here...',
  'paste.cancelled': 'Cancelled. Showing partial translation.',

  // EPUB tab
  'epub.file': 'EPUB file',
  'epub.fileHint':
    'Choose an EPUB file. Chapters and paragraphs will be detected automatically.',
  'epub.reading': 'Reading EPUB…',
  'epub.loaded': 'Loaded: {chapters} chapters, {blocks} blocks.',
  'epub.couldNotRead': 'Could not read EPUB: {error}',
  'epub.info.title': 'Title',
  'epub.info.author': 'Author',
  'epub.info.language': 'Detected language',
  'epub.info.chapters': 'Chapters',
  'epub.info.sentences': 'Sentences / headings',
  'epub.info.paragraphs': 'Paragraphs / headings',
  'epub.titleOverride': 'Book title (override)',
  'epub.titleOverridePlaceholder': 'Leave blank to keep the original title',
  'epub.advanced': 'Advanced options',
  'epub.langPlaceholderEn': 'e.g. en',
  'epub.langPlaceholderFr': 'e.g. fr',

  // Split mode
  'split.label': 'Split translation by',
  'split.paragraph': 'Paragraph',
  'split.sentence': 'Sentence',
  'split.sentenceAligned': 'Sentence (aligned)',

  // Speed
  'speed.label': 'Speed',
  'speed.slow': 'Slow',
  'speed.normal': 'Normal',
  'speed.fast': 'Fast',

  // Line breaks
  'breaks.label': 'Line breaks (<br>)',
  'breaks.preserve': 'Preserve',
  'breaks.collapse': 'Collapse',

  // Limit messages
  'limit.exceeded':
    'Monthly limit reached: {used}/{limit} words on plan {plan}. Upgrade to convert more this month.',
  'limit.blocked': 'Conversion blocked: {reason}',
  'limit.usage': '{used} of {limit} words used this month ({plan} plan).',

  // Gutenberg + popular tabs
  'gutenberg.searchPlaceholder': 'Search title or author…',
  'gutenberg.searchHint':
    'Searches Project Gutenberg via gutendex. EPUB is preferred when available.',
  'popular.heading':
    'Top {n} most-downloaded books on Project Gutenberg for the chosen language, ranked by download count.',
  'popular.language': 'Language',
  'popular.languagePlaceholder': 'e.g. en, fr, es',
  'popular.loading': 'Loading popular books…',
  'popular.empty':
    'No popular books found for "{lang}". Check the language code.',
  'gutenberg.downloads': '{count} downloads',
  'gutenberg.languagesList': 'Languages: {langs}',
  'gutenberg.unknownAuthor': 'Unknown',

  // Info modal
  'info.title': 'Information',
  'info.intro':
    'This tool generates a side-by-side bilingual edition of any text you give it. Pick the input that matches what you have.',
  'info.paste.h': 'Paste text',
  'info.paste.body':
    'Drop any passage into the source box and the generator splits it at full stops, translates each sentence, and packages the pairs into a single-chapter EPUB. Best for short stories, articles, or anything you can copy out of a webpage or PDF.',
  'info.epub.h': 'Upload EPUB',
  'info.epub.body':
    'Pick an existing .epub file and the generator parses its spine, walks every chapter\'s paragraphs and headings, translates each block, and assembles a new bilingual EPUB that preserves chapter boundaries and the cover image. Best for full books.',
  'info.gutenberg.h': 'Search Project Gutenberg',
  'info.gutenberg.body':
    'Search the Project Gutenberg catalog for public-domain books, pick one, and the generator downloads the EPUB and converts it just like the upload flow.',
  'info.saveEpub.h': 'Saving as EPUB',
  'info.saveEpub.body':
    'When generation finishes, a Download EPUB button appears at the top of the page. Click it to save the bilingual edition as a standard EPUB.',
  'info.savePdf.h': 'Saving as PDF',
  'info.savePdf.body':
    'When the bilingual book is on screen, click Save as PDF in the bar at the top. Your browser\'s print dialog opens with the layout already stripped of UI chrome — pick "Save as PDF" as the destination and confirm.',

  // Consent banner
  'consent.text':
    'We use a first-party cookie for anonymous conversion stats (required for the site to remember your books) and optionally Google Analytics to understand traffic. Read our',
  'consent.privacyLink': 'Privacy Policy',
  'consent.reject': 'Reject analytics',
  'consent.accept': 'Accept',

  // Policy pages (translated headings; bodies stay English as the
  // legally-authoritative version)
  'policy.lastUpdated': 'Last updated',
  'policy.englishOnlyNote':
    'This document is the legally-binding English version. Translations of other UI elements are best-effort.',
} as const;

export type TKey = keyof typeof en;
