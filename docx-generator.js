/**
 * docx-generator.js
 * Client-side Word Document Generator for Field Trip Report
 * Uses JSZip to modify the official docx template directly in browser memory.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./jszip.min.js'));
  } else {
    root.DocxGenerator = factory(root.JSZip);
  }
})(typeof self !== 'undefined' ? self : this, function (JSZip) {
  'use strict';

  const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const R_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const PKG_R_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
  const CT_NS = 'http://schemas.openxmlformats.org/package/2006/content-types';
  const WP_NS = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing';
  const A_NS = 'http://schemas.openxmlformats.org/drawingml/2006/main';
  const PIC_NS = 'http://schemas.openxmlformats.org/drawingml/2006/picture';

  function createRun(xmlDoc, text, options = {}) {
    const bold = !!options.bold;
    const sz = options.sz || '32';
    const font = options.font || 'TH SarabunPSK';

    const r = xmlDoc.createElementNS(W_NS, 'w:r');
    const rPr = xmlDoc.createElementNS(W_NS, 'w:rPr');

    const rFonts = xmlDoc.createElementNS(W_NS, 'w:rFonts');
    rFonts.setAttributeNS(W_NS, 'w:ascii', font);
    rFonts.setAttributeNS(W_NS, 'w:hAnsi', font);
    rFonts.setAttributeNS(W_NS, 'w:cs', font);
    rPr.appendChild(rFonts);

    if (bold) {
      rPr.appendChild(xmlDoc.createElementNS(W_NS, 'w:b'));
      rPr.appendChild(xmlDoc.createElementNS(W_NS, 'w:bCs'));
    }

    const szEl = xmlDoc.createElementNS(W_NS, 'w:sz');
    szEl.setAttributeNS(W_NS, 'w:val', sz);
    rPr.appendChild(szEl);

    const szCsEl = xmlDoc.createElementNS(W_NS, 'w:szCs');
    szCsEl.setAttributeNS(W_NS, 'w:val', sz);
    rPr.appendChild(szCsEl);

    r.appendChild(rPr);

    const t = xmlDoc.createElementNS(W_NS, 'w:t');
    t.setAttribute('xml:space', 'preserve');
    t.textContent = text;
    r.appendChild(t);

    return r;
  }

  function createImageRun(xmlDoc, rId, docPrId, name = 'Picture', cx = 5200000, cy = 3250000) {
    const r = xmlDoc.createElementNS(W_NS, 'w:r');
    const drawing = xmlDoc.createElementNS(W_NS, 'w:drawing');
    const inline = xmlDoc.createElementNS(WP_NS, 'wp:inline');
    inline.setAttribute('distT', '0');
    inline.setAttribute('distB', '0');
    inline.setAttribute('distL', '0');
    inline.setAttribute('distR', '0');

    const extent = xmlDoc.createElementNS(WP_NS, 'wp:extent');
    extent.setAttribute('cx', String(cx));
    extent.setAttribute('cy', String(cy));
    inline.appendChild(extent);

    const effectExtent = xmlDoc.createElementNS(WP_NS, 'wp:effectExtent');
    effectExtent.setAttribute('l', '0');
    effectExtent.setAttribute('t', '0');
    effectExtent.setAttribute('r', '0');
    effectExtent.setAttribute('b', '0');
    inline.appendChild(effectExtent);

    const docPr = xmlDoc.createElementNS(WP_NS, 'wp:docPr');
    docPr.setAttribute('id', String(docPrId));
    docPr.setAttribute('name', name);
    inline.appendChild(docPr);

    const cNvGraphicFramePr = xmlDoc.createElementNS(WP_NS, 'wp:cNvGraphicFramePr');
    const graphicFrameLocks = xmlDoc.createElementNS(A_NS, 'a:graphicFrameLocks');
    graphicFrameLocks.setAttribute('noChangeAspect', '1');
    cNvGraphicFramePr.appendChild(graphicFrameLocks);
    inline.appendChild(cNvGraphicFramePr);

    const graphic = xmlDoc.createElementNS(A_NS, 'a:graphic');
    const graphicData = xmlDoc.createElementNS(A_NS, 'a:graphicData');
    graphicData.setAttribute('uri', 'http://schemas.openxmlformats.org/drawingml/2006/picture');

    const pic = xmlDoc.createElementNS(PIC_NS, 'pic:pic');

    const nvPicPr = xmlDoc.createElementNS(PIC_NS, 'pic:nvPicPr');
    const cNvPr = xmlDoc.createElementNS(PIC_NS, 'pic:cNvPr');
    cNvPr.setAttribute('id', String(docPrId));
    cNvPr.setAttribute('name', name);
    nvPicPr.appendChild(cNvPr);
    nvPicPr.appendChild(xmlDoc.createElementNS(PIC_NS, 'pic:cNvPicPr'));
    pic.appendChild(nvPicPr);

    const blipFill = xmlDoc.createElementNS(PIC_NS, 'pic:blipFill');
    const blip = xmlDoc.createElementNS(A_NS, 'a:blip');
    blip.setAttributeNS(R_NS, 'r:embed', rId);
    blip.setAttribute('cstate', 'print');
    blipFill.appendChild(blip);
    const stretch = xmlDoc.createElementNS(A_NS, 'a:stretch');
    stretch.appendChild(xmlDoc.createElementNS(A_NS, 'a:fillRect'));
    blipFill.appendChild(stretch);
    pic.appendChild(blipFill);

    const spPr = xmlDoc.createElementNS(PIC_NS, 'pic:spPr');
    const xfrm = xmlDoc.createElementNS(A_NS, 'a:xfrm');
    const off = xmlDoc.createElementNS(A_NS, 'a:off');
    off.setAttribute('x', '0');
    off.setAttribute('y', '0');
    xfrm.appendChild(off);
    const ext = xmlDoc.createElementNS(A_NS, 'a:ext');
    ext.setAttribute('cx', String(cx));
    ext.setAttribute('cy', String(cy));
    xfrm.appendChild(ext);
    spPr.appendChild(xfrm);

    const prstGeom = xmlDoc.createElementNS(A_NS, 'a:prstGeom');
    prstGeom.setAttribute('prst', 'roundRect');
    prstGeom.appendChild(xmlDoc.createElementNS(A_NS, 'a:avLst'));
    spPr.appendChild(prstGeom);

    const ln = xmlDoc.createElementNS(A_NS, 'a:ln');
    ln.setAttribute('w', '12700');
    const solidFill = xmlDoc.createElementNS(A_NS, 'a:solidFill');
    const srgbClr = xmlDoc.createElementNS(A_NS, 'a:srgbClr');
    srgbClr.setAttribute('val', 'D0D5DD');
    solidFill.appendChild(srgbClr);
    ln.appendChild(solidFill);
    spPr.appendChild(ln);

    pic.appendChild(spPr);
    graphicData.appendChild(pic);
    graphic.appendChild(graphicData);
    inline.appendChild(graphic);
    drawing.appendChild(inline);
    r.appendChild(drawing);

    return r;
  }

  function clearParagraphRuns(p) {
    const children = Array.from(p.childNodes);
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.nodeName !== 'w:pPr') {
        p.removeChild(child);
      }
    }
  }

  async function generateDocxBlob(base64Template, formData) {
    if (!JSZip) {
      throw new Error('JSZip library is not loaded');
    }

    const zip = await JSZip.loadAsync(base64Template, { base64: true });

    const parser = new DOMParser();
    const serializer = new XMLSerializer();

    // 1. Content Types
    const ctXmlStr = await zip.file('[Content_Types].xml').async('string');
    const ctDoc = parser.parseFromString(ctXmlStr, 'application/xml');
    const typesEl = ctDoc.documentElement;
    const defaults = Array.from(typesEl.getElementsByTagName('Default'));
    
    if (!defaults.some(el => el.getAttribute('Extension') === 'jpg')) {
      const defJpg = ctDoc.createElementNS(CT_NS, 'Default');
      defJpg.setAttribute('Extension', 'jpg');
      defJpg.setAttribute('ContentType', 'image/jpeg');
      typesEl.appendChild(defJpg);
    }
    if (!defaults.some(el => el.getAttribute('Extension') === 'png')) {
      const defPng = ctDoc.createElementNS(CT_NS, 'Default');
      defPng.setAttribute('Extension', 'png');
      defPng.setAttribute('ContentType', 'image/png');
      typesEl.appendChild(defPng);
    }

    // 2. Rels
    const relsXmlStr = await zip.file('word/_rels/document.xml.rels').async('string');
    const relsDoc = parser.parseFromString(relsXmlStr, 'application/xml');
    const relationshipsEl = relsDoc.documentElement;

    const photos = formData.photos || {};
    const photoRIds = {};
    const photoKeys = ['photo1', 'photo2', 'photo3', 'photo4'];

    photoKeys.forEach((key, idx) => {
      const pData = photos[key];
      if (pData && (pData.data || typeof pData === 'string')) {
        const rid = `rIdCustomPhoto${idx + 1}`;
        const rawData = pData.data || pData;
        const isPng = typeof rawData === 'string' && rawData.includes('image/png');
        const ext = isPng ? 'png' : 'jpeg';
        const filename = `photo_custom_${idx + 1}.${ext}`;
        photoRIds[key] = rid;

        const rel = relsDoc.createElementNS(PKG_R_NS, 'Relationship');
        rel.setAttribute('Id', rid);
        rel.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');
        rel.setAttribute('Target', `media/${filename}`);
        relationshipsEl.appendChild(rel);

        if (typeof rawData === 'string' && rawData.startsWith('data:')) {
          const b64 = rawData.split(',')[1];
          zip.file(`word/media/${filename}`, b64, { base64: true });
        } else {
          zip.file(`word/media/${filename}`, rawData);
        }
      }
    });

    // 3. Document.xml
    const docXmlStr = await zip.file('word/document.xml').async('string');
    const docXml = parser.parseFromString(docXmlStr, 'application/xml');
    const ps = docXml.getElementsByTagName('w:p');

    // Title / Cover
    // P16: First name, Last name
    if (ps[16]) {
      clearParagraphRuns(ps[16]);
      ps[16].appendChild(createRun(docXml, 'ชื่อ  ', { bold: true, sz: '36' }));
      ps[16].appendChild(createRun(docXml, (formData.firstName || '') + '     ', { bold: false, sz: '36' }));
      ps[16].appendChild(createRun(docXml, 'นามสกุล  ', { bold: true, sz: '36' }));
      ps[16].appendChild(createRun(docXml, formData.lastName || '', { bold: false, sz: '36' }));
    }

    // P17: Level, Department
    if (ps[17]) {
      clearParagraphRuns(ps[17]);
      ps[17].appendChild(createRun(docXml, 'ระดับชั้น  ', { bold: true, sz: '36' }));
      ps[17].appendChild(createRun(docXml, (formData.level || '') + '         ', { bold: false, sz: '36' }));
      ps[17].appendChild(createRun(docXml, 'สาขาวิชา  ', { bold: true, sz: '36' }));
      ps[17].appendChild(createRun(docXml, formData.department || '', { bold: false, sz: '36' }));
    }

    const fullName = formData.fullName || `${formData.prefix || ''}${formData.firstName || ''}  ${formData.lastName || ''}`.trim();
    const dept = formData.department || '';

    // Helper for multi-line or text insertion
    function fillAnswer(pElement, text) {
      if (!pElement) return;
      clearParagraphRuns(pElement);
      const str = (text || '').trim();
      if (!str) {
        pElement.appendChild(createRun(docXml, '        -', { sz: '32' }));
        return;
      }
      const lines = str.split('\n').filter(l => l.trim().length > 0);
      lines.forEach((line, idx) => {
        if (idx > 0) {
          const br = docXml.createElementNS(W_NS, 'w:br');
          pElement.appendChild(br);
        }
        pElement.appendChild(createRun(docXml, '        ' + line.trim(), { sz: '32' }));
      });
    }

    // Place 1: ร้านโกโก้ตาหลวง
    fillAnswer(ps[27], formData.place1_knowledge);
    fillAnswer(ps[32], formData.place1_apply);
    fillAnswer(ps[37], formData.place1_impression);
    fillAnswer(ps[42], formData.place1_suggestion);

    if (ps[46]) {
      clearParagraphRuns(ps[46]);
      ps[46].appendChild(createRun(docXml, `(   ${fullName}   )`, { sz: '32' }));
    }
    if (ps[47]) {
      clearParagraphRuns(ps[47]);
      ps[47].appendChild(createRun(docXml, `                                                                     แผนกวิชา  ${dept}`, { sz: '32' }));
    }

    // Place 1 Photos (P53, P55)
    if (photoRIds['photo1'] && ps[53]) {
      clearParagraphRuns(ps[53]);
      ps[53].appendChild(createImageRun(docXml, photoRIds['photo1'], 201, 'Cocoa Photo 1'));
    }
    if (photoRIds['photo2'] && ps[55]) {
      clearParagraphRuns(ps[55]);
      ps[55].appendChild(createImageRun(docXml, photoRIds['photo2'], 202, 'Cocoa Photo 2'));
    }

    // Place 2: บริษัท รักษ์จันทน์110 จำกัด
    fillAnswer(ps[61], formData.place2_knowledge);
    fillAnswer(ps[66], formData.place2_apply);
    fillAnswer(ps[71], formData.place2_impression);
    fillAnswer(ps[76], formData.place2_suggestion);

    if (ps[80]) {
      clearParagraphRuns(ps[80]);
      ps[80].appendChild(createRun(docXml, `(   ${fullName}   )`, { sz: '32' }));
    }
    if (ps[81]) {
      clearParagraphRuns(ps[81]);
      ps[81].appendChild(createRun(docXml, `                                                                        แผนกวิชา  ${dept}`, { sz: '32' }));
    }

    // Place 2 Photos (P87, P89)
    if (photoRIds['photo3'] && ps[87]) {
      clearParagraphRuns(ps[87]);
      ps[87].appendChild(createImageRun(docXml, photoRIds['photo3'], 203, 'Rakchan Photo 1'));
    }
    if (photoRIds['photo4'] && ps[89]) {
      clearParagraphRuns(ps[89]);
      ps[89].appendChild(createImageRun(docXml, photoRIds['photo4'], 204, 'Rakchan Photo 2'));
    }

    // Write updated XML back to zip
    zip.file('[Content_Types].xml', serializer.serializeToString(ctDoc));
    zip.file('word/_rels/document.xml.rels', serializer.serializeToString(relsDoc));
    zip.file('word/document.xml', serializer.serializeToString(docXml));

    return await zip.generateAsync({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      compression: 'DEFLATE'
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'แบบบันทึกการศึกษาดูงาน.docx';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  return {
    generateDocxBlob: generateDocxBlob,
    downloadBlob: downloadBlob
  };
});
