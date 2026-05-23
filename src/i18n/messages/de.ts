import type { TKey } from './en';

export const de: Record<TKey, string> = {
  'nav.convert': 'Konvertieren',
  'nav.dashboard': 'Dashboard',
  'nav.admin': 'Admin',
  'nav.signIn': 'Anmelden',
  'nav.signUp': 'Registrieren',
  'nav.signOut': 'Abmelden',
  'nav.language': 'Sprache',

  'footer.tagline':
    'Kostenloser Open-Source-Generator für zweisprachige Bücher.',
  'footer.privacy': 'Datenschutz',
  'footer.terms': 'AGB',
  'footer.cookiePreferences': 'Cookie-Einstellungen',

  'tab.paste': 'Text einfügen',
  'tab.epub': 'EPUB hochladen',
  'tab.popular': 'Beliebte Bücher',
  'tab.gutenberg': 'Gutenberg durchsuchen',

  'converter.title': 'Zweisprachiger Buchgenerator',
  'converter.info': 'Information',

  'common.sourceLanguage': 'Quellsprache',
  'common.targetLanguage': 'Zielsprache',
  'common.bookTitle': 'Buchtitel',
  'common.generate': 'Buch erstellen',
  'common.translating': 'Übersetzen…',
  'common.cancel': 'Abbrechen',
  'common.download': 'EPUB herunterladen',
  'common.saveAsPdf': 'Als PDF speichern',
  'common.startOver': 'Neu beginnen',
  'common.search': 'Suchen',
  'common.searching': 'Suche…',
  'common.loading': 'Wird geladen…',
  'common.convertEpub': 'EPUB konvertieren',
  'common.email': 'E-Mail',
  'common.password': 'Passwort',
  'common.or': 'oder',
  'common.thanksBmc': 'Gefallen? Spendier mir einen Kaffee',
  'common.buyMeACoffee': 'Kauf mir einen Kaffee',

  'auth.signIn.title': 'Anmelden',
  'auth.signIn.submit': 'Anmelden',
  'auth.signIn.submitting': 'Anmeldung…',
  'auth.signIn.failed': 'Anmeldung fehlgeschlagen',
  'auth.signIn.continueGoogle': 'Mit Google fortfahren',
  'auth.signIn.newHere': 'Neu hier?',
  'auth.signIn.createAccount': 'Konto erstellen',

  'auth.signUp.title': 'Konto erstellen',
  'auth.signUp.name': 'Name (optional)',
  'auth.signUp.submit': 'Konto erstellen',
  'auth.signUp.submitting': 'Erstellen…',
  'auth.signUp.failed': 'Registrierung fehlgeschlagen',
  'auth.signUp.haveAccount': 'Schon ein Konto?',

  'auth.signOut.message': 'Abmeldung…',

  'dashboard.title': 'Dein Dashboard',
  'dashboard.plan': 'Tarif',
  'dashboard.adminTag': 'admin',
  'dashboard.cards.books': 'Bücher konvertiert',
  'dashboard.cards.words': 'Wörter übersetzt',
  'dashboard.cards.topPair': 'Top-Paar',
  'dashboard.cards.sources': 'Verwendete Quellen',
  'dashboard.cards.booksSub': '{count} Buch/Bücher',
  'dashboard.recent': 'Letzte Konvertierungen',
  'dashboard.dangerZone': 'Gefahrenbereich',

  'delete.button': 'Konto löschen',
  'delete.confirmTitle': 'Konto löschen?',
  'delete.confirmBody':
    'Dies ist endgültig. Dein Benutzerdatensatz, Sessions und OAuth-Verknüpfungen werden entfernt. Vergangene Konvertierungen bleiben in der aggregierten Statistik, sind aber nicht mehr mit dir verknüpft.',
  'delete.confirmYes': 'Ja, mein Konto löschen',
  'delete.deleting': 'Wird gelöscht…',

  'table.empty': 'Noch keine Konvertierungen.',
  'table.when': 'Wann',
  'table.title': 'Titel',
  'table.languages': 'Sprachen',
  'table.words': 'Wörter',
  'table.source': 'Quelle',
  'table.status': 'Status',

  'paste.sourceLangPlaceholder': 'z. B. fr',
  'paste.targetLangPlaceholder': 'z. B. en',
  'paste.bookTitlePlaceholder': 'Mein zweisprachiges Buch',
  'paste.sourceText': 'Quelltext',
  'paste.sourceTextHint':
    'Der Text wird an Satzenden geteilt, ein Paar pro Satz.',
  'paste.sourceTextPlaceholder': 'Quelltext hier eingeben...',
  'paste.cancelled': 'Abgebrochen. Teilweise Übersetzung angezeigt.',

  'epub.file': 'EPUB-Datei',
  'epub.fileHint':
    'Wähle eine EPUB-Datei. Kapitel und Absätze werden automatisch erkannt.',
  'epub.reading': 'EPUB wird gelesen…',
  'epub.loaded': 'Geladen: {chapters} Kapitel, {blocks} Blöcke.',
  'epub.couldNotRead': 'EPUB konnte nicht gelesen werden: {error}',
  'epub.info.title': 'Titel',
  'epub.info.author': 'Autor',
  'epub.info.language': 'Erkannte Sprache',
  'epub.info.chapters': 'Kapitel',
  'epub.info.sentences': 'Sätze / Überschriften',
  'epub.info.paragraphs': 'Absätze / Überschriften',
  'epub.titleOverride': 'Buchtitel (überschreiben)',
  'epub.titleOverridePlaceholder':
    'Leer lassen, um den Originaltitel zu behalten',
  'epub.advanced': 'Erweiterte Optionen',
  'epub.langPlaceholderEn': 'z. B. en',
  'epub.langPlaceholderFr': 'z. B. fr',

  'split.label': 'Übersetzung aufteilen nach',
  'split.paragraph': 'Absatz',
  'split.sentence': 'Satz',
  'split.sentenceAligned': 'Satz (ausgerichtet)',

  'speed.label': 'Geschwindigkeit',
  'speed.slow': 'Langsam',
  'speed.normal': 'Normal',
  'speed.fast': 'Schnell',

  'breaks.label': 'Zeilenumbrüche (<br>)',
  'breaks.preserve': 'Behalten',
  'breaks.collapse': 'Zusammenführen',

  'limit.exceeded':
    'Monatslimit erreicht: {used}/{limit} Wörter im Tarif {plan}. Upgrade, um mehr zu konvertieren.',
  'limit.blocked': 'Konvertierung blockiert: {reason}',
  'limit.usage':
    '{used} von {limit} Wörtern in diesem Monat verbraucht (Tarif {plan}).',

  'gutenberg.searchPlaceholder': 'Titel oder Autor suchen…',
  'gutenberg.searchHint':
    'Sucht über gutendex in Project Gutenberg. EPUB wird bevorzugt, wenn verfügbar.',
  'popular.heading':
    'Die {n} meistgeladenen Bücher auf Project Gutenberg in der gewählten Sprache, nach Download-Zahl sortiert.',
  'popular.language': 'Sprache',
  'popular.languagePlaceholder': 'z. B. en, fr, es',
  'popular.loading': 'Lade beliebte Bücher…',
  'popular.empty':
    'Keine beliebten Bücher für "{lang}" gefunden. Sprachcode prüfen.',
  'gutenberg.downloads': '{count} Downloads',
  'gutenberg.languagesList': 'Sprachen: {langs}',
  'gutenberg.unknownAuthor': 'Unbekannt',

  'info.title': 'Information',
  'info.intro':
    'Dieses Tool erzeugt eine zweisprachige Ausgabe deines Texts, links der Originaltext, rechts die Übersetzung. Wähle die passende Eingabeart.',
  'info.paste.h': 'Text einfügen',
  'info.paste.body':
    'Füge einen Textabschnitt in das Quellfeld ein; das Tool teilt ihn an Satzenden, übersetzt jeden Satz und verpackt die Paare in ein EPUB mit einem Kapitel. Ideal für Kurzgeschichten, Artikel oder Texte aus Webseiten oder PDFs.',
  'info.epub.h': 'EPUB hochladen',
  'info.epub.body':
    'Wähle eine vorhandene .epub-Datei; das Tool liest ihre Struktur, durchläuft Absätze und Überschriften jedes Kapitels, übersetzt jeden Block und baut ein neues zweisprachiges EPUB, das Kapitelgrenzen und Cover behält. Ideal für ganze Bücher.',
  'info.gutenberg.h': 'Project Gutenberg durchsuchen',
  'info.gutenberg.body':
    'Durchsuche den Project-Gutenberg-Katalog nach gemeinfreien Büchern, wähle eins, und das Tool lädt das EPUB herunter und konvertiert es wie beim Upload.',
  'info.saveEpub.h': 'Als EPUB speichern',
  'info.saveEpub.body':
    'Nach Abschluss erscheint oben ein Button "EPUB herunterladen". Klicke darauf, um die zweisprachige Ausgabe als Standard-EPUB zu speichern.',
  'info.savePdf.h': 'Als PDF speichern',
  'info.savePdf.body':
    'Wenn das zweisprachige Buch angezeigt wird, klicke oben auf "Als PDF speichern". Der Druckdialog des Browsers öffnet sich mit einem bereinigten Layout — wähle "Als PDF speichern" als Ziel und bestätige.',

  'consent.text':
    'Wir verwenden einen Erst-Party-Cookie für anonyme Konvertierungsstatistiken (erforderlich, damit die Seite deine Bücher merkt) und optional Google Analytics zur Traffic-Auswertung. Lies unsere',
  'consent.privacyLink': 'Datenschutzerklärung',
  'consent.reject': 'Analytics ablehnen',
  'consent.accept': 'Akzeptieren',

  'policy.lastUpdated': 'Zuletzt aktualisiert',
  'policy.englishOnlyNote':
    'Rechtsverbindlich ist die englische Fassung. Übersetzungen anderer Oberflächentexte sind nach bestem Bemühen erstellt.',
};
