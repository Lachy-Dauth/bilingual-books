let text = "";

function makeBook(){
  const zip = new JSZip();
  const mimetype = "application/epub+zip";
  const meta = `<?xml version="1.0" encoding="UTF-8"?>
      <package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="2.0">
      <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>Bilingual Book</dc:title>
          <dc:language>en</dc:language>
          <dc:identifier id="bookid">12345</dc:identifier>
          <dc:creator>Lachlan Dauth</dc:creator>
      </metadata>
      <manifest>
          <item href="toc.ncx" media-type="application/x-dtbncx+xml" id="ncx"/>
          <item href="chapter1.xhtml" media-type="application/xhtml+xml" id="chapter1"/>
          <item href="chapter2.xhtml" media-type="application/xhtml+xml" id="chapter2"/>
      </manifest>
      <spine toc="ncx">
          <itemref idref="chapter1"/>
      </spine>
      </package>`;
  const toc = `<?xml version="1.0" encoding="UTF-8"?>
      <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
      <head>
          <meta name="dtb:uid" content="12345"/>
          <meta name="dtb:depth" content="1"/>
          <meta name="dtb:totalPageCount" content="0"/>
          <meta name="dtb:maxPageNumber" content="0"/>
      </head>
      <docTitle>
          <text>Bilingual Book</text>
      </docTitle>
      </ncx>`;
  const chapter1 = `<html xmlns="http://www.w3.org/1999/xhtml">
      <head>
          <title>Chapter 1</title>
      </head>
      <body>
          ` + text + `
      </body>
      </html>`;

  zip.file("mimetype", mimetype);
  zip.file("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?>
      <container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
          <rootfiles>
              <rootfile full-path="content.opf" media-type="application/oebps-package+xml"/>
          </rootfiles>
      </container>`);
  zip.file("content.opf", meta);
  zip.file("toc.ncx", toc);
  zip.file("chapter1.xhtml", chapter1);

  zip.generateAsync({ type: "blob" }).then(function(content) {
      saveAs(content, "Bilingual Book.epub");
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

  var paragraphs = sourceText.replaceAll("\n", " ").replaceAll(".", ".\n").split("\n");

  var sourceLang = document.getElementById('sl').value;
  var targetLang = document.getElementById('tl').value;

  for (var i = 0; i < paragraphs.length; i++) {
    await sleep(3);
    var paragraph = document.createElement('div');
    paragraph.style.display = "flex";
    paragraph.style.justifyContent = "space-between";
    paragraph.style.gap = "10px";
    paragraph.style.marginBottom = "10px";
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
  const elementToDelete = document.querySelector('.del');
  if (elementToDelete) {
    elementToDelete.remove();
  }
  const infoElement = document.querySelector('#info');
  if (infoElement) {
    infoElement.remove();
  }

  await sleep(5000);
  text = document.body.innerHTML.replaceAll("&nbsp;", "");
  
  let button = document.createElement('button');
  button.addEventListener('click', makeBook);
  button.innerText = "Download Epub";
  document.body.prepend(button);
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