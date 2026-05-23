import type { TKey } from './en';

export const ja: Record<TKey, string> = {
  'nav.convert': '変換',
  'nav.dashboard': 'ダッシュボード',
  'nav.admin': '管理',
  'nav.signIn': 'ログイン',
  'nav.signUp': '新規登録',
  'nav.signOut': 'ログアウト',
  'nav.language': '言語',

  'footer.tagline': '無料・オープンソースの二言語書籍ジェネレーター。',
  'footer.privacy': 'プライバシー',
  'footer.terms': '利用規約',
  'footer.cookiePreferences': 'クッキー設定',

  'tab.paste': 'テキストを貼り付け',
  'tab.epub': 'EPUB をアップロード',
  'tab.popular': '人気の本',
  'tab.gutenberg': 'Gutenberg を検索',

  'converter.title': '二言語書籍ジェネレーター',
  'converter.info': '情報',

  'common.sourceLanguage': '原文の言語',
  'common.targetLanguage': '訳文の言語',
  'common.bookTitle': '書籍タイトル',
  'common.generate': '書籍を生成',
  'common.translating': '翻訳中…',
  'common.cancel': 'キャンセル',
  'common.download': 'EPUB をダウンロード',
  'common.saveAsPdf': 'PDF として保存',
  'common.startOver': 'やり直す',
  'common.search': '検索',
  'common.searching': '検索中…',
  'common.loading': '読み込み中…',
  'common.convertEpub': 'EPUB を変換',
  'common.email': 'メール',
  'common.password': 'パスワード',
  'common.or': 'または',
  'common.thanksBmc': '気に入ったらコーヒーをおごる',
  'common.buyMeACoffee': 'コーヒーをおごる',

  'auth.signIn.title': 'ログイン',
  'auth.signIn.submit': 'ログイン',
  'auth.signIn.submitting': 'ログイン中…',
  'auth.signIn.failed': 'ログインに失敗しました',
  'auth.signIn.continueGoogle': 'Google で続行',
  'auth.signIn.newHere': '初めての方ですか?',
  'auth.signIn.createAccount': 'アカウントを作成',

  'auth.signUp.title': 'アカウント作成',
  'auth.signUp.name': '名前 (任意)',
  'auth.signUp.submit': 'アカウントを作成',
  'auth.signUp.submitting': '作成中…',
  'auth.signUp.failed': '登録に失敗しました',
  'auth.signUp.haveAccount': 'すでにアカウントをお持ちですか?',

  'auth.signOut.message': 'ログアウト中…',

  'dashboard.title': 'ダッシュボード',
  'dashboard.plan': 'プラン',
  'dashboard.adminTag': '管理者',
  'dashboard.cards.books': '変換した書籍数',
  'dashboard.cards.words': '翻訳した単語数',
  'dashboard.cards.topPair': '主な言語ペア',
  'dashboard.cards.sources': '使用したソース',
  'dashboard.cards.booksSub': '{count} 冊',
  'dashboard.recent': '最近の変換',
  'dashboard.dangerZone': '危険領域',

  'delete.button': 'アカウントを削除',
  'delete.confirmTitle': 'アカウントを削除しますか?',
  'delete.confirmBody':
    'これは取り消せません。ユーザー記録・セッション・OAuth リンクが削除されます。過去の変換は集計統計には残りますが、あなたとは紐付かなくなります。',
  'delete.confirmYes': 'はい、アカウントを削除します',
  'delete.deleting': '削除中…',

  'table.empty': 'まだ変換はありません。',
  'table.when': '日時',
  'table.title': 'タイトル',
  'table.languages': '言語',
  'table.words': '単語数',
  'table.source': 'ソース',
  'table.status': '状態',

  'paste.sourceLangPlaceholder': '例: fr',
  'paste.targetLangPlaceholder': '例: en',
  'paste.bookTitlePlaceholder': 'マイ二言語書籍',
  'paste.sourceText': '原文',
  'paste.sourceTextHint':
    'テキストはピリオドで分割され、1 文ごとに 1 ペアになります。',
  'paste.sourceTextPlaceholder': 'ここに原文を入力...',
  'paste.cancelled': 'キャンセルしました。部分翻訳を表示しています。',

  'epub.file': 'EPUB ファイル',
  'epub.fileHint':
    'EPUB ファイルを選んでください。章と段落は自動検出されます。',
  'epub.reading': 'EPUB を読み込み中…',
  'epub.loaded': '読み込み完了: {chapters} 章, {blocks} ブロック',
  'epub.couldNotRead': 'EPUB を読み込めませんでした: {error}',
  'epub.info.title': 'タイトル',
  'epub.info.author': '著者',
  'epub.info.language': '検出された言語',
  'epub.info.chapters': '章',
  'epub.info.sentences': '文 / 見出し',
  'epub.info.paragraphs': '段落 / 見出し',
  'epub.titleOverride': '書籍タイトル (上書き)',
  'epub.titleOverridePlaceholder': '元のタイトルを保持するには空欄のまま',
  'epub.advanced': '詳細オプション',
  'epub.langPlaceholderEn': '例: en',
  'epub.langPlaceholderFr': '例: fr',

  'split.label': '翻訳の分割単位',
  'split.paragraph': '段落',
  'split.sentence': '文',
  'split.sentenceAligned': '文 (整列)',

  'speed.label': '速度',
  'speed.slow': '遅い',
  'speed.normal': '標準',
  'speed.fast': '速い',

  'breaks.label': '改行 (<br>)',
  'breaks.preserve': '保持',
  'breaks.collapse': '結合',

  'limit.exceeded':
    '月間制限に到達: {plan} プランで {used}/{limit} 単語。今月さらに変換するにはアップグレードしてください。',
  'limit.blocked': '変換がブロックされました: {reason}',
  'limit.usage': '今月の使用: {used}/{limit} 単語 ({plan} プラン)',

  'gutenberg.searchPlaceholder': 'タイトルまたは著者を検索…',
  'gutenberg.searchHint':
    'gutendex 経由で Project Gutenberg を検索します。可能な場合は EPUB を優先します。',
  'popular.heading':
    '選択した言語の Project Gutenberg で最もダウンロードされた {n} 冊。ダウンロード数順。',
  'popular.language': '言語',
  'popular.languagePlaceholder': '例: en, fr, es',
  'popular.loading': '人気の本を読み込み中…',
  'popular.empty':
    '"{lang}" の人気書籍が見つかりません。言語コードを確認してください。',
  'gutenberg.downloads': '{count} ダウンロード',
  'gutenberg.languagesList': '言語: {langs}',
  'gutenberg.unknownAuthor': '不明',

  'info.title': '情報',
  'info.intro':
    'このツールは、与えられたテキストの対訳版を左右に並べて生成します。お手持ちのソースに合った入力を選んでください。',
  'info.paste.h': 'テキストを貼り付け',
  'info.paste.body':
    '原文ボックスに任意の文章を貼り付けると、ジェネレーターはピリオドで分割し、各文を翻訳し、ペアを 1 章の EPUB にまとめます。短編・記事・ウェブや PDF からコピーしたテキストに最適です。',
  'info.epub.h': 'EPUB をアップロード',
  'info.epub.body':
    '既存の .epub ファイルを選ぶと、ジェネレーターは構成を解析し、各章の段落と見出しをめぐり、各ブロックを翻訳して、章境界と表紙を保ったまま新しい二言語 EPUB を構築します。長編に最適です。',
  'info.gutenberg.h': 'Project Gutenberg を検索',
  'info.gutenberg.body':
    'Project Gutenberg のパブリックドメイン書籍を検索し、1 冊選ぶと、ジェネレーターは EPUB をダウンロードしてアップロードと同じ流れで変換します。',
  'info.saveEpub.h': 'EPUB として保存',
  'info.saveEpub.body':
    '生成が完了するとページ上部に「EPUB をダウンロード」ボタンが表示されます。標準 EPUB として保存できます。',
  'info.savePdf.h': 'PDF として保存',
  'info.savePdf.body':
    '対訳書籍が表示されたら、上部のバーの「PDF として保存」をクリックします。ブラウザの印刷ダイアログが、UI を除いたレイアウトで開きます — 出力先に「PDF として保存」を選んで確認します。',

  'consent.text':
    '匿名の変換統計のためにファーストパーティ Cookie を使用し (本のリストをこの端末で記憶するために必要)、任意でトラフィック把握のため Google Analytics を使用します。詳細は',
  'consent.privacyLink': 'プライバシーポリシー',
  'consent.reject': '分析を拒否',
  'consent.accept': '同意する',

  'policy.lastUpdated': '最終更新',
  'policy.englishOnlyNote':
    '法的に拘束力があるのは英語版です。その他のインターフェース翻訳は参考としてご利用ください。',
};
