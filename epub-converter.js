(function () {
  'use strict';

  const RTL_LANGS = ['ar', 'he', 'fa', 'ur', 'ks', 'ps', 'ug', 'ckb', 'pa', 'sd'];
  const PARALLEL_TRANSLATIONS = 6;
  const BLOCK_SELECTOR = 'h1, h2, h3, h4, h5, h6, p, blockquote';

  const LANG_3TO2 = {
    eng: 'en', fra: 'fr', fre: 'fr', spa: 'es', deu: 'de', ger: 'de',
    ita: 'it', por: 'pt', rus: 'ru', jpn: 'ja', kor: 'ko', zho: 'zh',
    chi: 'zh', ara: 'ar', heb: 'he', hin: 'hi', tha: 'th', tur: 'tr',
    vie: 'vi', pol: 'pl', nld: 'nl', dut: 'nl', swe: 'sv', nor: 'no',
    dan: 'da', fin: 'fi', ell: 'el', gre: 'el', ces: 'cs', cze: 'cs',
    ukr: 'uk', ron: 'ro', rum: 'ro', hun: 'hu', ind: 'id', msa: 'ms',
    may: 'ms',
  };

  let parsedEpub = null;
  let translationCancelled = false;
  let downloadBlob = null;
  let downloadFilename = 'bilingual-book.epub';

  function escapeXml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;'
    }[c]));
  }

  function uuid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function dirname(path) {
    const i = path.lastIndexOf('/');
    return i >= 0 ? path.slice(0, i + 1) : '';
  }

  function joinPath(base, rel) {
    if (!rel) return base;
    if (rel.startsWith('/')) return rel.replace(/^\/+/, '');
    const baseSegs = base.split('/').filter(Boolean);
    const relSegs = rel.split('/');
    for (const seg of relSegs) {
      if (seg === '..') baseSegs.pop();
      else if (seg !== '.' && seg !== '') baseSegs.push(seg);
    }
    return baseSegs.join('/');
  }

  function normalizeLanguageCode(code) {
    if (!code) return '';
    const base = String(code).trim().split(/[-_]/)[0].toLowerCase();
    return LANG_3TO2[base] || base.slice(0, 2);
  }

  function findFirstNS(doc, localName, namespaces) {
    for (const ns of namespaces) {
      const els = doc.getElementsByTagNameNS(ns, localName);
      if (els.length) return els[0];
    }
    const prefixed = doc.getElementsByTagName(`dc:${localName}`);
    if (prefixed.length) return prefixed[0];
    const plain = doc.getElementsByTagName(localName);
    return plain.length ? plain[0] : null;
  }

  function getDcText(doc, localName) {
    const el = findFirstNS(doc, localName, ['http://purl.org/dc/elements/1.1/']);
    return el ? el.textContent.trim() : '';
  }

  async function parseEpub(file) {
    const zip = await JSZip.loadAsync(file);
    const parser = new DOMParser();

    const containerFile = zip.file('META-INF/container.xml');
    if (!containerFile) throw new Error('Not a valid EPUB: missing META-INF/container.xml');
    const containerXml = await containerFile.async('string');
    const containerDoc = parser.parseFromString(containerXml, 'application/xml');
    const rootfile = containerDoc.getElementsByTagName('rootfile')[0];
    if (!rootfile) throw new Error('Not a valid EPUB: container.xml has no rootfile');
    const opfPath = rootfile.getAttribute('full-path');
    if (!opfPath) throw new Error('Not a valid EPUB: rootfile has no full-path');
    const opfDir = dirname(opfPath);

    const opfFile = zip.file(opfPath);
    if (!opfFile) throw new Error(`Missing OPF file at ${opfPath}`);
    const opfXml = await opfFile.async('string');
    const opfDoc = parser.parseFromString(opfXml, 'application/xml');

    const title = getDcText(opfDoc, 'title') || file.name.replace(/\.epub$/i, '');
    const language = getDcText(opfDoc, 'language');
    const author = getDcText(opfDoc, 'creator');

    const manifestEl = opfDoc.getElementsByTagName('manifest')[0];
    if (!manifestEl) throw new Error('OPF has no <manifest>');
    const manifest = {};
    const manifestItems = manifestEl.getElementsByTagName('item');
    for (let i = 0; i < manifestItems.length; i++) {
      const item = manifestItems[i];
      const id = item.getAttribute('id');
      const href = item.getAttribute('href');
      const mediaType = item.getAttribute('media-type') || '';
      if (id && href) {
        manifest[id] = {
          id, href, mediaType,
          fullPath: joinPath(opfDir, decodeURIComponent(href)),
        };
      }
    }

    let cover = null;
    const metas = opfDoc.getElementsByTagName('meta');
    for (let i = 0; i < metas.length; i++) {
      if (metas[i].getAttribute('name') === 'cover') {
        const coverItem = manifest[metas[i].getAttribute('content')];
        if (coverItem && coverItem.mediaType.startsWith('image/')) {
          const coverFile = zip.file(coverItem.fullPath);
          if (coverFile) {
            cover = {
              href: coverItem.href,
              mediaType: coverItem.mediaType,
              data: await coverFile.async('uint8array'),
            };
          }
        }
        break;
      }
    }

    const navMap = {};
    const ncxManifestItem = Object.values(manifest)
      .find(m => m.mediaType === 'application/x-dtbncx+xml');
    if (ncxManifestItem) {
      try {
        const ncxXml = await zip.file(ncxManifestItem.fullPath).async('string');
        const ncxDoc = parser.parseFromString(ncxXml, 'application/xml');
        const navPoints = ncxDoc.getElementsByTagName('navPoint');
        const ncxDir = dirname(ncxManifestItem.fullPath);
        for (let i = 0; i < navPoints.length; i++) {
          const np = navPoints[i];
          const textEl = np.getElementsByTagName('text')[0];
          const contentEl = np.getElementsByTagName('content')[0];
          if (!textEl || !contentEl) continue;
          const label = textEl.textContent.trim();
          const src = (contentEl.getAttribute('src') || '').split('#')[0];
          if (!src) continue;
          const fullPath = joinPath(ncxDir, decodeURIComponent(src));
          if (!navMap[fullPath]) navMap[fullPath] = label;
        }
      } catch (err) {
        console.warn('Could not parse NCX:', err);
      }
    }

    const spineEl = opfDoc.getElementsByTagName('spine')[0];
    if (!spineEl) throw new Error('OPF has no <spine>');
    const spineRefs = spineEl.getElementsByTagName('itemref');

    const chapters = [];
    for (let i = 0; i < spineRefs.length; i++) {
      const idref = spineRefs[i].getAttribute('idref');
      const entry = manifest[idref];
      if (!entry) continue;
      const mt = entry.mediaType.toLowerCase();
      if (!mt.includes('html') && !mt.includes('xhtml') && !mt.includes('xml')) continue;

      const chapterFile = zip.file(entry.fullPath);
      if (!chapterFile) continue;
      const content = await chapterFile.async('string');

      const blocks = extractBlocks(content);
      if (blocks.length === 0) continue;

      const navTitle = navMap[entry.fullPath] || guessChapterTitle(blocks) || `Section ${chapters.length + 1}`;

      chapters.push({
        spineIndex: i,
        href: entry.href,
        fullPath: entry.fullPath,
        navTitle,
        blocks,
      });
    }

    return { title, language, author, chapters, cover, opfDir };
  }

  function extractBlocks(content) {
    const parser = new DOMParser();
    let doc = parser.parseFromString(content, 'application/xhtml+xml');
    if (doc.getElementsByTagName('parsererror').length > 0) {
      doc = parser.parseFromString(content, 'text/html');
    }
    const body = doc.getElementsByTagName('body')[0];
    if (!body) return [];

    const elements = body.querySelectorAll(BLOCK_SELECTOR);
    const blocks = [];
    const seen = new Set();
    elements.forEach(el => {
      let parent = el.parentElement;
      while (parent && parent !== body) {
        if (seen.has(parent)) return;
        parent = parent.parentElement;
      }
      const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      seen.add(el);
      const tag = el.tagName.toLowerCase();
      blocks.push({ tag, text });
    });
    return blocks;
  }

  function guessChapterTitle(blocks) {
    const heading = blocks.find(b => /^h[1-6]$/.test(b.tag));
    if (heading) return heading.text.slice(0, 80);
    return '';
  }

  async function translateText(text, sourceLang, targetLang) {
    if (!text.trim()) return '';
    if (sourceLang === targetLang) return text;
    if (text.length > 4500) {
      const parts = splitForTranslation(text, 4500);
      const translated = [];
      for (const part of parts) {
        translated.push(await translateText(part, sourceLang, targetLang));
        if (translationCancelled) break;
      }
      return translated.join(' ');
    }

    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl='
      + encodeURIComponent(sourceLang) + '&tl=' + encodeURIComponent(targetLang)
      + '&dt=t&q=' + encodeURIComponent(text);

    let attempts = 0;
    while (attempts < 3) {
      try {
        const resp = await fetch(url);
        if (resp.status === 429) {
          attempts++;
          await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempts)));
          continue;
        }
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();
        if (!data || !data[0]) return '';
        return data[0].map(item => (item && item[0]) || '').join('').trim();
      } catch (err) {
        attempts++;
        if (attempts >= 3) {
          console.warn('Translation failed:', err.message, 'text:', text.slice(0, 60));
          return '';
        }
        await new Promise(r => setTimeout(r, 300 * attempts));
      }
    }
    return '';
  }

  function splitForTranslation(text, limit) {
    const out = [];
    let remaining = text;
    while (remaining.length > limit) {
      let cut = remaining.lastIndexOf('. ', limit);
      if (cut < limit / 2) cut = remaining.lastIndexOf(' ', limit);
      if (cut <= 0) cut = limit;
      out.push(remaining.slice(0, cut + 1).trim());
      remaining = remaining.slice(cut + 1);
    }
    if (remaining) out.push(remaining);
    return out;
  }

  async function translateAll(items, sourceLang, targetLang, onProgress) {
    let done = 0;
    const total = items.length;
    let cursor = 0;

    const workers = [];
    for (let w = 0; w < PARALLEL_TRANSLATIONS; w++) {
      workers.push((async () => {
        while (cursor < items.length && !translationCancelled) {
          const idx = cursor++;
          const item = items[idx];
          const translation = await translateText(item.text, sourceLang, targetLang);
          item.translation = translation;
          done++;
          onProgress({ done, total, item });
        }
      })());
    }
    await Promise.all(workers);
  }

  async function buildEpub(parsed, sourceLang, targetLang, userTitle) {
    const title = (userTitle || '').trim() || parsed.title || `Bilingual Book (${sourceLang} → ${targetLang})`;
    const bookId = `urn:uuid:${uuid()}`;
    const srcDir = RTL_LANGS.includes(sourceLang) ? 'rtl' : 'ltr';
    const tgtDir = RTL_LANGS.includes(targetLang) ? 'rtl' : 'ltr';

    const css = `
body { font-family: serif; margin: 1em; line-height: 1.5; }
h1, h2, h3 { text-align: center; margin: 1em 0 0.5em; }
.chapter-title { font-size: 1.5em; }
.chapter-subtitle { font-size: 1.05em; color: #555; font-weight: normal; margin-top: -0.3em; }
.pair { display: table; width: 100%; margin: 0 0 1em; border-collapse: collapse; page-break-inside: avoid; }
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
}`.trim();

    let coverHref = null;
    let coverMediaType = null;
    let coverData = null;
    if (parsed.cover) {
      const ext = (parsed.cover.href.match(/\.[a-zA-Z0-9]+$/) || ['.jpg'])[0];
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
      buildChapterXhtml(chapter, idx, sourceLang, targetLang, srcDir, tgtDir));

    const manifestItems = [
      '<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>',
      '<item id="style" href="style.css" media-type="text/css"/>',
      '<item id="titlepage" href="titlepage.xhtml" media-type="application/xhtml+xml"/>',
    ];
    if (coverHref) {
      manifestItems.push(`<item id="cover" href="${escapeXml(coverHref)}" media-type="${escapeXml(coverMediaType)}"/>`);
    }
    parsed.chapters.forEach((_, idx) => {
      manifestItems.push(`<item id="chapter${idx}" href="chapter-${idx}.xhtml" media-type="application/xhtml+xml"/>`);
    });

    const spineItems = ['<itemref idref="titlepage"/>'];
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

    const navPoints = [
      `<navPoint id="navPoint-0" playOrder="1"><navLabel><text>${escapeXml(title)}</text></navLabel><content src="titlepage.xhtml"/></navPoint>`,
    ];
    parsed.chapters.forEach((chapter, idx) => {
      const label = chapter.navTitle || `Chapter ${idx + 1}`;
      navPoints.push(`<navPoint id="navPoint-${idx + 1}" playOrder="${idx + 2}"><navLabel><text>${escapeXml(label)}</text></navLabel><content src="chapter-${idx}.xhtml"/></navPoint>`);
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
    zip.file('style.css', css);
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

  function buildChapterXhtml(chapter, idx, sourceLang, targetLang, srcDir, tgtDir) {
    const parts = [];
    for (const block of chapter.blocks) {
      const tag = block.tag;
      const isHeading = /^h[1-6]$/.test(tag);
      const isQuote = tag === 'blockquote';
      const classes = ['pair'];
      if (isHeading) classes.push('heading', tag);
      else if (isQuote) classes.push('blockquote');
      const srcClass = 'src' + (srcDir === 'rtl' ? ' rtl' : '');
      const tgtClass = 'tgt' + (tgtDir === 'rtl' ? ' rtl' : '');
      parts.push(
        `<div class="${classes.join(' ')}">` +
        `<div class="${srcClass}" lang="${escapeXml(sourceLang)}">${escapeXml(block.text)}</div>` +
        `<div class="${tgtClass}" lang="${escapeXml(targetLang)}">${escapeXml(block.translation || '')}</div>` +
        `</div>`
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

  async function onEpubFileSelected(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const status = document.getElementById('epub-status');
    status.textContent = 'Reading EPUB…';
    status.classList.remove('error');

    try {
      parsedEpub = await parseEpub(file);
      const totalBlocks = parsedEpub.chapters.reduce((s, c) => s + c.blocks.length, 0);
      const info = document.getElementById('epub-info');
      info.classList.remove('hide');
      info.innerHTML = '';
      const rows = [
        ['Title', parsedEpub.title || '—'],
        ['Author', parsedEpub.author || '—'],
        ['Detected language', parsedEpub.language || '—'],
        ['Chapters', String(parsedEpub.chapters.length)],
        ['Paragraphs / headings', String(totalBlocks)],
      ];
      for (const [k, v] of rows) {
        const row = document.createElement('div');
        row.className = 'info-row';
        const key = document.createElement('span');
        key.className = 'info-key';
        key.textContent = k;
        const val = document.createElement('span');
        val.className = 'info-val';
        val.textContent = v;
        row.appendChild(key);
        row.appendChild(val);
        info.appendChild(row);
      }

      const slInput = document.getElementById('epub-sl');
      if (!slInput.value && parsedEpub.language) {
        slInput.value = normalizeLanguageCode(parsedEpub.language);
      }
      const titleInput = document.getElementById('epub-book-title');
      if (!titleInput.value) titleInput.value = parsedEpub.title;

      status.textContent = `Loaded: ${parsedEpub.chapters.length} chapters, ${totalBlocks} blocks.`;
      document.getElementById('epub-convert-btn').disabled = false;
    } catch (err) {
      console.error(err);
      parsedEpub = null;
      status.textContent = `Could not read EPUB: ${err.message}`;
      status.classList.add('error');
      document.getElementById('epub-convert-btn').disabled = true;
    }
  }

  async function convertEpub() {
    if (!parsedEpub) {
      alert('Please choose an EPUB file first.');
      return;
    }
    const sourceLang = (document.getElementById('epub-sl').value || '').trim().toLowerCase();
    const targetLang = (document.getElementById('epub-tl').value || '').trim().toLowerCase();
    const userTitle = (document.getElementById('epub-book-title').value || '').trim();

    if (!sourceLang || !targetLang) {
      alert('Please enter both source and target language codes.');
      return;
    }

    translationCancelled = false;
    downloadBlob = null;

    document.querySelector('.del')?.classList.add('hide');
    document.querySelector('#info')?.classList.add('hide');
    document.querySelector('.book-actions')?.remove();

    const output = document.getElementById('output');
    output.innerHTML = '';

    const items = [];
    for (let c = 0; c < parsedEpub.chapters.length; c++) {
      const chapter = parsedEpub.chapters[c];
      const chDiv = document.createElement('div');
      chDiv.className = 'chapter';
      chDiv.id = `ch-${c}`;
      const h = document.createElement('h2');
      h.className = 'chapter-title-display';
      h.textContent = chapter.navTitle;
      chDiv.appendChild(h);

      for (let b = 0; b < chapter.blocks.length; b++) {
        const block = chapter.blocks[b];
        const pair = document.createElement('div');
        pair.className = 'paragraph';
        pair.id = `c${c}-b${b}`;
        if (/^h[1-6]$/.test(block.tag)) pair.classList.add('is-heading');

        const src = document.createElement('div');
        src.className = 'source' + (RTL_LANGS.includes(sourceLang) ? ' rtl' : '');
        src.textContent = block.text;

        const tgt = document.createElement('div');
        tgt.className = 'english' + (RTL_LANGS.includes(targetLang) ? ' rtl' : '');
        tgt.textContent = '…';

        pair.appendChild(src);
        pair.appendChild(tgt);
        chDiv.appendChild(pair);

        items.push({
          chapterIdx: c, blockIdx: b, text: block.text, tag: block.tag,
        });
      }
      output.appendChild(chDiv);
    }

    showProgressBar(items.length);

    await translateAll(items, sourceLang, targetLang, ({ done, total, item }) => {
      updateProgress(done, total);
      const pair = document.getElementById(`c${item.chapterIdx}-b${item.blockIdx}`);
      if (pair) {
        pair.querySelector('.english').textContent = item.translation || '';
      }
      parsedEpub.chapters[item.chapterIdx].blocks[item.blockIdx].translation = item.translation || '';
    });

    if (translationCancelled) {
      updateStatus('Cancelled. You can still download a partial EPUB.');
    } else {
      updateStatus('Translation complete.');
    }

    downloadBlob = await buildEpub(parsedEpub, sourceLang, targetLang, userTitle);
    const slug = (userTitle || parsedEpub.title || 'bilingual-book')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'bilingual-book';
    downloadFilename = `${slug}-${sourceLang}-${targetLang}.epub`;
    showBookActions();
  }

  function showProgressBar(total) {
    let bar = document.getElementById('epub-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'epub-progress';
      bar.className = 'epub-progress';
      bar.innerHTML =
        '<div class="progress-row">' +
        '<span id="epub-progress-status">Translating…</span>' +
        '<span><span id="epub-progress-count">0</span> / <span id="epub-progress-total">0</span></span>' +
        '<button id="epub-cancel-btn" class="btn-secondary" type="button">Cancel</button>' +
        '</div>' +
        '<div class="progress-track"><div id="epub-progress-fill" class="progress-fill"></div></div>';
      document.body.prepend(bar);
      document.getElementById('epub-cancel-btn').addEventListener('click', () => {
        translationCancelled = true;
        updateStatus('Cancelling…');
      });
    }
    document.getElementById('epub-progress-total').textContent = total;
    document.getElementById('epub-progress-count').textContent = '0';
    document.getElementById('epub-progress-fill').style.width = '0%';
    document.getElementById('epub-progress-status').textContent = 'Translating…';
  }

  function updateProgress(done, total) {
    document.getElementById('epub-progress-count').textContent = done;
    document.getElementById('epub-progress-fill').style.width = `${(done / total * 100).toFixed(1)}%`;
  }

  function updateStatus(text) {
    const status = document.getElementById('epub-progress-status');
    if (status) status.textContent = text;
    const cancel = document.getElementById('epub-cancel-btn');
    if (cancel) cancel.remove();
  }

  function showBookActions() {
    document.querySelector('.book-actions')?.remove();
    const actions = document.createElement('div');
    actions.className = 'book-actions';

    const downloadBtn = document.createElement('button');
    downloadBtn.addEventListener('click', () => {
      if (downloadBlob) saveAs(downloadBlob, downloadFilename);
    });
    downloadBtn.innerText = 'Download EPUB';

    const newBtn = document.createElement('button');
    newBtn.className = 'btn-secondary';
    newBtn.addEventListener('click', () => location.reload());
    newBtn.innerText = 'Convert another';

    actions.appendChild(downloadBtn);
    actions.appendChild(newBtn);
    document.body.prepend(actions);
  }

  function switchTab(name) {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === name);
    });
    document.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('hide', p.dataset.tab !== name);
    });
  }

  window.onEpubFileSelected = onEpubFileSelected;
  window.convertEpub = convertEpub;
  window.switchTab = switchTab;
})();
