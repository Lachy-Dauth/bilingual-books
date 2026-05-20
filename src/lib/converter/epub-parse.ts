import JSZip from 'jszip';
import { BLOCK_SELECTOR } from './constants';
import type { Block, Chapter, ParsedEpub } from './types';
import { dirname, joinPath } from './util';

const DC_NS = 'http://purl.org/dc/elements/1.1/';

function findFirstNS(
  doc: Document,
  localName: string,
  namespaces: string[],
): Element | null {
  for (const ns of namespaces) {
    const els = doc.getElementsByTagNameNS(ns, localName);
    if (els.length) return els[0];
  }
  const prefixed = doc.getElementsByTagName(`dc:${localName}`);
  if (prefixed.length) return prefixed[0];
  const plain = doc.getElementsByTagName(localName);
  return plain.length ? plain[0] : null;
}

function getDcText(doc: Document, localName: string): string {
  const el = findFirstNS(doc, localName, [DC_NS]);
  return el ? (el.textContent ?? '').trim() : '';
}

function extractBlocks(content: string): Block[] {
  const parser = new DOMParser();
  let doc = parser.parseFromString(content, 'application/xhtml+xml');
  if (doc.getElementsByTagName('parsererror').length > 0) {
    doc = parser.parseFromString(content, 'text/html');
  }
  const body = doc.getElementsByTagName('body')[0];
  if (!body) return [];

  const elements = body.querySelectorAll(BLOCK_SELECTOR);
  const blocks: Block[] = [];
  const seen = new Set<Element>();
  elements.forEach((el) => {
    let parent = el.parentElement;
    while (parent && parent !== body) {
      if (seen.has(parent)) return;
      parent = parent.parentElement;
    }
    const text = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    seen.add(el);
    blocks.push({ tag: el.tagName.toLowerCase(), text });
  });
  return blocks;
}

function guessChapterTitle(blocks: Block[]): string {
  const heading = blocks.find((b) => /^h[1-6]$/.test(b.tag));
  if (heading) return heading.text.slice(0, 80);
  return '';
}

export async function parseEpub(file: Blob | ArrayBuffer): Promise<ParsedEpub> {
  const zip = await JSZip.loadAsync(file);
  const parser = new DOMParser();

  const containerFile = zip.file('META-INF/container.xml');
  if (!containerFile)
    throw new Error('Not a valid EPUB: missing META-INF/container.xml');
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

  const title = getDcText(opfDoc, 'title') || 'Untitled';
  const language = getDcText(opfDoc, 'language');
  const author = getDcText(opfDoc, 'creator');

  const manifestEl = opfDoc.getElementsByTagName('manifest')[0];
  if (!manifestEl) throw new Error('OPF has no <manifest>');
  const manifest: Record<string, { id: string; href: string; mediaType: string; fullPath: string }> =
    {};
  const manifestItems = manifestEl.getElementsByTagName('item');
  for (let i = 0; i < manifestItems.length; i++) {
    const item = manifestItems[i];
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    const mediaType = item.getAttribute('media-type') || '';
    if (id && href) {
      manifest[id] = {
        id,
        href,
        mediaType,
        fullPath: joinPath(opfDir, decodeURIComponent(href)),
      };
    }
  }

  let cover: ParsedEpub['cover'] = null;
  const metas = opfDoc.getElementsByTagName('meta');
  for (let i = 0; i < metas.length; i++) {
    if (metas[i].getAttribute('name') === 'cover') {
      const ref = metas[i].getAttribute('content');
      if (!ref) break;
      const coverItem = manifest[ref];
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

  const navMap: Record<string, string> = {};
  const ncxManifestItem = Object.values(manifest).find(
    (m) => m.mediaType === 'application/x-dtbncx+xml',
  );
  if (ncxManifestItem) {
    try {
      const ncxFile = zip.file(ncxManifestItem.fullPath);
      if (ncxFile) {
        const ncxXml = await ncxFile.async('string');
        const ncxDoc = parser.parseFromString(ncxXml, 'application/xml');
        const navPoints = ncxDoc.getElementsByTagName('navPoint');
        const ncxDir = dirname(ncxManifestItem.fullPath);
        for (let i = 0; i < navPoints.length; i++) {
          const np = navPoints[i];
          const textEl = np.getElementsByTagName('text')[0];
          const contentEl = np.getElementsByTagName('content')[0];
          if (!textEl || !contentEl) continue;
          const label = (textEl.textContent ?? '').trim();
          const src = (contentEl.getAttribute('src') || '').split('#')[0];
          if (!src) continue;
          const fullPath = joinPath(ncxDir, decodeURIComponent(src));
          if (!navMap[fullPath]) navMap[fullPath] = label;
        }
      }
    } catch (err) {
      console.warn('Could not parse NCX:', err);
    }
  }

  const spineEl = opfDoc.getElementsByTagName('spine')[0];
  if (!spineEl) throw new Error('OPF has no <spine>');
  const spineRefs = spineEl.getElementsByTagName('itemref');

  const chapters: Chapter[] = [];
  for (let i = 0; i < spineRefs.length; i++) {
    const idref = spineRefs[i].getAttribute('idref');
    if (!idref) continue;
    const entry = manifest[idref];
    if (!entry) continue;
    const mt = entry.mediaType.toLowerCase();
    if (!mt.includes('html') && !mt.includes('xhtml') && !mt.includes('xml')) continue;

    const chapterFile = zip.file(entry.fullPath);
    if (!chapterFile) continue;
    const content = await chapterFile.async('string');

    const blocks = extractBlocks(content);
    if (blocks.length === 0) continue;

    const navTitle =
      navMap[entry.fullPath] || guessChapterTitle(blocks) || `Section ${chapters.length + 1}`;

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
