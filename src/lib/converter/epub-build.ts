import JSZip from 'jszip';
import { isRtl } from './constants';
import type { Block, Chapter, ParsedEpub, SentencePair } from './types';
import { escapeXml, slugify, uuid } from './util';

const EPUB_CSS = `body { font-family: serif; margin: 1em; line-height: 1.5; }
h1, h2, h3 { text-align: center; margin: 1em 0 0.5em; }
.chapter-title { font-size: 1.5em; }
.chapter-subtitle { font-size: 1.05em; color: #555; font-weight: normal; margin-top: -0.3em; }
.pair { display: table; width: 100%; margin: 0 0 0.4em; border-collapse: collapse; page-break-inside: avoid; }
.pair.paragraph-end { margin-bottom: 1.4em; }
.pair > div { display: table-cell; width: 50%; vertical-align: top; padding: 0.3em 0.6em; }
.src { border-right: 1px solid #ccc; }
.rtl { direction: rtl; text-align: right; }
.heading { font-weight: bold; }
.heading.h1 > div { font-size: 1.35em; text-align: center; border-right: none; }
.heading.h2 > div { font-size: 1.2em; text-align: center; border-right: none; }
.heading.h3 > div { font-size: 1.1em; text-align: center; border-right: none; }
.heading.h4 > div, .heading.h5 > div, .heading.h6 > div { font-size: 1em; text-align: center; border-right: none; }
.blockquote { font-style: italic; }
.titlepage { text-align: center; margin-top: 2em; }
.titlepage img { max-width: 100%; max-height: 80vh; }
.titlepage h1 { font-size: 1.8em; }
.titlepage .author { color: #555; margin: 0.5em 0 2em; }
.titlepage .edition { color: #888; font-size: 0.9em; margin-top: 2em; }
@media (max-width: 480px) {
  .pair, .pair > div { display: block; width: 100%; }
  .src { border-right: none; border-bottom: 1px solid #ccc; padding-bottom: 0.6em; margin-bottom: 0.6em; }
}`;

