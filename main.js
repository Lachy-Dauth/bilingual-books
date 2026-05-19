const RTL_LANGS = ['ar', 'he', 'fa', 'ur', 'ks', 'ps', 'ug', 'ckb', 'pa', 'sd'];

function escapeXml(s) {
  return s.replace(/[&<>"']/g, c => ({
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

function collectPairs() {
  const pairs = [];
  document.querySelectorAll('#output .paragraph').forEach(p => {
    const src = p.querySelector('.source')?.textContent.trim() ?? '';
    const tgt = p.querySelector('.english')?.textContent.trim() ?? '';
    if (src || tgt) pairs.push({ src, tgt });
  });
  return pairs;
}

function makeBook() {
  const sourceLang = (document.getElementById('sl')?.value || 'en').trim().toLowerCase();
  const targetLang = (document.getElementById('tl')?.value || 'en').trim().toLowerCase();
  const pairs = collectPairs();

  if (!pairs.length) {
    alert('Nothing to export yet.');
    return;
  }

  const bookId = `urn:uuid:${uuid()}`;
  const userTitle = (document.getElementById('book-title')?.value || '').trim();
  const title = userTitle || `Bilingual Book (${sourceLang} → ${targetLang})`;
  const srcDir = RTL_LANGS.includes(sourceLang) ? 'rtl' : 'ltr';
  const tgtDir = RTL_LANGS.includes(targetLang) ? 'rtl' : 'ltr';

  const css = `
body { font-family: serif; margin: 1em; line-height: 1.5; }
h1 { font-size: 1.4em; text-align: center; margin: 1em 0 2em; }
.pair { display: table; width: 100%; margin: 0 0 1em; border-collapse: collapse; page-break-inside: avoid; }
.pair > div { display: table-cell; width: 50%; vertical-align: top; padding: 0.3em 0.6em; }
.src { border-right: 1px solid #ccc; }
.rtl { direction: rtl; text-align: right; }
@media (max-width: 480px) {
  .pair, .pair > div { display: block; width: 100%; }
  .src { border-right: none; border-bottom: 1px solid #ccc; padding-bottom: 0.6em; margin-bottom: 0.6em; }
}
`.trim();

  const body = pairs.map(({ src, tgt }) =>
    `<div class="pair">` +
      `<div class="src ${srcDir === 'rtl' ? 'rtl' : ''}" lang="${escapeXml(sourceLang)}">${escapeXml(src)}</div>` +
      `<div class="tgt ${tgtDir === 'rtl' ? 'rtl' : ''}" lang="${escapeXml(targetLang)}">${escapeXml(tgt)}</div>` +
    `</div>`
  ).join('\n');

  const chapter = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="${escapeXml(sourceLang)}">
<head>
  <meta charset="utf-8"/>
  <title>${escapeXml(title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h1>${escapeXml(title)}</h1>
  ${body}
</body>
</html>`;

  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${escapeXml(title)}</dc:title>
    <dc:language>${escapeXml(sourceLang)}</dc:language>
    <dc:language>${escapeXml(targetLang)}</dc:language>
    <dc:identifier id="bookid" opf:scheme="UUID">${escapeXml(bookId)}</dc:identifier>
    <dc:creator>Bilingual Book Generator</dc:creator>
    <dc:date>${new Date().toISOString().slice(0, 10)}</dc:date>
  </metadata>
  <manifest>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="chapter1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
    <item id="style" href="style.css" media-type="text/css"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="chapter1"/>
  </spine>
</package>`;

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
    <navPoint id="navPoint-1" playOrder="1">
      <navLabel><text>${escapeXml(title)}</text></navLabel>
      <content src="chapter1.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`;

  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file("META-INF/container.xml", containerXml);
  zip.file("content.opf", opf);
  zip.file("toc.ncx", ncx);
  zip.file("style.css", css);
  zip.file("chapter1.xhtml", chapter);

  zip.generateAsync({
    type: "blob",
    mimeType: "application/epub+zip",
    compression: "DEFLATE"
  }).then(content => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'bilingual-book';
    saveAs(content, `${slug}.epub`);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toggleInfo() {
  const infoElement = document.querySelector("#info");
  infoElement.classList.toggle("hide");
}
async function generateBilingualBook() {
  var sourceText = document.getElementById('source-text').value;

  var bookContainer = document.getElementById('output');
  bookContainer.innerHTML = '';

  document.querySelector('.del')?.classList.add('hide');
  document.querySelector('#info')?.classList.add('hide');
  document.querySelector('.book-actions')?.remove();

  var paragraphs = sourceText.replaceAll("\n", " ").replaceAll(".", ".\n").split("\n");

  var sourceLang = document.getElementById('sl').value;
  var targetLang = document.getElementById('tl').value;

  for (var i = 0; i < paragraphs.length; i++) {
    await sleep(3);
    var paragraph = document.createElement('div');
    paragraph.className = 'paragraph';

    var sourcePara = document.createElement('div');
    sourcePara.className = 'source';
    sourcePara.textContent = paragraphs[i];

    var englishPara = document.createElement('div');
    englishPara.className = 'english';

    if (['ar', 'he', 'fa', 'ur', 'ks', 'ps', 'ug', 'ckb', 'pa', 'sd'].includes(targetLang)) {
      englishPara.className += " rtl";
    }

    if (['ar', 'he', 'fa', 'ur', 'ks', 'ps', 'ug', 'ckb', 'pa', 'sd'].includes(sourceLang)) {
      sourcePara.className += " rtl";
    }

    paragraph.appendChild(sourcePara);
    paragraph.appendChild(englishPara);

    bookContainer.appendChild(paragraph);

    translateParagraph(paragraphs[i], englishPara, sourceLang, targetLang);
  }

  await sleep(5000);

  const actions = document.createElement('div');
  actions.className = 'book-actions';

  const downloadBtn = document.createElement('button');
  downloadBtn.addEventListener('click', makeBook);
  downloadBtn.innerText = "Download Epub";

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-secondary';
  deleteBtn.addEventListener('click', resetBook);
  deleteBtn.innerText = "Delete Book";

  actions.appendChild(downloadBtn);
  actions.appendChild(deleteBtn);
  document.body.prepend(actions);
}

function resetBook() {
  document.getElementById('output').innerHTML = '';
  document.querySelector('.book-actions')?.remove();
  document.querySelector('.del')?.classList.remove('hide');
}

function toggleTheme() {
  const body = document.body;
  body.classList.toggle('bw');
}

function translateParagraph(sourceText, targetElement, sourceLang, targetLang) {
  var url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + sourceLang + '&tl=' + targetLang + '&dt=t&q=' + encodeURI(sourceText);

  fetch(url)
    .then(response => response.json())
    .then(data => {
      data.splice(data.length - 7, 7)
      data = data[0]
      var translatedText = data.map(item => item[0]).join(" ");
      targetElement.textContent = translatedText;
    })
    .catch(error => console.log('Translation error:', error));
}

function copy() {
  // Get the text field
  var text = ".Harry Potter à L'École des Sorciers.. Chapitre 1 - Le survivant.. Mr et Mrs Dursley, qui habitaient au 4, Privet Drive, avaient toujours affirmé avec la plus grande fierté qu'ils étaient parfaitement normaux, merci pour eux. Jamais quiconque n'aurait imaginé qu'ils puissent se trouver impliqués dans quoi que ce soit d'étrange ou de mystérieux. Ils n'avaient pas de temps à perdre avec des sornettes. Mr Dursley dirigeait la Grunnings, une entreprise qui fabriquait des perceuses. C'était un homme grand et massif, qui n'avait pratiquement pas de cou, mais possédait en revanche une moustache de belle taille. Mrs Dursley, quant à elle, était mince et blonde et disposait d'un cou deux fois plus long que la moyenne, ce qui lui était fort utile pour espionner ses voisins en regardant par-dessus les clôtures des jardins. Les Dursley avaient un petit garçon prénommé Dudley et c'était à leurs yeux le plus bel enfant du monde. Les Dursley avaient tout ce qu'ils voulaient. La seule chose indésirable qu'ils possédaient, c'était un secret dont ils craignaient plus que tout qu'on le découvre un jour. Si jamais quiconque venait à entendre parler des Potter, ils étaient convaincus qu'ils ne s'en remettraient pas. Mrs Potter était la sœur de Mrs Dursley, mais toutes deux ne s'étaient plus revues depuis des années. En fait, Mrs Dursley faisait comme si elle était fille unique, car sa sœur et son bon à rien de mari étaient aussi éloignés que possible de tout ce qui faisait un Dursley. Les Dursley tremblaient d'épouvante à la pensée de ce que diraient les voisins si par malheur les Potter se montraient dans leur rue. Ils savaient que les Potter, eux aussi, avaient un petit garçon, mais ils ne l'avaient jamais vu. Son existence constituait une raison supplémentaire de tenir les Potter à distance : il n'était pas question que le petit Dudley se mette à fréquenter un enfant comme celui-là.";

  // Copy the text inside the text field
  navigator.clipboard.writeText(text);
}