import type { TKey } from './en';

export const es: Record<TKey, string> = {
  'nav.convert': 'Convertir',
  'nav.dashboard': 'Panel',
  'nav.admin': 'Admin',
  'nav.signIn': 'Iniciar sesión',
  'nav.signUp': 'Registrarse',
  'nav.signOut': 'Cerrar sesión',
  'nav.language': 'Idioma',

  'footer.tagline': 'Generador de libros bilingües, libre y de código abierto.',
  'footer.privacy': 'Privacidad',
  'footer.terms': 'Términos',
  'footer.cookiePreferences': 'Preferencias de cookies',

  'tab.paste': 'Pegar texto',
  'tab.epub': 'Subir EPUB',
  'tab.popular': 'Libros populares',
  'tab.gutenberg': 'Buscar en Gutenberg',

  'converter.title': 'Generador de libros bilingües',
  'converter.info': 'Información',

  'common.sourceLanguage': 'Idioma de origen',
  'common.targetLanguage': 'Idioma de destino',
  'common.bookTitle': 'Título del libro',
  'common.generate': 'Generar libro',
  'common.translating': 'Traduciendo…',
  'common.cancel': 'Cancelar',
  'common.download': 'Descargar EPUB',
  'common.saveAsPdf': 'Guardar como PDF',
  'common.startOver': 'Empezar de nuevo',
  'common.search': 'Buscar',
  'common.searching': 'Buscando…',
  'common.loading': 'Cargando…',
  'common.convertEpub': 'Convertir EPUB',
  'common.email': 'Correo',
  'common.password': 'Contraseña',
  'common.or': 'o',
  'common.thanksBmc': '¿Te gustó? Invítame un café',
  'common.buyMeACoffee': 'Invítame un café',

  'auth.signIn.title': 'Iniciar sesión',
  'auth.signIn.submit': 'Iniciar sesión',
  'auth.signIn.submitting': 'Iniciando sesión…',
  'auth.signIn.failed': 'Error al iniciar sesión',
  'auth.signIn.continueGoogle': 'Continuar con Google',
  'auth.signIn.newHere': '¿Eres nuevo?',
  'auth.signIn.createAccount': 'Crear una cuenta',

  'auth.signUp.title': 'Crear cuenta',
  'auth.signUp.name': 'Nombre (opcional)',
  'auth.signUp.submit': 'Crear cuenta',
  'auth.signUp.submitting': 'Creando…',
  'auth.signUp.failed': 'Error al registrarse',
  'auth.signUp.haveAccount': '¿Ya tienes cuenta?',

  'auth.signOut.message': 'Cerrando sesión…',

  'dashboard.title': 'Tu panel',
  'dashboard.plan': 'Plan',
  'dashboard.adminTag': 'admin',
  'dashboard.cards.books': 'Libros convertidos',
  'dashboard.cards.words': 'Palabras traducidas',
  'dashboard.cards.topPair': 'Par principal',
  'dashboard.cards.sources': 'Fuentes usadas',
  'dashboard.cards.booksSub': '{count} libro(s)',
  'dashboard.recent': 'Conversiones recientes',
  'dashboard.dangerZone': 'Zona crítica',

  'delete.button': 'Eliminar cuenta',
  'delete.confirmTitle': '¿Eliminar tu cuenta?',
  'delete.confirmBody':
    'Esto es permanente. Se eliminan tu registro de usuario, sesiones y enlaces OAuth. Las conversiones pasadas permanecen en las estadísticas agregadas pero ya no estarán vinculadas a ti.',
  'delete.confirmYes': 'Sí, eliminar mi cuenta',
  'delete.deleting': 'Eliminando…',

  'table.empty': 'Aún no hay conversiones.',
  'table.when': 'Cuándo',
  'table.title': 'Título',
  'table.languages': 'Idiomas',
  'table.words': 'Palabras',
  'table.source': 'Fuente',
  'table.status': 'Estado',

  'paste.sourceLangPlaceholder': 'p. ej. fr',
  'paste.targetLangPlaceholder': 'p. ej. en',
  'paste.bookTitlePlaceholder': 'Mi libro bilingüe',
  'paste.sourceText': 'Texto fuente',
  'paste.sourceTextHint':
    'El texto se divide en puntos finales, un par por oración.',
  'paste.sourceTextPlaceholder': 'Escribe tu texto aquí...',
  'paste.cancelled': 'Cancelado. Mostrando traducción parcial.',

  'epub.file': 'Archivo EPUB',
  'epub.fileHint':
    'Elige un archivo EPUB. Los capítulos y párrafos se detectarán automáticamente.',
  'epub.reading': 'Leyendo el EPUB…',
  'epub.loaded': 'Cargado: {chapters} capítulos, {blocks} bloques.',
  'epub.couldNotRead': 'No se pudo leer el EPUB: {error}',
  'epub.info.title': 'Título',
  'epub.info.author': 'Autor',
  'epub.info.language': 'Idioma detectado',
  'epub.info.chapters': 'Capítulos',
  'epub.info.sentences': 'Oraciones / encabezados',
  'epub.info.paragraphs': 'Párrafos / encabezados',
  'epub.titleOverride': 'Título del libro (sustituir)',
  'epub.titleOverridePlaceholder': 'Déjalo vacío para mantener el título original',
  'epub.advanced': 'Opciones avanzadas',
  'epub.langPlaceholderEn': 'p. ej. en',
  'epub.langPlaceholderFr': 'p. ej. fr',

  'split.label': 'Dividir la traducción por',
  'split.paragraph': 'Párrafo',
  'split.sentence': 'Oración',
  'split.sentenceAligned': 'Oración (alineada)',

  'speed.label': 'Velocidad',
  'speed.slow': 'Lenta',
  'speed.normal': 'Normal',
  'speed.fast': 'Rápida',

  'breaks.label': 'Saltos de línea (<br>)',
  'breaks.preserve': 'Preservar',
  'breaks.collapse': 'Combinar',

  'limit.exceeded':
    'Límite mensual alcanzado: {used}/{limit} palabras en el plan {plan}. Mejora tu plan para convertir más este mes.',
  'limit.blocked': 'Conversión bloqueada: {reason}',
  'limit.usage': '{used} de {limit} palabras usadas este mes (plan {plan}).',

  'gutenberg.searchPlaceholder': 'Buscar título o autor…',
  'gutenberg.searchHint':
    'Búsquedas en Project Gutenberg vía gutendex. Se prefiere EPUB cuando esté disponible.',
  'popular.heading':
    'Los {n} libros más descargados de Project Gutenberg para el idioma elegido, ordenados por descargas.',
  'popular.language': 'Idioma',
  'popular.languagePlaceholder': 'p. ej. en, fr, es',
  'popular.loading': 'Cargando libros populares…',
  'popular.empty':
    'No se encontraron libros populares para "{lang}". Comprueba el código de idioma.',
  'gutenberg.downloads': '{count} descargas',
  'gutenberg.languagesList': 'Idiomas: {langs}',
  'gutenberg.unknownAuthor': 'Desconocido',

  'info.title': 'Información',
  'info.intro':
    'Esta herramienta genera una edición bilingüe en paralelo de cualquier texto. Elige la fuente que coincida con lo que tienes.',
  'info.paste.h': 'Pegar texto',
  'info.paste.body':
    'Pega cualquier pasaje en el cuadro de origen; el generador lo divide en puntos finales, traduce cada oración y empaqueta los pares en un EPUB de un solo capítulo. Ideal para cuentos, artículos o cualquier cosa que puedas copiar de una página web o un PDF.',
  'info.epub.h': 'Subir EPUB',
  'info.epub.body':
    'Elige un archivo .epub existente; el generador analiza su estructura, recorre párrafos y encabezados de cada capítulo, traduce cada bloque y arma un nuevo EPUB bilingüe que conserva los capítulos y la portada. Ideal para libros completos.',
  'info.gutenberg.h': 'Buscar en Project Gutenberg',
  'info.gutenberg.body':
    'Busca en el catálogo de Project Gutenberg libros de dominio público, elige uno, y el generador descarga el EPUB y lo convierte igual que en el flujo de subida.',
  'info.saveEpub.h': 'Guardar como EPUB',
  'info.saveEpub.body':
    'Cuando termine la generación, aparece un botón "Descargar EPUB" en la parte superior. Haz clic para guardar la edición bilingüe como un EPUB estándar.',
  'info.savePdf.h': 'Guardar como PDF',
  'info.savePdf.body':
    'Cuando el libro bilingüe esté en pantalla, haz clic en "Guardar como PDF" en la barra superior. Se abre el diálogo de impresión del navegador con el diseño ya limpio — elige "Guardar como PDF" como destino y confirma.',

  'consent.text':
    'Usamos una cookie propia para estadísticas anónimas de conversión (necesaria para que el sitio recuerde tus libros) y, opcionalmente, Google Analytics para entender el tráfico. Consulta nuestra',
  'consent.privacyLink': 'Política de privacidad',
  'consent.reject': 'Rechazar analíticas',
  'consent.accept': 'Aceptar',

  'policy.lastUpdated': 'Última actualización',
  'policy.englishOnlyNote':
    'Este documento es legalmente vinculante en su versión en inglés. Las traducciones del resto de la interfaz se ofrecen como cortesía.',
};