function buildChapterXhtml(
  chapter: Chapter,
  idx: number,
  sourceLang: string,
  targetLang: string,
  srcDir: 'ltr' | 'rtl',
  tgtDir: 'ltr' | 'rtl',
): string {
  const parts: string[] = [];
  for (const block of chapter.blocks) {
    const tag = block.tag;
    const isHeading = /^h[1-6]$/.test(tag);
    const isQuote = tag === 'blockquote';
    const classes = ['pair'];
    if (isHeading) classes.push('heading', tag);
    else if (isQuote) classes.push('blockquote');
    if (block.paragraphEnd) classes.push('paragraph-end');
    const srcClass = 'src' + (srcDir === 'rtl' ? ' rtl' : '');
    const tgtClass = 'tgt' + (tgtDir === 'rtl' ? ' rtl' : '');
    parts.push(
      `<div class="${classes.join(' ')}">` +
        `<div class="${srcClass}" lang="${escapeXml(sourceLang)}">${escapeXml(block.text)}</div>` +
        `<div class="${tgtClass}" lang="${escapeXml(targetLang)}">${escapeXml(block.translation || '')}</div>` +
        `</div>`,
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${escapeXml(sourceLang)}">
<head>
  <meta charset="utf-8"/>
  <title>${escapeXml(chapter.navTitle || `Chapter ${idx + 1}`)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
${parts.join('\n')}
</body>
</html>`;
}

export async function buildEpub(
  parsed: ParsedEpub,
  sourceLang: string,
  targetLang: string,
  userTitle?: string,
): Promise<Blob> {
  const title =
    (userTitle ?? '').trim() ||
    parsed.title ||
    `Bilingual Book (${sourceLang} → ${targetLang})`;
  const bookId = `urn:uuid:${uuid()}`;
  const srcDir = isRtl(sourceLang) ? 'rtl' : 'ltr';
  const tgtDir = isRtl(targetLang) ? 'rtl' : 'ltr';

  let coverHref: string | null = null;
  let coverMediaType: string | null = null;
  let coverData: Uint8Array | null = null;
  if (parsed.cover) {
    const ext = (parsed.cover.href.match(/\.[a-zA-Z0-9]+$/) ?? ['.jpg'])[0];
    coverHref = 'cover' + ext.toLowerCase();
    coverMediaType = parsed.cover.mediaType;
    coverData = parsed.cover.data;
  }

  const titlePage = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${escapeXml(sourceLang)}">
<head>
  <meta charset="utf-8"/>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <div class="titlepage">
    ${coverHref ? `<img src="${escapeXml(coverHref)}" alt="${escapeXml(title)}"/>` : ''}
    <h1>${escapeXml(title)}</h1>
    ${parsed.author ? `<p class="author">${escapeXml(parsed.author)}</p>` : ''}
    <p class="edition">Bilingual edition: ${escapeXml(sourceLang)} → ${escapeXml(targetLang)}</p>
  </div>
</body>
</html>`;

  const chapterFiles = parsed.chapters.map((chapter, idx) =>
    buildChapterXhtml(chapter, idx, sourceLang, targetLang, srcDir, tgtDir),
  );

  const manifestItems: string[] = [
    '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
    '<item id="style" href="style.css" media-type="text/css"/>',
    '<item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>',
  ];
  if (coverHref && coverMediaType) {
    manifestItems.push(
      `<item id="cover" href="${escapeXml(coverHref)}" media-type="${escapeXml(coverMediaType)}"/>`,
    );
  }
  parsed.chapters.forEach((_, idx) => {
    manifestItems.push(
      `<item id="chapter${idx}" href="chapter-${idx}.xhtml" media-type="application/xhtml+xml"/>`,
    );
  });

  const spineItems: string[] = ['<itemref idref="titlepage"/>'];
  parsed.chapters.forEach((_, idx) => {
    spineItems.push(`<itemref idref="chapter${idx}"/>`);
  });

  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>${escapeXml(sourceLang)}</dc:language>
    <dc:language>${escapeXml(targetLang)}</dc:language>
    <dc:identifier id="bookid" opf:scheme="UUID">${escapeXml(bookId)}</dc:identifier>
    ${parsed.author ? `<dc:creator>${escapeXml(parsed.author)}</dc:creator>` : ''}
    <dc:contributor>Bilingual Book Generator</dc:contributor>
    <dc:date>${new Date().toISOString().slice(0, 10)}</dc:date>
    ${coverHref ? '<meta name="cover" content="cover"/>' : ''}
  </metadata>
  <manifest>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine toc="ncx">
    ${spineItems.join('\n    ')}
  </spine>
  ${coverHref ? '<guide><reference type="cover" href="titlepage.xhtml" title="Cover"/></guide>' : ''}
</package>`;

  const navPoints: string[] = [
    `<navPoint id="navPoint-0" playOrder="1"><navLabel><text>${escapeXml(title)}</text></navLabel><content src="titlepage.xhtml"/></navPoint>`,
  ];
  parsed.chapters.forEach((chapter, idx) => {
    const label = chapter.navTitle || `Chapter ${idx + 1}`;
    navPoints.push(
      `<navPoint id="navPoint-${idx + 1}" playOrder="${idx + 2}"><navLabel><text>${escapeXml(label)}</text></navLabel><content src="chapter-${idx}.xhtml"/></navPoint>`,
    );
  });

  const ncx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${escapeXml(bookId)}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(title)}</text></docTitle>
  <navMap>
    ${navPoints.join('\n    ')}
  </navMap>
</ncx>`;

  const container = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

  const zip = new JSZip();
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', container);
  zip.file('content.opf', opf);
  zip.file('toc.ncx', ncx);
  zip.file('style.css', EPUB_CSS);
  zip.file('titlepage.xhtml', titlePage);
  if (coverHref && coverData) {
    zip.file(coverHref, coverData);
  }
  chapterFiles.forEach((html, idx) => {
    zip.file(`chapter-${idx}.xhtml`, html);
  });

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
  });
}

export async function buildSimpleEpub(
  pairs: SentencePair[],
  sourceLang: string,
  targetLang: string,
  userTitle?: string,
): Promise<{ blob: Blob; filename: string }> {
  const title =
    (userTitle ?? '').trim() ||
    `Bilingual Book (${sourceLang} → ${targetLang})`;

  const blocks: Block[] = pairs
    .filter((p) => p.src || p.tgt)
    .map((p) => ({ tag: 'p', text: p.src, translation: p.tgt }));

  const parsed: ParsedEpub = {
    title,
    language: sourceLang,
    author: '',
    chapters: [
      {
        spineIndex: 0,
        href: 'chapter1.xhtml',
        fullPath: 'chapter1.xhtml',
        navTitle: title,
        blocks,
      },
    ],
    cover: null,
    opfDir: '',
  };

  const blob = await buildEpub(parsed, sourceLang, targetLang, userTitle);
  const slug = slugify(title) || 'bilingual-book';
  return { blob, filename: `${slug}.epub` };
}

export function saveBlobAs(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
