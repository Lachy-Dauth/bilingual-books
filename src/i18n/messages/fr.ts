import type { TKey } from './en';

export const fr: Record<TKey, string> = {
  'nav.convert': 'Convertir',
  'nav.dashboard': 'Tableau de bord',
  'nav.admin': 'Admin',
  'nav.signIn': 'Se connecter',
  'nav.signUp': "S'inscrire",
  'nav.signOut': 'Se déconnecter',
  'nav.language': 'Langue',

  'footer.tagline': 'Générateur de livres bilingues libre et open source.',
  'footer.privacy': 'Confidentialité',
  'footer.terms': "Conditions d'utilisation",
  'footer.cookiePreferences': 'Préférences des cookies',

  'tab.paste': 'Coller du texte',
  'tab.epub': 'Charger un EPUB',
  'tab.popular': 'Livres populaires',
  'tab.gutenberg': 'Rechercher dans Gutenberg',

  'converter.title': 'Générateur de livres bilingues',
  'converter.info': 'Informations',

  'common.sourceLanguage': 'Langue source',
  'common.targetLanguage': 'Langue cible',
  'common.bookTitle': 'Titre du livre',
  'common.generate': 'Générer le livre',
  'common.translating': 'Traduction en cours…',
  'common.cancel': 'Annuler',
  'common.download': "Télécharger l'EPUB",
  'common.saveAsPdf': 'Enregistrer en PDF',
  'common.startOver': 'Recommencer',
  'common.search': 'Rechercher',
  'common.searching': 'Recherche…',
  'common.loading': 'Chargement…',
  'common.convertEpub': "Convertir l'EPUB",
  'common.email': 'E-mail',
  'common.password': 'Mot de passe',
  'common.or': 'ou',
  'common.thanksBmc': "Ça vous a plu ? Offrez-moi un café",
  'common.buyMeACoffee': 'Offrir un café',

  'auth.signIn.title': 'Se connecter',
  'auth.signIn.submit': 'Se connecter',
  'auth.signIn.submitting': 'Connexion…',
  'auth.signIn.failed': 'Échec de la connexion',
  'auth.signIn.continueGoogle': 'Continuer avec Google',
  'auth.signIn.newHere': 'Nouveau ici ?',
  'auth.signIn.createAccount': 'Créer un compte',

  'auth.signUp.title': 'Créer un compte',
  'auth.signUp.name': 'Nom (facultatif)',
  'auth.signUp.submit': 'Créer le compte',
  'auth.signUp.submitting': 'Création…',
  'auth.signUp.failed': "Échec de l'inscription",
  'auth.signUp.haveAccount': 'Déjà un compte ?',

  'auth.signOut.message': 'Déconnexion…',

  'dashboard.title': 'Votre tableau de bord',
  'dashboard.plan': 'Forfait',
  'dashboard.adminTag': 'admin',
  'dashboard.cards.books': 'Livres convertis',
  'dashboard.cards.words': 'Mots traduits',
  'dashboard.cards.topPair': 'Paire principale',
  'dashboard.cards.sources': 'Sources utilisées',
  'dashboard.cards.booksSub': '{count} livre(s)',
  'dashboard.recent': 'Conversions récentes',
  'dashboard.dangerZone': 'Zone sensible',

  'delete.button': 'Supprimer le compte',
  'delete.confirmTitle': 'Supprimer votre compte ?',
  'delete.confirmBody':
    'Cette action est définitive. Votre compte, vos sessions et vos liaisons OAuth sont supprimés. Les conversions passées restent dans les statistiques agrégées mais ne vous sont plus rattachées.',
  'delete.confirmYes': 'Oui, supprimer mon compte',
  'delete.deleting': 'Suppression…',

  'table.empty': 'Aucune conversion pour le moment.',
  'table.when': 'Date',
  'table.title': 'Titre',
  'table.languages': 'Langues',
  'table.words': 'Mots',
  'table.source': 'Source',
  'table.status': 'Statut',

  'paste.sourceLangPlaceholder': 'ex. fr',
  'paste.targetLangPlaceholder': 'ex. en',
  'paste.bookTitlePlaceholder': 'Mon livre bilingue',
  'paste.sourceText': 'Texte source',
  'paste.sourceTextHint':
    'Le texte est découpé aux points, une paire par phrase.',
  'paste.sourceTextPlaceholder': 'Entrez votre texte ici...',
  'paste.cancelled': 'Annulé. Traduction partielle affichée.',

  'epub.file': 'Fichier EPUB',
  'epub.fileHint':
    'Choisissez un fichier EPUB. Chapitres et paragraphes seront détectés automatiquement.',
  'epub.reading': "Lecture de l'EPUB…",
  'epub.loaded': 'Chargé : {chapters} chapitres, {blocks} blocs.',
  'epub.couldNotRead': "Impossible de lire l'EPUB : {error}",
  'epub.info.title': 'Titre',
  'epub.info.author': 'Auteur',
  'epub.info.language': 'Langue détectée',
  'epub.info.chapters': 'Chapitres',
  'epub.info.sentences': 'Phrases / titres',
  'epub.info.paragraphs': 'Paragraphes / titres',
  'epub.titleOverride': 'Titre du livre (remplacer)',
  'epub.titleOverridePlaceholder':
    "Laissez vide pour conserver le titre d'origine",
  'epub.advanced': 'Options avancées',
  'epub.langPlaceholderEn': 'ex. en',
  'epub.langPlaceholderFr': 'ex. fr',

  'split.label': 'Découpage de la traduction par',
  'split.paragraph': 'Paragraphe',
  'split.sentence': 'Phrase',
  'split.sentenceAligned': 'Phrase (alignée)',

  'speed.label': 'Vitesse',
  'speed.slow': 'Lente',
  'speed.normal': 'Normale',
  'speed.fast': 'Rapide',

  'breaks.label': 'Sauts de ligne (<br>)',
  'breaks.preserve': 'Préserver',
  'breaks.collapse': 'Fusionner',

  'limit.exceeded':
    'Limite mensuelle atteinte : {used}/{limit} mots sur le forfait {plan}. Passez au forfait supérieur pour continuer.',
  'limit.blocked': 'Conversion bloquée : {reason}',
  'limit.usage': '{used} sur {limit} mots utilisés ce mois ({plan}).',

  'gutenberg.searchPlaceholder': "Rechercher un titre ou un auteur…",
  'gutenberg.searchHint':
    "Recherche dans Project Gutenberg via gutendex. L'EPUB est préféré quand il est disponible.",
  'popular.heading':
    'Les {n} livres les plus téléchargés sur Project Gutenberg pour la langue choisie, classés par nombre de téléchargements.',
  'popular.language': 'Langue',
  'popular.languagePlaceholder': 'ex. en, fr, es',
  'popular.loading': 'Chargement des livres populaires…',
  'popular.empty':
    "Aucun livre populaire trouvé pour « {lang} ». Vérifiez le code de langue.",
  'gutenberg.downloads': '{count} téléchargements',
  'gutenberg.languagesList': 'Langues : {langs}',
  'gutenberg.unknownAuthor': 'Inconnu',

  'info.title': 'Informations',
  'info.intro':
    'Cet outil génère une édition bilingue en regard de n\'importe quel texte. Choisissez la source qui correspond à ce que vous avez.',
  'info.paste.h': 'Coller du texte',
  'info.paste.body':
    "Collez un passage dans la zone source : le générateur le découpe aux points, traduit chaque phrase et assemble un EPUB à un seul chapitre. Idéal pour les nouvelles, articles ou tout texte copié depuis une page web ou un PDF.",
  'info.epub.h': 'Charger un EPUB',
  'info.epub.body':
    "Sélectionnez un fichier .epub : le générateur parcourt les chapitres, traduit paragraphes et titres, puis reconstruit un EPUB bilingue en préservant les chapitres et la couverture. Idéal pour les livres complets.",
  'info.gutenberg.h': 'Rechercher dans Project Gutenberg',
  'info.gutenberg.body':
    "Recherchez dans le catalogue de Project Gutenberg, choisissez un livre du domaine public, et l'outil télécharge l'EPUB puis le convertit comme pour l'upload.",
  'info.saveEpub.h': 'Enregistrer en EPUB',
  'info.saveEpub.body':
    "Une fois la génération terminée, un bouton « Télécharger l'EPUB » apparaît en haut. Cliquez pour enregistrer l'édition bilingue en EPUB standard.",
  'info.savePdf.h': 'Enregistrer en PDF',
  'info.savePdf.body':
    "Lorsque le livre bilingue est à l'écran, cliquez sur « Enregistrer en PDF » dans la barre du haut. La fenêtre d'impression de votre navigateur s'ouvre avec une mise en page sans interface — choisissez « Enregistrer au format PDF » comme destination.",

  'consent.text':
    "Nous utilisons un cookie propriétaire pour les statistiques de conversion anonymes (nécessaire pour que le site mémorise vos livres) et, en option, Google Analytics pour comprendre le trafic. Consultez notre",
  'consent.privacyLink': 'Politique de confidentialité',
  'consent.reject': 'Refuser les statistiques',
  'consent.accept': 'Accepter',

  'policy.lastUpdated': 'Dernière mise à jour',
  'policy.englishOnlyNote':
    "Ce document fait foi dans sa version anglaise. Les traductions des autres éléments d'interface sont fournies à titre indicatif.",
};
