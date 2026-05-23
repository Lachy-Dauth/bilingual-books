import type { TKey } from './en';

export const zh: Record<TKey, string> = {
  'nav.convert': '转换',
  'nav.dashboard': '控制台',
  'nav.admin': '管理',
  'nav.signIn': '登录',
  'nav.signUp': '注册',
  'nav.signOut': '退出登录',
  'nav.language': '语言',

  'footer.tagline': '免费的开源双语书籍生成器。',
  'footer.privacy': '隐私',
  'footer.terms': '条款',
  'footer.cookiePreferences': 'Cookie 偏好',

  'tab.paste': '粘贴文本',
  'tab.epub': '上传 EPUB',
  'tab.popular': '热门书籍',
  'tab.gutenberg': '搜索 Gutenberg',

  'converter.title': '双语书籍生成器',
  'converter.info': '信息',

  'common.sourceLanguage': '源语言',
  'common.targetLanguage': '目标语言',
  'common.bookTitle': '书籍标题',
  'common.generate': '生成书籍',
  'common.translating': '翻译中…',
  'common.cancel': '取消',
  'common.download': '下载 EPUB',
  'common.saveAsPdf': '另存为 PDF',
  'common.startOver': '重新开始',
  'common.search': '搜索',
  'common.searching': '搜索中…',
  'common.loading': '加载中…',
  'common.convertEpub': '转换 EPUB',
  'common.email': '邮箱',
  'common.password': '密码',
  'common.or': '或',
  'common.thanksBmc': '喜欢就请我喝杯咖啡',
  'common.buyMeACoffee': '请我喝杯咖啡',

  'auth.signIn.title': '登录',
  'auth.signIn.submit': '登录',
  'auth.signIn.submitting': '登录中…',
  'auth.signIn.failed': '登录失败',
  'auth.signIn.continueGoogle': '使用 Google 继续',
  'auth.signIn.newHere': '新用户?',
  'auth.signIn.createAccount': '创建账户',

  'auth.signUp.title': '创建账户',
  'auth.signUp.name': '姓名 (可选)',
  'auth.signUp.submit': '创建账户',
  'auth.signUp.submitting': '创建中…',
  'auth.signUp.failed': '注册失败',
  'auth.signUp.haveAccount': '已有账户?',

  'auth.signOut.message': '退出登录中…',

  'dashboard.title': '我的控制台',
  'dashboard.plan': '套餐',
  'dashboard.adminTag': '管理员',
  'dashboard.cards.books': '已转换书籍',
  'dashboard.cards.words': '已翻译单词',
  'dashboard.cards.topPair': '主要语言对',
  'dashboard.cards.sources': '使用过的来源',
  'dashboard.cards.booksSub': '{count} 本书',
  'dashboard.recent': '最近的转换',
  'dashboard.dangerZone': '危险区域',

  'delete.button': '删除账户',
  'delete.confirmTitle': '确定要删除账户?',
  'delete.confirmBody':
    '此操作不可恢复。你的用户记录、会话和 OAuth 关联都会被删除。过去的转换会保留在汇总统计中,但不再与你关联。',
  'delete.confirmYes': '确认删除我的账户',
  'delete.deleting': '删除中…',

  'table.empty': '尚无转换记录。',
  'table.when': '时间',
  'table.title': '标题',
  'table.languages': '语言',
  'table.words': '字数',
  'table.source': '来源',
  'table.status': '状态',

  'paste.sourceLangPlaceholder': '例如 fr',
  'paste.targetLangPlaceholder': '例如 en',
  'paste.bookTitlePlaceholder': '我的双语书籍',
  'paste.sourceText': '原文',
  'paste.sourceTextHint': '文本按句号切分,每句一对。',
  'paste.sourceTextPlaceholder': '在此输入原文...',
  'paste.cancelled': '已取消。显示部分翻译。',

  'epub.file': 'EPUB 文件',
  'epub.fileHint': '选择一个 EPUB 文件。章节和段落将自动识别。',
  'epub.reading': '正在读取 EPUB…',
  'epub.loaded': '已加载: {chapters} 章, {blocks} 块。',
  'epub.couldNotRead': '无法读取 EPUB: {error}',
  'epub.info.title': '标题',
  'epub.info.author': '作者',
  'epub.info.language': '检测到的语言',
  'epub.info.chapters': '章节',
  'epub.info.sentences': '句子 / 标题',
  'epub.info.paragraphs': '段落 / 标题',
  'epub.titleOverride': '书籍标题 (覆盖)',
  'epub.titleOverridePlaceholder': '留空以保留原标题',
  'epub.advanced': '高级选项',
  'epub.langPlaceholderEn': '例如 en',
  'epub.langPlaceholderFr': '例如 fr',

  'split.label': '翻译切分方式',
  'split.paragraph': '段落',
  'split.sentence': '句子',
  'split.sentenceAligned': '句子 (对齐)',

  'speed.label': '速度',
  'speed.slow': '慢',
  'speed.normal': '正常',
  'speed.fast': '快',

  'breaks.label': '换行符 (<br>)',
  'breaks.preserve': '保留',
  'breaks.collapse': '合并',

  'limit.exceeded':
    '本月已达上限: {plan} 套餐 {used}/{limit} 单词。升级套餐以继续。',
  'limit.blocked': '转换被阻止: {reason}',
  'limit.usage': '本月已使用 {used}/{limit} 单词 ({plan} 套餐)。',

  'gutenberg.searchPlaceholder': '按标题或作者搜索…',
  'gutenberg.searchHint':
    '通过 gutendex 搜索 Project Gutenberg。优先选择 EPUB 格式。',
  'popular.heading':
    'Project Gutenberg 上所选语言下载量最高的 {n} 本书,按下载次数排序。',
  'popular.language': '语言',
  'popular.languagePlaceholder': '例如 en, fr, es',
  'popular.loading': '加载热门书籍中…',
  'popular.empty': '未找到 "{lang}" 的热门书籍。请检查语言代码。',
  'gutenberg.downloads': '{count} 次下载',
  'gutenberg.languagesList': '语言: {langs}',
  'gutenberg.unknownAuthor': '未知',

  'info.title': '信息',
  'info.intro':
    '此工具为任何文本生成左右对照的双语版本。请选择与你的来源匹配的输入方式。',
  'info.paste.h': '粘贴文本',
  'info.paste.body':
    '把任何段落粘贴到原文框中,生成器会按句号切分、逐句翻译,并把句对打包成一个单章 EPUB。适合短篇小说、文章或从网页/PDF 复制的内容。',
  'info.epub.h': '上传 EPUB',
  'info.epub.body':
    '选择已有的 .epub 文件,生成器会解析其结构、遍历每章的段落和标题、翻译每个块,并构建一个保留章节边界和封面的双语 EPUB。适合完整书籍。',
  'info.gutenberg.h': '搜索 Project Gutenberg',
  'info.gutenberg.body':
    '在 Project Gutenberg 目录中搜索公共领域书籍,选中一本,生成器会下载 EPUB 并像上传流程一样进行转换。',
  'info.saveEpub.h': '保存为 EPUB',
  'info.saveEpub.body':
    '生成完成后,页面顶部会出现"下载 EPUB"按钮。点击即可将双语版本保存为标准 EPUB。',
  'info.savePdf.h': '保存为 PDF',
  'info.savePdf.body':
    '当双语书籍显示在屏幕上时,点击顶部栏的"另存为 PDF"。浏览器的打印对话框会以无界面的布局打开 — 将目标选为"另存为 PDF"并确认。',

  'consent.text':
    '我们使用一个第一方 Cookie 收集匿名转换统计 (用于让网站记住你的书籍),并可选使用 Google Analytics 了解流量情况。请阅读我们的',
  'consent.privacyLink': '隐私政策',
  'consent.reject': '拒绝分析',
  'consent.accept': '接受',

  'policy.lastUpdated': '最后更新',
  'policy.englishOnlyNote':
    '具有法律约束力的版本为英文版。其他界面文本的翻译仅供参考。',
};
