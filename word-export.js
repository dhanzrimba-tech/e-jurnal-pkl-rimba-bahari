/* E-Jurnal PKL v6.31 - Native DOCX exporter (browser, no build step) */
(function () {
  'use strict';

  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const A = 'http://schemas.openxmlformats.org/drawingml/2006/main';
  const WP = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing';
  const PIC = 'http://schemas.openxmlformats.org/drawingml/2006/picture';
  const REL = 'http://schemas.openxmlformats.org/package/2006/relationships';
  const CONTENT = 'http://schemas.openxmlformats.org/package/2006/content-types';
  const EMU_PER_INCH = 914400;

  function clean(value) {
    return String(value ?? '')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
      .replace(/\r\n?/g, '\n')
      .trim();
  }

  function x(value) {
    return clean(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function pxToEmu(px) {
    return Math.max(1, Math.round((Number(px) || 1) / 96 * EMU_PER_INCH));
  }

  function base64Bytes(base64) {
    const raw = atob(base64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
    return bytes;
  }

  function parseDataUrl(dataUrl) {
    const match = /^data:(image\/(?:png|jpe?g));base64,([A-Za-z0-9+/=\s]+)$/i.exec(String(dataUrl || ''));
    if (!match) return null;
    const mime = match[1].toLowerCase().replace('image/jpg', 'image/jpeg');
    return {
      mime,
      ext: mime === 'image/png' ? 'png' : 'jpg',
      bytes: base64Bytes(match[2].replace(/\s+/g, '')),
    };
  }

  function imageSize(dataUrl) {
    return new Promise((resolve) => {
      if (!String(dataUrl || '').startsWith('data:image/')) return resolve({ width: 900, height: 600 });
      if (typeof Image === 'undefined') return resolve({ width: 900, height: 600 });
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth || 900, height: img.naturalHeight || 600 });
      img.onerror = () => resolve({ width: 900, height: 600 });
      img.src = dataUrl;
    });
  }

  class DocxBuilder {
    constructor(zip) {
      this.zip = zip;
      this.body = [];
      this.relationships = [
        { id: 'rId1', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles', target: 'styles.xml' },
        { id: 'rId2', type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer', target: 'footer1.xml' },
      ];
      this.imageCounter = 0;
      this.docPrCounter = 1;
    }

    run(text, opts = {}) {
      const value = clean(text);
      if (!value && !opts.break) return '';
      const props = [];
      if (opts.bold) props.push('<w:b/>');
      if (opts.italic) props.push('<w:i/>');
      if (opts.underline) props.push('<w:u w:val="single"/>');
      if (opts.size) props.push(`<w:sz w:val="${Math.round(opts.size * 2)}"/><w:szCs w:val="${Math.round(opts.size * 2)}"/>`);
      const rPr = props.length ? `<w:rPr>${props.join('')}</w:rPr>` : '';
      if (opts.break) return `<w:r>${rPr}<w:br${opts.break === 'page' ? ' w:type="page"' : ''}/></w:r>`;
      const lines = value.split('\n');
      const content = lines.map((line, idx) => `${idx ? '<w:br/>' : ''}<w:t xml:space="preserve">${x(line)}</w:t>`).join('');
      return `<w:r>${rPr}${content}</w:r>`;
    }

    paragraph(text = '', opts = {}) {
      const pPr = [];
      if (opts.style) pPr.push(`<w:pStyle w:val="${x(opts.style)}"/>`);
      if (opts.align) pPr.push(`<w:jc w:val="${x(opts.align)}"/>`);
      if (opts.keepNext) pPr.push('<w:keepNext/>');
      if (opts.keepLines) pPr.push('<w:keepLines/>');
      if (opts.pageBreakBefore) pPr.push('<w:pageBreakBefore/>');
      const spacing = [];
      if (opts.before != null) spacing.push(`w:before="${Math.round(opts.before)}"`);
      if (opts.after != null) spacing.push(`w:after="${Math.round(opts.after)}"`);
      if (opts.line != null) spacing.push(`w:line="${Math.round(opts.line)}" w:lineRule="auto"`);
      if (spacing.length) pPr.push(`<w:spacing ${spacing.join(' ')}/>`);
      const ind = [];
      if (opts.firstLine != null) ind.push(`w:firstLine="${Math.round(opts.firstLine)}"`);
      if (opts.left != null) ind.push(`w:left="${Math.round(opts.left)}"`);
      if (opts.hanging != null) ind.push(`w:hanging="${Math.round(opts.hanging)}"`);
      if (ind.length) pPr.push(`<w:ind ${ind.join(' ')}/>`);
      const runs = Array.isArray(text)
        ? text.map((item) => typeof item === 'string' ? this.run(item, opts) : this.run(item.text, item)).join('')
        : this.run(text, opts);
      this.body.push(`<w:p>${pPr.length ? `<w:pPr>${pPr.join('')}</w:pPr>` : ''}${runs}</w:p>`);
    }

    textParagraphs(value, opts = {}) {
      const parts = clean(value).split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
      if (!parts.length) {
        this.paragraph(opts.fallback || '-', { ...opts, firstLine: opts.firstLine ?? 720, line: opts.line ?? 360, after: opts.after ?? 120 });
        return;
      }
      parts.forEach((part) => this.paragraph(part, { ...opts, firstLine: opts.firstLine ?? 720, line: opts.line ?? 360, after: opts.after ?? 120 }));
    }

    heading(text, level = 1, opts = {}) {
      this.paragraph(text, {
        style: `Heading${Math.min(3, Math.max(1, level))}`,
        align: level === 1 ? 'center' : 'left',
        keepNext: true,
        after: level === 1 ? 240 : 120,
        before: level === 1 ? 0 : 180,
        ...opts,
      });
    }

    pageBreak() {
      this.body.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    }

    spacer(lines = 1) {
      for (let i = 0; i < lines; i += 1) this.paragraph('', { after: 160 });
    }

    cell(content, opts = {}) {
      const width = opts.width ? `<w:tcW w:w="${opts.width}" w:type="dxa"/>` : '<w:tcW w:w="0" w:type="auto"/>';
      const shade = opts.shade ? `<w:shd w:val="clear" w:color="auto" w:fill="${opts.shade}"/>` : '';
      const vAlign = `<w:vAlign w:val="${opts.vAlign || 'top'}"/>`;
      const margins = '<w:tcMar><w:top w:w="90" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar>';
      const paragraphs = Array.isArray(content) ? content.join('') : content;
      return `<w:tc><w:tcPr>${width}${shade}${vAlign}${margins}</w:tcPr>${paragraphs || '<w:p/>'}</w:tc>`;
    }

    pXml(text, opts = {}) {
      const pPr = [];
      if (opts.align) pPr.push(`<w:jc w:val="${opts.align}"/>`);
      if (opts.after != null) pPr.push(`<w:spacing w:after="${opts.after}"/>`);
      if (opts.keepNext) pPr.push('<w:keepNext/>');
      const runProps = `${opts.bold ? '<w:b/>' : ''}${opts.italic ? '<w:i/>' : ''}${opts.size ? `<w:sz w:val="${Math.round(opts.size * 2)}"/><w:szCs w:val="${Math.round(opts.size * 2)}"/>` : ''}`;
      const runs = clean(text).split('\n').map((line, idx) => `${idx ? '<w:r><w:br/></w:r>' : ''}<w:r>${runProps ? `<w:rPr>${runProps}</w:rPr>` : ''}<w:t xml:space="preserve">${x(line)}</w:t></w:r>`).join('');
      return `<w:p>${pPr.length ? `<w:pPr>${pPr.join('')}</w:pPr>` : ''}${runs}</w:p>`;
    }

    table(rows, opts = {}) {
      const widths = opts.widths || [];
      const borders = opts.borders === false
        ? '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>'
        : '<w:tblBorders><w:top w:val="single" w:sz="6" w:color="666666"/><w:left w:val="single" w:sz="6" w:color="666666"/><w:bottom w:val="single" w:sz="6" w:color="666666"/><w:right w:val="single" w:sz="6" w:color="666666"/><w:insideH w:val="single" w:sz="4" w:color="B7B7B7"/><w:insideV w:val="single" w:sz="4" w:color="B7B7B7"/></w:tblBorders>';
      const grid = widths.length ? `<w:tblGrid>${widths.map((w) => `<w:gridCol w:w="${w}"/>`).join('')}</w:tblGrid>` : '';
      const xmlRows = rows.map((row, rowIndex) => {
        const cells = row.map((cell, cellIndex) => {
          const value = typeof cell === 'object' && cell !== null ? cell : { text: cell };
          const p = this.pXml(value.text ?? '', {
            bold: value.bold ?? (opts.header && rowIndex === 0),
            align: value.align || (opts.header && rowIndex === 0 ? 'center' : 'left'),
            size: value.size,
            after: 0,
          });
          return this.cell(p, {
            width: widths[cellIndex],
            shade: value.shade || (opts.header && rowIndex === 0 ? 'E7E6E6' : ''),
            vAlign: value.vAlign,
          });
        }).join('');
        const header = opts.header && rowIndex === 0 ? '<w:trPr><w:tblHeader/></w:trPr>' : '';
        return `<w:tr>${header}${cells}</w:tr>`;
      }).join('');
      this.body.push(`<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblLayout w:type="fixed"/>${borders}<w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr>${grid}${xmlRows}</w:tbl>`);
    }

    signatureTable(items) {
      const pairs = [];
      for (let i = 0; i < items.length; i += 2) pairs.push(items.slice(i, i + 2));
      const rows = pairs.map((pair) => {
        while (pair.length < 2) pair.push({ role: '', name: '' });
        return pair.map((item) => {
          const content = [
            this.pXml(item.role || '', { align: 'center', after: 0 }),
            this.pXml('\n\n\n', { align: 'center', after: 0 }),
            this.pXml(item.name || '________________________', { align: 'center', bold: true, after: 0 }),
            item.extra ? this.pXml(item.extra, { align: 'center', after: 0 }) : '',
          ].join('');
          return this.cell(content, { width: 3968, vAlign: 'top' });
        }).join('');
      }).map((cells) => `<w:tr>${cells}</w:tr>`).join('');
      this.body.push(`<w:tbl><w:tblPr><w:tblW w:w="7936" w:type="dxa"/><w:tblLayout w:type="fixed"/><w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="3968"/><w:gridCol w:w="3968"/></w:tblGrid>${rows}</w:tbl>`);
    }

    async image(dataUrl, opts = {}) {
      const parsed = parseDataUrl(dataUrl);
      if (!parsed) {
        if (opts.fallback) this.paragraph(opts.fallback, { align: 'center', italic: true, after: 100 });
        return null;
      }
      const dim = await imageSize(dataUrl);
      const maxWidth = opts.maxWidthPx || 510;
      const maxHeight = opts.maxHeightPx || 350;
      const ratio = Math.min(maxWidth / dim.width, maxHeight / dim.height, 1);
      const width = opts.widthPx || Math.max(80, Math.round(dim.width * ratio));
      const height = opts.heightPx || Math.max(60, Math.round(dim.height * ratio));
      this.imageCounter += 1;
      const fileName = `image${this.imageCounter}.${parsed.ext}`;
      this.zip.file(`word/media/${fileName}`, parsed.bytes, { binary: true });
      const relId = `rId${this.relationships.length + 1}`;
      this.relationships.push({ id: relId, type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image', target: `media/${fileName}` });
      const docPr = this.docPrCounter++;
      const cx = pxToEmu(width);
      const cy = pxToEmu(height);
      const drawing = `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${docPr}" name="Picture ${docPr}" descr="${x(opts.alt || 'Dokumentasi PKL')}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="${A}" noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic xmlns:a="${A}"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="${PIC}"><pic:nvPicPr><pic:cNvPr id="0" name="${x(fileName)}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${relId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`;
      this.body.push(`<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="120" w:after="80"/></w:pPr>${drawing}</w:p>`);
      return { width, height };
    }

    addToc() {
      this.body.push('<w:p><w:pPr><w:jc w:val="left"/></w:pPr><w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o "1-3" \\h \\z \\u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>Klik kanan daftar isi lalu pilih Update Field jika nomor halaman belum muncul.</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>');
    }

    finalize() {
      const sectPr = '<w:sectPr><w:footerReference w:type="default" r:id="rId2"/><w:titlePg/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1701" w:right="1701" w:bottom="1701" w:left="2268" w:header="720" w:footer="720" w:gutter="0"/><w:cols w:space="720"/><w:docGrid w:linePitch="360"/></w:sectPr>';
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${W}" xmlns:r="${R}" xmlns:wp="${WP}" xmlns:a="${A}" xmlns:pic="${PIC}"><w:body>${this.body.join('')}${sectPr}</w:body></w:document>`;
      this.zip.file('word/document.xml', documentXml);
      const rels = this.relationships.map((rel) => `<Relationship Id="${rel.id}" Type="${rel.type}" Target="${rel.target}"/>`).join('');
      this.zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${REL}">${rels}</Relationships>`);
    }
  }

  const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${W}">
  <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="id-ID"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/><w:jc w:val="both"/></w:pPr></w:pPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:pPr><w:widowControl/></w:pPr><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:keepLines/><w:spacing w:before="0" w:after="240"/><w:jc w:val="center"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="180" w:after="100"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="120" w:after="80"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>
</w:styles>`;

  const footerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="${W}"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;

  function addPackageFiles(zip, title) {
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="${CONTENT}"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/></Types>`);
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${REL}"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`);
    zip.file('word/styles.xml', stylesXml);
    zip.file('word/footer1.xml', footerXml);
    const now = new Date().toISOString();
    zip.file('docProps/core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${x(title)}</dc:title><dc:creator>E-Jurnal PKL Rimba Bahari</dc:creator><cp:lastModifiedBy>E-Jurnal PKL Rimba Bahari</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`);
    zip.file('docProps/app.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>E-Jurnal PKL</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><Company>SMK Kehutanan Rimba Bahari Sumedang</Company><AppVersion>6.31</AppVersion></Properties>');
  }

  function labelValueRows(items) {
    return items.map(([label, value]) => [
      { text: label, bold: true },
      { text: value || '-' },
    ]);
  }

  function addCover(builder, payload) {
    builder.paragraph(payload.title || 'LAPORAN PRAKTIK KERJA LAPANGAN', { align: 'center', bold: true, size: 18, after: 180 });
    builder.paragraph(payload.internshipPlace || '-', { align: 'center', bold: true, size: 14, after: 220 });
    builder.spacer(1);
    return builder.image(payload.logoSrc, { widthPx: 120, heightPx: 120, maxWidthPx: 120, maxHeightPx: 120, alt: 'Logo sekolah' }).then(() => {
      builder.spacer(1);
      if (payload.group) {
        builder.paragraph('Disusun oleh Kelompok PKL', { align: 'center', bold: true, after: 120 });
        const memberRows = [['No', 'Nama', 'NISN', 'Kelas'], ...(payload.members || []).map((m, i) => [String(i + 1), m.full_name || '-', m.nis || '-', m.class_name || '-'])];
        builder.table(memberRows, { header: true, widths: [550, 3600, 1700, 2080] });
      } else {
        builder.table(labelValueRows([
          ['Nama', payload.studentName],
          ['NISN', payload.nis],
          ['Kelas', payload.className],
          ['Program', 'Praktik Kerja Lapangan'],
        ]), { borders: false, widths: [1800, 6100] });
      }
      builder.spacer(4);
      builder.paragraph(payload.schoolName || 'SMK Kehutanan Rimba Bahari Sumedang', { align: 'center', bold: true, size: 13, after: 60 });
      builder.paragraph(`Tahun Pelajaran ${payload.schoolYear || '-'}`, { align: 'center', bold: true, after: 0 });
    });
  }

  function addApproval(builder, payload) {
    builder.pageBreak();
    builder.heading('LEMBAR PENGESAHAN', 1, { pageBreakBefore: false });
    builder.textParagraphs(payload.group
      ? 'Laporan Praktik Kerja Lapangan kelompok ini telah diperiksa dan disetujui sebagai dokumentasi pelaksanaan PKL pada lokasi yang sama.'
      : 'Laporan Praktik Kerja Lapangan ini telah diperiksa dan disetujui sebagai dokumentasi pelaksanaan PKL siswa.', { firstLine: 720 });
    const rows = payload.group ? [
      ['Tempat PKL', payload.internshipPlace],
      ['Unit Penempatan', payload.placementUnit],
      ['Periode PKL', payload.period],
      ['Jumlah Anggota', `${(payload.members || []).length} siswa`],
      ['Status Laporan', payload.statusLabel],
    ] : [
      ['Nama Siswa', payload.studentName],
      ['NISN / Kelas', `${payload.nis || '-'} / ${payload.className || '-'}`],
      ['Tempat PKL', payload.internshipPlace],
      ['Unit Penempatan', payload.placementUnit],
      ['Periode PKL', payload.period],
      ['Status Laporan', payload.statusLabel],
    ];
    builder.table(labelValueRows(rows), { widths: [2200, 5700] });
    if (payload.group) {
      builder.heading('Anggota Kelompok', 2);
      builder.table([['No', 'Nama', 'NISN', 'Kelas'], ...(payload.members || []).map((m, i) => [String(i + 1), m.full_name || '-', m.nis || '-', m.class_name || '-'])], { header: true, widths: [550, 3600, 1700, 2080] });
    }
    builder.paragraph(`${payload.approvalLocation || 'Sumedang'}, ${payload.approvalDate || '-'}`, { align: 'right', after: 180, firstLine: 0 });
    builder.signatureTable(payload.signatures || []);
  }

  function addPreface(builder, payload) {
    builder.pageBreak();
    builder.heading('KATA PENGANTAR', 1, { pageBreakBefore: false });
    builder.textParagraphs(payload.preface, { fallback: 'Kata pengantar belum diisi.' });
  }

  function addToc(builder) {
    builder.pageBreak();
    builder.heading('DAFTAR ISI', 1, { pageBreakBefore: false });
    builder.addToc();
    builder.paragraph('Catatan: bila nomor halaman belum muncul, klik kanan pada daftar isi lalu pilih Update Field > Update entire table.', { italic: true, size: 10, firstLine: 0, after: 80 });
  }

  function figureCaption(journal, index, group) {
    const who = group && journal.student_name ? ` oleh ${journal.student_name}` : '';
    return `Gambar 3.${index + 1}. Dokumentasi ${journal.activity_title || 'Kegiatan PKL'}${who} pada ${journal.date || '-'}`;
  }

  function addFigureList(builder, payload) {
    builder.pageBreak();
    builder.heading('DAFTAR GAMBAR', 1, { pageBreakBefore: false });
    const figures = (payload.discussionJournals || []).filter((j) => j.photoSrc);
    if (!figures.length) return builder.paragraph('Tidak ada foto pada jurnal terpilih untuk BAB III.', { firstLine: 0 });
    figures.forEach((journal, index) => builder.paragraph(figureCaption(journal, index, payload.group), { firstLine: 0, after: 80 }));
  }

  function addChapterOne(builder, payload) {
    builder.pageBreak();
    builder.heading('BAB I\nPENDAHULUAN', 1, { pageBreakBefore: false });
    builder.heading('1.1 Latar Belakang', 2);
    builder.textParagraphs(payload.standardBackground, { fallback: '-' });
    builder.heading('1.2 Tujuan PKL', 2);
    builder.textParagraphs(payload.standardObjectives, { fallback: '-' });
    builder.heading('1.3 Manfaat PKL', 2);
    builder.textParagraphs(payload.standardBenefits, { fallback: '-' });
    builder.heading('1.4 Waktu dan Tempat Pelaksanaan', 2);
    const meta = [
      ['Tempat PKL', payload.internshipPlace],
      ['Unit/Bagian', payload.placementUnit],
      ['Periode', payload.period],
    ];
    if (payload.group) meta.push(['Jumlah anggota', `${(payload.members || []).length} siswa`]);
    builder.table(labelValueRows(meta), { widths: [2200, 5700] });
  }

  function addChapterTwo(builder, payload) {
    builder.pageBreak();
    builder.heading('BAB II\nPROFIL TEMPAT PRAKTIK KERJA LAPANGAN', 1, { pageBreakBefore: false });
    builder.heading('2.1 Identitas dan Gambaran Umum Instansi', 2);
    builder.textParagraphs(payload.institutionProfile, { fallback: '-' });
    builder.heading('2.2 Struktur Organisasi / Posisi Penempatan', 2);
    builder.textParagraphs(payload.organizationStructure, { fallback: 'Struktur organisasi tidak dicantumkan.' });
    builder.heading(payload.group ? '2.3 Bidang atau Bagian Penempatan Kelompok' : '2.3 Bidang atau Bagian Penempatan Siswa', 2);
    builder.textParagraphs(`${payload.group ? 'Kelompok' : 'Siswa'} melaksanakan PKL pada unit/bagian ${payload.placementUnit || '-'} di ${payload.internshipPlace || '-'}.`);
  }

  async function addChapterThree(builder, payload) {
    builder.pageBreak();
    builder.heading('BAB III\nPEMBAHASAN PRAKTIK KERJA LAPANGAN', 1, { pageBreakBefore: false });
    const selected = payload.discussionJournals || [];
    builder.heading('3.1 Ringkasan Hasil Praktik Kerja Lapangan', 2);
    if (!selected.length) {
      builder.paragraph('Belum ada jurnal berstatus Disetujui yang dapat dibahas.', { firstLine: 720 });
      return;
    }
    const groupText = payload.group ? ` dari ${(payload.members || []).length} anggota kelompok` : '';
    builder.textParagraphs(`Dari ${payload.approvedJournalCount || selected.length} jurnal yang telah disetujui${groupText}, sistem memilih ${selected.length} kegiatan representatif untuk BAB III setelah materi yang sama atau sangat mirip digabungkan. Pemilihan mengutamakan jurnal yang uraian, tahapan kerja, hasil pembelajaran, refleksi, dan dokumentasinya paling lengkap. Total jam kerja yang tetap dihitung dari seluruh jurnal disetujui adalah ${payload.totalHours || 0} jam. Dengan cara ini pembahasan tetap mewakili kegiatan PKL tanpa mengulang materi yang sama.`);
    builder.heading('3.2 Pembahasan Kegiatan Terpilih', 2);
    let figureIndex = 0;
    for (let i = 0; i < selected.length; i += 1) {
      const j = selected[i];
      builder.heading(`3.2.${i + 1} ${j.activity_title || 'Kegiatan PKL'}`, 3);
      const who = payload.group && j.student_name ? `${j.student_name} ` : 'Siswa ';
      let p1 = `${who}melaksanakan kegiatan ${j.activity_title || 'kegiatan PKL'} pada ${j.date || '-'}${j.location ? ` di ${j.location}` : ''}.`;
      if (j.description) p1 += ` Berdasarkan jurnal harian, kegiatan tersebut mencakup ${j.description}.`;
      if (Array.isArray(j.activity_stages) && j.activity_stages.length) p1 += ` Tahapan kerja yang tercatat meliputi ${j.activity_stages.join(', ')}.`;
      builder.textParagraphs(p1);
      const outcome = [];
      if (j.learning) outcome.push(`Hasil pembelajaran yang diperoleh adalah ${j.learning}.`);
      if (j.obstacles) outcome.push(`Kendala dan penyelesaiannya adalah ${j.obstacles}.`);
      if (j.reflection) outcome.push(`Refleksi kegiatan menunjukkan ${j.reflection}.`);
      if (outcome.length) builder.textParagraphs(outcome.join(' '));
      if (j.reference) builder.textParagraphs(`Kegiatan ini relevan dengan kajian ${j.reference.citation}. ${j.reference.relevance}`, { firstLine: 720 });
      if (j.photoSrc) {
        const currentFigure = figureIndex++;
        await builder.image(j.photoSrc, { maxWidthPx: 500, maxHeightPx: 330, alt: `Dokumentasi ${j.activity_title || 'kegiatan PKL'}`, fallback: 'Foto dokumentasi tidak dapat dimuat.' });
        builder.paragraph(figureCaption(j, currentFigure, payload.group), { align: 'center', italic: true, size: 10, firstLine: 0, after: 180 });
      }
    }
  }

  function addChapterFour(builder, payload) {
    builder.pageBreak();
    builder.heading('BAB IV\nPENUTUP', 1, { pageBreakBefore: false });
    builder.heading('4.1 Kesimpulan', 2);
    builder.textParagraphs(payload.conclusion, { fallback: '-' });
    builder.heading('4.2 Saran', 2);
    builder.heading('A. Untuk Sekolah', 3);
    builder.textParagraphs(payload.suggestionsSchool, { fallback: '-' });
    builder.heading('B. Untuk Tempat PKL', 3);
    builder.textParagraphs(payload.suggestionsWorkplace, { fallback: '-' });
    builder.heading('C. Untuk Siswa', 3);
    builder.textParagraphs(payload.suggestionsStudents, { fallback: '-' });
  }

  function addBibliography(builder, payload) {
    builder.pageBreak();
    builder.heading('DAFTAR PUSTAKA', 1, { pageBreakBefore: false });
    const refs = payload.references || [];
    if (!refs.length) return builder.paragraph('Belum ada sumber ilmiah yang digunakan.', { firstLine: 0 });
    refs.forEach((ref, index) => builder.paragraph(`${index + 1}. ${ref.apa || '-'}`, { left: 420, hanging: 420, firstLine: 0, after: 140, line: 360 }));
  }

  function addAppendix(builder, payload) {
    builder.pageBreak();
    builder.heading(payload.group ? 'LAMPIRAN 1\nDAFTAR ANGGOTA DAN REKAP JURNAL' : 'LAMPIRAN 1\nREKAPITULASI JURNAL HARIAN', 1, { pageBreakBefore: false });
    if (payload.group) {
      builder.heading('Daftar Anggota', 2);
      builder.table([['No', 'Nama', 'NISN', 'Kelas'], ...(payload.members || []).map((m, i) => [String(i + 1), m.full_name || '-', m.nis || '-', m.class_name || '-'])], { header: true, widths: [550, 3600, 1700, 2080] });
      builder.heading('Rekap Jurnal Disetujui', 2);
    }
    const journals = payload.appendixJournals || [];
    if (!journals.length) return builder.paragraph('Belum ada jurnal disetujui.', { firstLine: 0 });
    journals.forEach((j, index) => {
      builder.heading(`${index + 1}. ${j.date || '-'} - ${j.activity_title || 'Kegiatan PKL'}`, 3);
      if (payload.group && j.student_name) builder.paragraph(`Siswa: ${j.student_name}`, { firstLine: 0, after: 60 });
      builder.paragraph(`Lokasi: ${j.location || '-'} | Jam kerja: ${j.work_hours || 0}`, { firstLine: 0, after: 60 });
      builder.paragraph(`Uraian: ${j.description || '-'}`, { firstLine: 0, size: 10.5, after: 60, line: 300 });
      builder.paragraph(`Tahapan: ${(j.activity_stages || []).join(', ') || '-'}`, { firstLine: 0, size: 10.5, after: 60, line: 300 });
      builder.paragraph(`Pengetahuan/Keterampilan: ${j.learning || '-'}`, { firstLine: 0, size: 10.5, after: 60, line: 300 });
      builder.paragraph(`Kendala dan Solusi: ${j.obstacles || '-'}`, { firstLine: 0, size: 10.5, after: 60, line: 300 });
      builder.paragraph(`Refleksi: ${j.reflection || '-'}`, { firstLine: 0, size: 10.5, after: 60, line: 300 });
      builder.paragraph(`Catatan Pembimbing: ${j.supervisor_note || '-'}`, { firstLine: 0, size: 10.5, after: 140, line: 300 });
    });
  }

  async function createReportDocx(payload) {
    if (!window.JSZip) throw new Error('Komponen pembuat Word belum dimuat. Muat ulang aplikasi lalu coba kembali.');
    const zip = new window.JSZip();
    addPackageFiles(zip, payload.title || 'Laporan PKL');
    const builder = new DocxBuilder(zip);
    await addCover(builder, payload);
    addApproval(builder, payload);
    addPreface(builder, payload);
    addToc(builder);
    addFigureList(builder, payload);
    addChapterOne(builder, payload);
    addChapterTwo(builder, payload);
    await addChapterThree(builder, payload);
    addChapterFour(builder, payload);
    addBibliography(builder, payload);
    addAppendix(builder, payload);
    builder.finalize();
    return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 }, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  window.PklWordExport = Object.freeze({ createReportDocx });
})();
