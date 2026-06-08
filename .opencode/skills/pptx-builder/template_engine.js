/**
 * PPTX Template Engine — 45 Slide Type Builders
 * Based on MASTER SWORD / Customer Connect / One Motion design system
 * Uses JSZip to clone master_sword_template.pptx and produce finished decks.
 */
const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const SLIDE_CX = 12192000;
const SLIDE_CY = 6858000;
const TEMPLATE_PATH = path.join(__dirname, 'master_sword_template.pptx');

// Fonts
const FONT = {
  PRIMARY:  'Universal Sans Display 430',
  MEDIUM:   'Universal Sans Display 530',
  BOLD:     'Universal Sans Display 630',
  LIGHT:    'Universal Sans Display 330',
  TEXT:     'Universal Sans Text 430',
  TEXT_BOLD:'Universal Sans Text 630',
};

// Colors (hex, no #)
const C = {
  WHITE:      'FFFFFF',
  BLACK:      '000000',
  MID_GRAY:   '929292',
  DARK_GRAY:  '5E5E5E',
  OLIVE_GRAY: '6A6A66',
  LIGHT_GRAY: 'D5D5D5',
  LAVENDER:   'D5CDE5',
  TERRACOTTA: 'EC9668',
  GREEN:      '6BCB77',
  RED:        'E8665D',
  SAGE:       'B0B0A8',
  PALE_GREEN: 'E9F5DC',
  GOLD:       'D8AA6E',
};

// Text insets
const INS = { l: 50800, t: 25400, r: 50800, b: 25400 };

// ═══════════════════════════════════════════════════════════════════
// XML HELPERS
// ═══════════════════════════════════════════════════════════════════

function X(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}
const E = (inches) => Math.round(inches * 914400);

// ─── Gradient fill strings ───
const RADIAL_GRAD = `<a:gradFill flip="none" rotWithShape="1"><a:gsLst><a:gs pos="85000"><a:srgbClr val="B26D15"/></a:gs><a:gs pos="20000"><a:schemeClr val="bg1"><a:alpha val="45000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect r="100000" b="100000"/></a:path><a:tileRect l="-100000" t="-100000"/></a:gradFill>`;
const LINEAR_GRAD = `<a:gradFill flip="none" rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="FFFFFF"><a:alpha val="45000"/></a:srgbClr></a:gs><a:gs pos="78000"><a:srgbClr val="B26D15"/></a:gs></a:gsLst><a:lin ang="0" scaled="0"/></a:gradFill>`;

// ─── Background layers ───
function bgBlack(id) {
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Bg"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${SLIDE_CX}" cy="${SLIDE_CY}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
}
function bgImg(id, rId, alpha) {
  return `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="I"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rId}"><a:alphaModFix amt="${alpha}"/></a:blip><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${SLIDE_CX}" cy="${SLIDE_CY}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;
}
function leftGrad(id) {
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="G"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="7208521" cy="${SLIDE_CY}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:gradFill><a:gsLst><a:gs pos="32000"><a:srgbClr val="000000"><a:alpha val="67000"/></a:srgbClr></a:gs><a:gs pos="100000"><a:srgbClr val="000000"><a:alpha val="0"/></a:srgbClr></a:gs></a:gsLst><a:lin ang="7108"/></a:gradFill><a:ln w="12700"><a:miter lim="400000"/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
}
function bottomGrad(id) {
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="G"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${SLIDE_CX}" cy="${SLIDE_CY}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:gradFill><a:gsLst><a:gs pos="0"><a:srgbClr val="000000"><a:alpha val="30000"/></a:srgbClr></a:gs><a:gs pos="50000"><a:srgbClr val="000000"><a:alpha val="55000"/></a:srgbClr></a:gs><a:gs pos="100000"><a:srgbClr val="000000"><a:alpha val="75000"/></a:srgbClr></a:gs></a:gsLst><a:lin ang="5400000"/></a:gradFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
}
function accentBar(id) {
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="B"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm rot="5400000"><a:off x="9093067" y="3374761"/><a:ext cx="5416098" cy="108478"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 50000"/></a:avLst></a:prstGeom><a:gradFill flip="none" rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="D4D4D4"><a:alpha val="50000"/></a:srgbClr></a:gs><a:gs pos="68000"><a:schemeClr val="accent6"><a:alpha val="90000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="100000" t="100000"/></a:path><a:tileRect r="-100000" b="-100000"/></a:gradFill><a:ln w="12700"><a:noFill/><a:miter lim="400000"/></a:ln><a:effectLst><a:outerShdw blurRad="50800" dist="38100" dir="2700000" algn="tl" rotWithShape="0"><a:prstClr val="black"><a:alpha val="20000"/></a:prstClr></a:outerShdw></a:effectLst></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
}

// Composite dark backgrounds
function darkBgLeft(startId, rId, alpha) {
  let s = '', id = startId;
  s += bgBlack(id++); s += bgImg(id++, rId, alpha || 30000); s += leftGrad(id++); s += accentBar(id++);
  return { xml: s, nextId: id };
}
function darkBgCenter(startId, rId, alpha) {
  let s = '', id = startId;
  s += bgBlack(id++); s += bgImg(id++, rId, alpha || 30000); s += bottomGrad(id++); s += accentBar(id++);
  return { xml: s, nextId: id };
}

// White background (solid fill)
function whiteBg() {
  return `<p:bg><p:bgPr><a:solidFill><a:srgbClr val="${C.WHITE}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>`;
}
// Dark background element (for wrap)
function darkBgEl() {
  return `<p:bg><p:bgPr><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>`;
}

// ─── Text box ───
function tb(id, text, x, y, cx, cy, sz, color, algn, bold, italic, font) {
  const b = bold ? ' b="1"' : '';
  const it = italic ? ' i="1"' : '';
  const f = font || FONT.TEXT;
  const al = algn || 'l';
  const lines = X(text).split('\n');
  const paras = lines.map(l =>
    `<a:p><a:pPr algn="${al}"/><a:r><a:rPr lang="en-GB" sz="${sz}"${b}${it} dirty="0"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="${f}"/></a:rPr><a:t>${l}</a:t></a:r></a:p>`
  ).join('');
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="T"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="${INS.l}" tIns="${INS.t}" rIns="${INS.r}" bIns="${INS.b}"><a:normAutofit/></a:bodyPr><a:lstStyle/>${paras}</p:txBody></p:sp>`;
}

// ─── Gradient text box (dark backgrounds only) ───
function gradTb(id, text, x, y, cx, cy, sz, algn, radial, font) {
  const fill = radial !== false ? RADIAL_GRAD : LINEAR_GRAD;
  const al = algn || 'l';
  const f = font || FONT.PRIMARY;
  const lines = X(text).split('\n');
  const paras = lines.map(l =>
    `<a:p><a:pPr algn="${al}"/><a:r><a:rPr lang="en-GB" sz="${sz}" dirty="0">${fill}<a:latin typeface="${f}"/></a:rPr><a:t>${l}</a:t></a:r></a:p>`
  ).join('');
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="GT"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="${INS.l}" tIns="${INS.t}" rIns="${INS.r}" bIns="${INS.b}"><a:spAutoFit/></a:bodyPr><a:lstStyle/>${paras}</p:txBody></p:sp>`;
}

// ─── Horizontal divider line ───
function divLine(id, x, y, cx) {
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="L"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="12700"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="${C.LIGHT_GRAY}"><a:alpha val="40000"/></a:srgbClr></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
}

// ─── Vertical divider line ───
function vLine(id, x, y, cy) {
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="VL"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="12700" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="${C.LIGHT_GRAY}"><a:alpha val="30000"/></a:srgbClr></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
}

// ─── Solid rectangle ───
function solidRect(id, x, y, cx, cy, color, alpha) {
  const alphaXml = alpha ? `<a:alpha val="${alpha}"/>` : '';
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="R"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="${color}">${alphaXml}</a:srgbClr></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
}

// ─── Image placeholder (rect with X) ───
function imgPlaceholder(id, x, y, cx, cy, label) {
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Img"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="${C.LIGHT_GRAY}"><a:alpha val="20000"/></a:srgbClr></a:solidFill><a:ln w="12700"><a:solidFill><a:srgbClr val="${C.MID_GRAY}"/></a:solidFill><a:prstDash val="dash"/></a:ln></p:spPr><p:txBody><a:bodyPr anchor="ctr" lIns="${INS.l}" tIns="${INS.t}" rIns="${INS.r}" bIns="${INS.b}"/><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="en-GB" sz="1400"><a:solidFill><a:srgbClr val="${C.MID_GRAY}"/></a:solidFill><a:latin typeface="${FONT.PRIMARY}"/></a:rPr><a:t>${X(label || '[Image]')}</a:t></a:r></a:p></p:txBody></p:sp>`;
}

// ─── Wrap shapes into slide XML ───
function wrapDark(shapes) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld>${darkBgEl()}<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${shapes}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
}
function wrapLight(shapes) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld>${whiteBg()}<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${shapes}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;
}

// Speaker notes XML
function notesXml(text) {
  const p = X(text).split('\n').map(l =>
    `<a:p><a:r><a:rPr lang="en-GB" dirty="0"/><a:t>${l}</a:t></a:r></a:p>`
  ).join('');
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:sp><p:nvSpPr><p:cNvPr id="2" name="SI"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg"/></p:nvPr></p:nvSpPr><p:spPr/></p:sp><p:sp><p:nvSpPr><p:cNvPr id="3" name="N"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>${p}</p:txBody></p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>`;
}


// ═══════════════════════════════════════════════════════════════════
// CATEGORY 1: COVERS & DIVIDERS (6 types)
// ═══════════════════════════════════════════════════════════════════

// 1. Title Cover (Dark) — full-bleed dark image, gradient title centered, presenter info, accent bar
function cover_dark(cfg) {
  const { title = 'Presentation Title', presenter = '', jobTitle = '' } = cfg || {};
  const bg = darkBgCenter(2, 'rId2', 30000);
  let s = bg.xml, id = bg.nextId;
  s += gradTb(id++, title, E(1), E(1.5), E(11), E(2.5), 6000, 'ctr', true);
  s += divLine(id++, E(4), E(4.2), E(5));
  if (presenter) s += tb(id++, presenter, E(1), E(4.6), E(11), E(0.6), 2400, C.WHITE, 'ctr', false, false, FONT.PRIMARY);
  if (jobTitle) s += tb(id++, jobTitle, E(1), E(5.2), E(11), E(0.5), 1800, C.MID_GRAY, 'ctr', false, false, FONT.PRIMARY);
  return { xml: wrapDark(s), notes: cfg.notes || `Title slide: ${title}` };
}

// 2. Title Cover (Light) — white bg, large black title upper-left, presenter bottom-left
function cover_light(cfg) {
  const { title = 'Presentation Title', presenter = '', jobTitle = '' } = cfg || {};
  let s = '', id = 2;
  s += tb(id++, title, E(0.8), E(0.8), E(10), E(3.0), 6000, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.8), E(5.5), E(4));
  if (presenter) s += tb(id++, presenter, E(0.8), E(5.8), E(6), E(0.5), 2000, C.DARK_GRAY, 'l', false, false, FONT.PRIMARY);
  if (jobTitle) s += tb(id++, jobTitle, E(0.8), E(6.3), E(6), E(0.5), 1600, C.MID_GRAY, 'l', false, false, FONT.PRIMARY);
  return { xml: wrapLight(s), notes: cfg.notes || `Title slide: ${title}` };
}

// 3. Section Divider (Light) — MASTER SWORD signature: title bottom-left, giant number right
function section_divider_light(cfg) {
  const { title = 'Section Title', number = '01', subtitle = '' } = cfg || {};
  let s = '', id = 2;
  // Giant number at right
  s += tb(id++, number, E(7.5), E(0.5), E(5), E(6.0), 28800, C.LAVENDER, 'r', true, false, FONT.TEXT_BOLD);
  // Title at bottom-left
  s += tb(id++, title, E(0.8), E(4.5), E(6.5), E(1.5), 4200, C.BLACK, 'l', false, false, FONT.TEXT);
  if (subtitle) s += tb(id++, subtitle, E(0.8), E(6.0), E(6.5), E(0.5), 2000, C.MID_GRAY, 'l', false, false, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || `Section: ${title}` };
}

// 4. Section Divider (Dark) — dark image bg, gradient title centered, subtitle
function section_divider_dark(cfg) {
  const { title = 'Section Title', subtitle = '' } = cfg || {};
  const bg = darkBgCenter(2, 'rId2', 30000);
  let s = bg.xml, id = bg.nextId;
  s += gradTb(id++, title, E(1), E(2.0), E(11), E(2.5), 6600, 'ctr', true);
  if (subtitle) s += tb(id++, subtitle, E(1), E(4.8), E(11), E(0.6), 2400, C.GOLD, 'ctr', false, true, FONT.PRIMARY);
  return { xml: wrapDark(s), notes: cfg.notes || `Section: ${title}` };
}

// 5. Panel Discussion — title + speaker cards
function panel_discussion(cfg) {
  const { title = 'Panel Discussion', subtitle = '', speakers = [] } = cfg || {};
  let s = '', id = 2;
  s += tb(id++, title, E(0.8), E(0.5), E(11), E(1.5), 6000, C.BLACK, 'l', false, false, FONT.PRIMARY);
  if (subtitle) s += tb(id++, subtitle, E(0.8), E(2.0), E(11), E(0.5), 2400, C.TERRACOTTA, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.8), E(2.8), E(11));
  const sp = speakers.length > 0 ? speakers : [{ name: 'Speaker 1', role: 'Role' }, { name: 'Speaker 2', role: 'Role' }, { name: 'Speaker 3', role: 'Role' }];
  const cardW = E(10) / sp.length;
  sp.forEach((spk, i) => {
    const cx = E(0.8) + i * cardW + E(0.2);
    s += solidRect(id++, cx, E(3.5), cardW - E(0.4), E(2.8), C.LIGHT_GRAY, '15000');
    s += tb(id++, spk.name || 'Speaker', cx + E(0.2), E(4.2), cardW - E(0.8), E(0.6), 2200, C.BLACK, 'ctr', true, false, FONT.MEDIUM);
    s += tb(id++, spk.role || 'Role', cx + E(0.2), E(4.8), cardW - E(0.8), E(0.5), 1600, C.DARK_GRAY, 'ctr', false, false, FONT.PRIMARY);
  });
  return { xml: wrapLight(s), notes: cfg.notes || `Panel discussion: ${title}` };
}

// 6. Q&A Slide — large gradient "Q&A" centered
function qa_slide(cfg) {
  const { title = 'Q&A', subtitle = '' } = cfg || {};
  const bg = darkBgCenter(2, 'rId2', 30000);
  let s = bg.xml, id = bg.nextId;
  s += gradTb(id++, title, E(1), E(1.5), E(11), E(3.0), 12000, 'ctr', true);
  s += divLine(id++, E(4), E(4.5), E(5));
  if (subtitle) s += tb(id++, subtitle, E(1), E(4.8), E(11), E(0.6), 2200, C.GOLD, 'ctr', false, false, FONT.PRIMARY);
  return { xml: wrapDark(s), notes: cfg.notes || 'Q&A session' };
}


// ═══════════════════════════════════════════════════════════════════
// CATEGORY 2: CONTENT SLIDES (12 types)
// ═══════════════════════════════════════════════════════════════════

// 7. Statement (Dark) — full-bleed image, one large statement overlaid
function statement_dark(cfg) {
  const { statement = 'Statement text goes here' } = cfg || {};
  const bg = darkBgCenter(2, 'rId2', 30000);
  let s = bg.xml, id = bg.nextId;
  s += gradTb(id++, statement, E(1), E(2.0), E(11), E(3.0), 4900, 'l', true);
  return { xml: wrapDark(s), notes: cfg.notes || statement };
}

// 8. Statement (Light) — white bg, large accent statement, supporting text
function statement_light(cfg) {
  const { statement = 'Statement text goes here', body = '' } = cfg || {};
  let s = '', id = 2;
  s += tb(id++, statement, E(0.8), E(1.5), E(10.5), E(2.5), 4800, C.TERRACOTTA, 'l', false, false, FONT.PRIMARY);
  if (body) s += tb(id++, body, E(0.8), E(4.5), E(10.5), E(1.5), 2200, C.MID_GRAY, 'l', false, false, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || statement };
}

// 9. Content Left + Image Right
function content_left_image_right(cfg) {
  const { title = 'Title', body = 'Body text', imageLabel = '[Image]' } = cfg || {};
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(5.5), E(1.0), 4500, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += tb(id++, body, E(0.5), E(1.6), E(5.5), E(4.5), 2400, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  s += imgPlaceholder(id++, E(6.5), E(0.4), E(6), E(6.0), imageLabel);
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 10. Content Right + Image Left
function content_right_image_left(cfg) {
  const { title = 'Title', body = 'Body text', imageLabel = '[Image]' } = cfg || {};
  let s = '', id = 2;
  s += imgPlaceholder(id++, E(0.3), E(0.4), E(6), E(6.0), imageLabel);
  s += tb(id++, title, E(6.8), E(0.4), E(5.5), E(1.0), 4500, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += tb(id++, body, E(6.8), E(1.6), E(5.5), E(4.5), 2400, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 11. Full-width Content (Light)
function content_full_width(cfg) {
  const { title = 'Title', miniTitle = '', body = 'Body text', caption = '' } = cfg || {};
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(12), E(1.0), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  if (miniTitle) s += tb(id++, miniTitle, E(0.5), E(1.4), E(12), E(0.7), 4400, C.TERRACOTTA, 'l', false, false, FONT.PRIMARY);
  const bodyY = miniTitle ? E(2.3) : E(1.6);
  s += tb(id++, body, E(0.5), bodyY, E(12), E(3.5), 2400, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  if (caption) {
    s += divLine(id++, E(0.5), E(6.2), E(12));
    s += tb(id++, caption, E(0.5), E(6.3), E(12), E(0.4), 1600, C.MID_GRAY, 'l', false, true, FONT.TEXT);
  }
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 12. Two-Column Content
function two_column(cfg) {
  const { title = 'Title', leftHeading = 'Left', leftBody = '', rightHeading = 'Right', rightBody = '' } = cfg || {};
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(12), E(0.8), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.5), E(1.3), E(12));
  // Left column
  s += tb(id++, leftHeading, E(0.5), E(1.6), E(5.5), E(0.6), 2800, C.DARK_GRAY, 'l', true, false, FONT.MEDIUM);
  s += tb(id++, leftBody, E(0.5), E(2.3), E(5.5), E(4.0), 2200, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  // Optional vertical divider
  s += vLine(id++, E(6.3), E(1.6), E(4.5));
  // Right column
  s += tb(id++, rightHeading, E(6.8), E(1.6), E(5.5), E(0.6), 2800, C.DARK_GRAY, 'l', true, false, FONT.MEDIUM);
  s += tb(id++, rightBody, E(6.8), E(2.3), E(5.5), E(4.0), 2200, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 13. Three-Column Content
function three_column(cfg) {
  const { title = 'Title', columns = [] } = cfg || {};
  const cols = columns.length > 0 ? columns : [
    { heading: 'Column 1', body: 'Details here' },
    { heading: 'Column 2', body: 'Details here' },
    { heading: 'Column 3', body: 'Details here' },
  ];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(12), E(0.8), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.5), E(1.3), E(12));
  const colW = E(3.7);
  cols.forEach((col, i) => {
    const cx = E(0.5) + i * (colW + E(0.3));
    s += tb(id++, col.heading || `Column ${i+1}`, cx, E(1.6), colW, E(0.6), 2800, C.DARK_GRAY, 'l', true, false, FONT.MEDIUM);
    s += tb(id++, col.body || '', cx, E(2.3), colW, E(4.0), 2000, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
    if (i < cols.length - 1) s += vLine(id++, cx + colW + E(0.1), E(1.6), E(4.5));
  });
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 14. Bullet Points with Numbers
function bullet_numbers(cfg) {
  const { title = 'Key Points', miniTitle = '', items = [] } = cfg || {};
  const pts = items.length > 0 ? items : [
    { number: '01', text: 'First key point' },
    { number: '02', text: 'Second key point' },
    { number: '03', text: 'Third key point' },
  ];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(12), E(0.8), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  if (miniTitle) s += tb(id++, miniTitle, E(0.5), E(1.2), E(12), E(0.6), 4400, C.TERRACOTTA, 'l', false, false, FONT.PRIMARY);
  const startY = miniTitle ? E(2.0) : E(1.5);
  const rowH = Math.min(E(1.4), (E(5.5)) / pts.length);
  pts.forEach((pt, i) => {
    const y = startY + i * rowH;
    s += tb(id++, pt.number || String(i + 1).padStart(2, '0'), E(0.5), y, E(1.8), rowH, 12000, C.LAVENDER, 'l', true, false, FONT.PRIMARY);
    s += tb(id++, pt.text || '', E(2.5), y + E(0.2), E(9.5), rowH - E(0.2), 2200, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  });
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 15. Content with Caption Bar
function content_caption(cfg) {
  const { title = 'Title', body = 'Main content', caption = 'Caption text here' } = cfg || {};
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(12), E(0.8), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += tb(id++, body, E(0.5), E(1.5), E(12), E(4.0), 2400, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  // Caption bar at bottom
  s += solidRect(id++, 0, E(6.0), SLIDE_CX, E(1.5), C.LIGHT_GRAY, '20000');
  s += tb(id++, caption, E(0.5), E(6.2), E(12), E(1.0), 2300, C.DARK_GRAY, 'l', false, false, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 16. Process Steps (Numbered)
function process_steps(cfg) {
  const { title = 'Process', steps = [], body = '' } = cfg || {};
  const st = steps.length > 0 ? steps : [
    { number: '1', text: 'First step description' },
    { number: '2', text: 'Second step description' },
    { number: '3', text: 'Third step description' },
  ];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(12), E(0.8), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.5), E(1.3), E(12));
  const colW = E(11) / st.length;
  st.forEach((step, i) => {
    const cx = E(0.8) + i * colW;
    s += tb(id++, step.number || String(i + 1), cx, E(1.6), colW - E(0.5), E(1.2), 7100, C.LAVENDER, 'l', true, false, FONT.PRIMARY);
    s += tb(id++, step.text || '', cx, E(2.8), colW - E(0.5), E(2.5), 2000, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  });
  if (body) s += tb(id++, body, E(0.5), E(5.5), E(12), E(1.0), 1800, C.MID_GRAY, 'l', false, false, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 17. Quad Block (A/B/C/D)
function quad_block(cfg) {
  const { title = 'Title', miniTitle = '', blocks = [], summary = '' } = cfg || {};
  const b = blocks.length === 4 ? blocks : [
    { label: 'A', text: 'Block A content' },
    { label: 'B', text: 'Block B content' },
    { label: 'C', text: 'Block C content' },
    { label: 'D', text: 'Block D content' },
  ];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.3), E(8), E(0.6), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  if (miniTitle) s += tb(id++, miniTitle, E(0.5), E(0.9), E(8), E(0.5), 3600, C.TERRACOTTA, 'l', false, false, FONT.PRIMARY);
  const startY = E(1.5);
  const qW = E(5.5), qH = E(2.0);
  b.forEach((bl, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const bx = E(0.5) + col * (qW + E(0.5));
    const by = startY + row * (qH + E(0.3));
    s += solidRect(id++, bx, by, qW, qH, C.LIGHT_GRAY, '12000');
    s += tb(id++, bl.label || String.fromCharCode(65 + i), bx + E(0.2), by + E(0.1), E(0.8), E(0.6), 3200, C.TERRACOTTA, 'l', true, false, FONT.MEDIUM);
    s += tb(id++, bl.text || '', bx + E(1.0), by + E(0.2), qW - E(1.3), qH - E(0.4), 1800, C.DARK_GRAY, 'l', false, false, FONT.TEXT);
  });
  if (summary) s += tb(id++, summary, E(0.5), E(6.1), E(12), E(0.5), 1600, C.MID_GRAY, 'l', false, true, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 18. Content with Accent Sidebar
function content_sidebar(cfg) {
  const { title = 'Title', body = 'Main content', sidebarItems = [] } = cfg || {};
  const items = sidebarItems.length > 0 ? sidebarItems : ['Key stat 1', 'Key stat 2', 'Key stat 3'];
  let s = '', id = 2;
  // Main content area (left 70%)
  s += tb(id++, title, E(0.5), E(0.4), E(8.0), E(0.8), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += tb(id++, body, E(0.5), E(1.5), E(8.0), E(5.0), 2200, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  // Sidebar (right 30%)
  s += solidRect(id++, E(9.0), 0, E(4.33), SLIDE_CY, C.LAVENDER, '20000');
  items.forEach((item, i) => {
    s += tb(id++, item, E(9.3), E(1.0) + i * E(1.2), E(3.5), E(1.0), 2200, C.DARK_GRAY, 'l', true, false, FONT.MEDIUM);
  });
  return { xml: wrapLight(s), notes: cfg.notes || title };
}


// ═══════════════════════════════════════════════════════════════════
// CATEGORY 3: DATA & STATS (8 types)
// ═══════════════════════════════════════════════════════════════════

// 19. Big Stat (Single) — one enormous number
function big_stat_single(cfg) {
  const { value = '100%', label = 'Data Title', context = '' } = cfg || {};
  let s = '', id = 2;
  s += tb(id++, label, E(0.5), E(0.5), E(12), E(0.6), 3100, C.TERRACOTTA, 'l', false, false, FONT.PRIMARY);
  s += tb(id++, value, E(0.5), E(1.2), E(12), E(4.0), 9500, C.PALE_GREEN, 'ctr', true, false, FONT.PRIMARY);
  if (context) s += tb(id++, context, E(0.5), E(5.5), E(12), E(1.0), 2200, C.OLIVE_GRAY, 'ctr', false, false, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || `${label}: ${value}` };
}

// 20. Big Stat (Multiple) — 3-4 large numbers across
function big_stat_multiple(cfg) {
  const { title = 'Key Metrics', caption = '', stats = [] } = cfg || {};
  const st = stats.length > 0 ? stats : [
    { value: '95%', label: 'Metric A' },
    { value: '2.5K', label: 'Metric B' },
    { value: '47', label: 'Metric C' },
  ];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(12), E(0.8), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  if (caption) s += tb(id++, caption, E(0.5), E(1.2), E(12), E(0.5), 1800, C.MID_GRAY, 'l', false, false, FONT.TEXT);
  s += divLine(id++, E(0.5), E(1.8), E(12));
  const colW = E(11) / st.length;
  st.forEach((stat, i) => {
    const cx = E(0.8) + i * colW;
    s += tb(id++, stat.value || '0', cx, E(2.2), colW - E(0.5), E(2.5), 7200, C.PALE_GREEN, 'ctr', true, false, FONT.PRIMARY);
    s += tb(id++, stat.label || '', cx, E(4.8), colW - E(0.5), E(0.6), 2000, C.DARK_GRAY, 'ctr', false, false, FONT.MEDIUM);
  });
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 21. Big Stat (Comparison) — two large numbers side by side
function big_stat_comparison(cfg) {
  const { leftValue = '835', leftLabel = 'Left metric', leftUnit = '', rightValue = '2118', rightLabel = 'Right metric', rightUnit = '', context = '' } = cfg || {};
  let s = '', id = 2;
  // Left stat
  s += tb(id++, leftValue, E(0.5), E(1.0), E(5.5), E(3.0), 9000, C.PALE_GREEN, 'ctr', true, false, FONT.PRIMARY);
  if (leftUnit) s += tb(id++, leftUnit, E(0.5), E(3.8), E(5.5), E(0.5), 2400, C.MID_GRAY, 'ctr', false, false, FONT.LIGHT);
  s += tb(id++, leftLabel, E(0.5), E(4.3), E(5.5), E(0.6), 2200, C.DARK_GRAY, 'ctr', false, false, FONT.MEDIUM);
  // Divider
  s += vLine(id++, E(6.3), E(1.0), E(4.0));
  // Right stat
  s += tb(id++, rightValue, E(6.5), E(1.0), E(5.5), E(3.0), 9000, C.PALE_GREEN, 'ctr', true, false, FONT.PRIMARY);
  if (rightUnit) s += tb(id++, rightUnit, E(6.5), E(3.8), E(5.5), E(0.5), 2400, C.MID_GRAY, 'ctr', false, false, FONT.LIGHT);
  s += tb(id++, rightLabel, E(6.5), E(4.3), E(5.5), E(0.6), 2200, C.DARK_GRAY, 'ctr', false, false, FONT.MEDIUM);
  if (context) s += tb(id++, context, E(0.5), E(5.5), E(12), E(1.0), 1800, C.MID_GRAY, 'ctr', false, true, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || `${leftValue} vs ${rightValue}` };
}

// 22. Bar Chart Placeholder
function bar_chart(cfg) {
  const { title = 'Chart Title', description = '', bars = [], yearLabels = [] } = cfg || {};
  const b = bars.length > 0 ? bars : [
    { value: 80, label: '2021' },
    { value: 120, label: '2022' },
    { value: 95, label: '2023' },
    { value: 150, label: '2024' },
  ];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(12), E(0.8), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  if (description) s += tb(id++, description, E(0.5), E(1.2), E(12), E(0.5), 1800, C.MID_GRAY, 'l', false, false, FONT.TEXT);
  // Draw bars
  const maxVal = Math.max(...b.map(x => x.value || 1));
  const barAreaW = E(10);
  const barW = barAreaW / b.length;
  const maxBarH = E(3.5);
  const baseY = E(5.8);
  s += divLine(id++, E(1), baseY, barAreaW);
  b.forEach((bar, i) => {
    const bx = E(1.5) + i * barW;
    const bh = Math.round((bar.value / maxVal) * maxBarH);
    const by = baseY - bh;
    s += solidRect(id++, bx, by, barW - E(0.3), bh, C.LAVENDER);
    s += tb(id++, String(bar.value), bx, by - E(0.4), barW - E(0.3), E(0.4), 1600, C.DARK_GRAY, 'ctr', true, false, FONT.MEDIUM);
    s += tb(id++, bar.label || '', bx, baseY + E(0.1), barW - E(0.3), E(0.4), 1400, C.MID_GRAY, 'ctr', false, false, FONT.TEXT);
  });
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 23. Spec Sheet / Data Grid
function spec_sheet(cfg) {
  const { title = 'Specifications', specs = [] } = cfg || {};
  const sp = specs.length > 0 ? specs : [
    { value: '1,020', unit: 'hp', label: 'Peak Power' },
    { value: '0-60', unit: 'mph', label: '1.99 seconds' },
    { value: '200', unit: 'mph', label: 'Top Speed' },
    { value: '396', unit: 'mi', label: 'Range (EPA est.)' },
  ];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.3), E(12), E(0.8), 4800, C.BLACK, 'l', true, false, FONT.PRIMARY);
  s += divLine(id++, E(0.5), E(1.2), E(12));
  const rowH = Math.min(E(1.3), E(5.0) / sp.length);
  sp.forEach((spec, i) => {
    const y = E(1.5) + i * rowH;
    s += tb(id++, spec.value || '', E(0.5), y, E(3.0), rowH * 0.6, 3600, C.BLACK, 'r', true, false, FONT.MEDIUM);
    s += tb(id++, spec.unit || '', E(3.6), y + E(0.15), E(1.5), rowH * 0.5, 2000, C.MID_GRAY, 'l', false, false, FONT.LIGHT);
    s += tb(id++, spec.label || '', E(5.5), y + E(0.05), E(7), rowH * 0.6, 2000, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
    if (i < sp.length - 1) s += divLine(id++, E(0.5), y + rowH - E(0.05), E(12));
  });
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 24. Timeline / Calendar
function timeline(cfg) {
  const { title = 'Timeline', phases = [] } = cfg || {};
  const ph = phases.length > 0 ? phases : [
    { label: 'Phase 1', period: 'Jan-Mar', items: 'Planning\nResearch' },
    { label: 'Phase 2', period: 'Apr-Jun', items: 'Development\nTesting' },
    { label: 'Phase 3', period: 'Jul-Sep', items: 'Launch\nReview' },
    { label: 'Phase 4', period: 'Oct-Dec', items: 'Scale\nOptimize' },
  ];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(12), E(0.8), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.5), E(1.3), E(12));
  const phaseColors = [C.LAVENDER, C.TERRACOTTA, C.GREEN, C.LIGHT_GRAY];
  const colW = E(11) / ph.length;
  ph.forEach((p, i) => {
    const cx = E(0.8) + i * colW;
    const clr = phaseColors[i % phaseColors.length];
    s += solidRect(id++, cx, E(1.6), colW - E(0.3), E(0.5), clr, '40000');
    s += tb(id++, p.label || '', cx + E(0.1), E(1.65), colW - E(0.5), E(0.4), 2000, C.BLACK, 'l', true, false, FONT.MEDIUM);
    s += tb(id++, p.period || '', cx + E(0.1), E(2.3), colW - E(0.5), E(0.4), 1600, C.MID_GRAY, 'l', false, false, FONT.TEXT);
    s += tb(id++, p.items || '', cx + E(0.1), E(2.9), colW - E(0.5), E(3.5), 1800, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  });
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 25. Comparison Table
function comparison_table(cfg) {
  const { title = 'Comparison', leftHeader = 'Option A', rightHeader = 'Option B', rows = [] } = cfg || {};
  const r = rows.length > 0 ? rows : [
    { label: 'Feature 1', left: 'Value A1', right: 'Value B1' },
    { label: 'Feature 2', left: 'Value A2', right: 'Value B2' },
    { label: 'Feature 3', left: 'Value A3', right: 'Value B3' },
  ];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(12), E(0.8), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.5), E(1.3), E(12));
  // Headers
  s += tb(id++, 'Feature', E(0.5), E(1.5), E(3.5), E(0.6), 2200, C.MID_GRAY, 'l', true, false, FONT.MEDIUM);
  s += tb(id++, leftHeader, E(4.2), E(1.5), E(3.8), E(0.6), 2200, C.TERRACOTTA, 'ctr', true, false, FONT.MEDIUM);
  s += tb(id++, rightHeader, E(8.2), E(1.5), E(3.8), E(0.6), 2200, C.TERRACOTTA, 'ctr', true, false, FONT.MEDIUM);
  s += divLine(id++, E(0.5), E(2.2), E(12));
  const rowH = Math.min(E(0.8), E(4.0) / r.length);
  r.forEach((row, i) => {
    const y = E(2.4) + i * rowH;
    s += tb(id++, row.label || '', E(0.5), y, E(3.5), rowH * 0.8, 1800, C.DARK_GRAY, 'l', false, false, FONT.TEXT);
    s += tb(id++, row.left || '', E(4.2), y, E(3.8), rowH * 0.8, 1800, C.BLACK, 'ctr', true, false, FONT.MEDIUM);
    s += tb(id++, row.right || '', E(8.2), y, E(3.8), rowH * 0.8, 1800, C.BLACK, 'ctr', true, false, FONT.MEDIUM);
    if (i < r.length - 1) s += divLine(id++, E(0.5), y + rowH - E(0.05), E(12));
  });
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 26. Map Layout
function map_layout(cfg) {
  const { title = 'Locations', regions = [], mapLabel = '[Map Image]' } = cfg || {};
  const rg = regions.length > 0 ? regions : [
    { name: 'North America', locations: 'Fremont, CA\nAustin, TX\nNew York, NY' },
    { name: 'Europe', locations: 'Berlin, DE\nTilburg, NL' },
  ];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(12), E(0.8), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.5), E(1.3), E(5.5));
  // Region list (left)
  let y = E(1.6);
  rg.forEach(r => {
    s += tb(id++, r.name || '', E(0.5), y, E(5.5), E(0.5), 2400, C.DARK_GRAY, 'l', true, false, FONT.MEDIUM);
    y += E(0.5);
    s += tb(id++, r.locations || '', E(0.8), y, E(5.0), E(1.5), 1800, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
    y += E(1.8);
  });
  // Map image placeholder (right)
  s += imgPlaceholder(id++, E(6.5), E(1.3), E(6), E(5.0), mapLabel);
  return { xml: wrapLight(s), notes: cfg.notes || title };
}


// ═══════════════════════════════════════════════════════════════════
// CATEGORY 4: VISUAL & MEDIA (6 types)
// ═══════════════════════════════════════════════════════════════════

// 27. Full-Bleed Image
function full_bleed_image(cfg) {
  const { caption = '', imageLabel = '[Full-Bleed Image]' } = cfg || {};
  let s = '', id = 2;
  s += imgPlaceholder(id++, 0, 0, SLIDE_CX, SLIDE_CY, imageLabel);
  if (caption) s += tb(id++, caption, E(0.3), E(6.5), E(4), E(0.4), 1200, C.WHITE, 'l', false, true, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || caption || 'Full-bleed image slide' };
}

// 28. Image with Statement
function image_statement(cfg) {
  const { statement = 'Statement overlaid on image', imageLabel = '[Background Image]' } = cfg || {};
  const bg = darkBgCenter(2, 'rId2', 30000);
  let s = bg.xml, id = bg.nextId;
  s += tb(id++, statement, E(0.8), E(4.0), E(10), E(2.0), 4800, C.WHITE, 'l', false, false, FONT.PRIMARY);
  return { xml: wrapDark(s), notes: cfg.notes || statement };
}

// 29. Multi-Image Grid (2x2)
function image_grid_2x2(cfg) {
  const { images = [], captions = [] } = cfg || {};
  const imgs = images.length === 4 ? images : ['Image 1', 'Image 2', 'Image 3', 'Image 4'];
  const caps = captions.length === 4 ? captions : ['', '', '', ''];
  let s = '', id = 2;
  const gW = E(5.8), gH = E(3.0);
  const positions = [
    { x: E(0.3), y: E(0.3) },
    { x: E(6.5), y: E(0.3) },
    { x: E(0.3), y: E(3.5) },
    { x: E(6.5), y: E(3.5) },
  ];
  positions.forEach((pos, i) => {
    s += imgPlaceholder(id++, pos.x, pos.y, gW, gH, imgs[i]);
    if (caps[i]) s += tb(id++, caps[i], pos.x, pos.y + gH + E(0.05), gW, E(0.3), 1200, C.MID_GRAY, 'ctr', false, false, FONT.TEXT);
  });
  return { xml: wrapLight(s), notes: cfg.notes || 'Image grid 2x2' };
}

// 30. Multi-Image Grid (3-across)
function image_grid_3(cfg) {
  const { images = [], captions = [] } = cfg || {};
  const imgs = images.length === 3 ? images : ['Image 1', 'Image 2', 'Image 3'];
  const caps = captions.length === 3 ? captions : ['', '', ''];
  let s = '', id = 2;
  const gW = E(3.8), gH = E(5.0);
  imgs.forEach((img, i) => {
    const cx = E(0.3) + i * (gW + E(0.3));
    s += imgPlaceholder(id++, cx, E(0.5), gW, gH, img);
    if (caps[i]) s += tb(id++, caps[i], cx, E(5.6), gW, E(0.5), 1400, C.MID_GRAY, 'ctr', false, false, FONT.TEXT);
  });
  return { xml: wrapLight(s), notes: cfg.notes || 'Image grid 3-across' };
}

// 31. Image + Text Block
function image_text_block(cfg) {
  const { title = 'Title', description = 'Description text', imageLabel = '[Image]' } = cfg || {};
  let s = '', id = 2;
  s += imgPlaceholder(id++, E(0.3), E(0.3), E(7.5), E(6.9), imageLabel);
  s += tb(id++, title, E(8.2), E(1.0), E(4.5), E(1.5), 3600, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += tb(id++, description, E(8.2), E(2.8), E(4.5), E(3.5), 2000, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 32. Video Placeholder
function video_placeholder(cfg) {
  const { title = 'Videos', videos = [] } = cfg || {};
  const v = videos.length > 0 ? videos : ['Video 1 — Title', 'Video 2 — Title', 'Video 3 — Title'];
  const bg = darkBgCenter(2, 'rId2', 30000);
  let s = bg.xml, id = bg.nextId;
  s += tb(id++, title, E(0.8), E(0.5), E(6), E(1.0), 4200, C.WHITE, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.8), E(1.5), E(6));
  v.forEach((vid, i) => {
    s += tb(id++, vid, E(1.0), E(2.0) + i * E(0.8), E(8), E(0.6), 1600, C.LAVENDER, 'l', false, false, FONT.TEXT);
  });
  return { xml: wrapDark(s), notes: cfg.notes || title };
}


// ═══════════════════════════════════════════════════════════════════
// CATEGORY 5: INTERACTIVE / VARK (8 types)
// ═══════════════════════════════════════════════════════════════════

// 33. Discussion Question (Dark) — large question on dark bg with gradient text
function discussion_dark(cfg) {
  const { question = 'What do you think about this topic?' } = cfg || {};
  const bg = darkBgCenter(2, 'rId2', 30000);
  let s = bg.xml, id = bg.nextId;
  s += gradTb(id++, question, E(1), E(1.5), E(11), E(4.0), 6600, 'ctr', true);
  return { xml: wrapDark(s), notes: cfg.notes || question };
}

// 34. Discussion Question (Light) — large question on white bg
function discussion_light(cfg) {
  const { question = 'What do you think about this topic?', prompt = '' } = cfg || {};
  let s = '', id = 2;
  s += tb(id++, question, E(0.8), E(1.5), E(11), E(3.0), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  if (prompt) s += tb(id++, prompt, E(0.8), E(4.8), E(11), E(1.5), 2200, C.MID_GRAY, 'l', false, false, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || question };
}

// 35. Quiz — Multiple Choice
function quiz_mc(cfg) {
  const { question = 'Question text?', answers = [], correctIndex = 0, explanation = '' } = cfg || {};
  const ans = answers.length > 0 ? answers : ['Option A', 'Option B', 'Option C', 'Option D'];
  let s = '', id = 2;
  s += tb(id++, question, E(0.5), E(0.4), E(12), E(1.5), 3200, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.5), E(1.9), E(12));
  ans.forEach((a, i) => {
    const isCorrect = i === correctIndex;
    const color = isCorrect ? C.GREEN : C.OLIVE_GRAY;
    const letter = String.fromCharCode(65 + i);
    s += tb(id++, `${letter})  ${a}${isCorrect ? '  \u2713' : ''}`, E(0.8), E(2.2) + i * E(0.9), E(11), E(0.7), 2200, color, 'l', isCorrect, false, FONT.TEXT);
  });
  if (explanation) {
    const ey = E(2.2) + ans.length * E(0.9) + E(0.3);
    s += tb(id++, explanation, E(0.8), ey, E(11), E(1.0), 1600, C.TERRACOTTA, 'l', false, true, FONT.TEXT);
  }
  return { xml: wrapLight(s), notes: cfg.notes || `Quiz: ${question}` };
}

// 36. Quiz — True/False
function quiz_tf(cfg) {
  const { question = 'True or False: Statement here', correct = true, explanation = '' } = cfg || {};
  let s = '', id = 2;
  s += tb(id++, question, E(0.5), E(0.4), E(12), E(2.0), 3200, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.5), E(2.5), E(12));
  // True
  s += tb(id++, `A)  True${correct ? '  \u2713' : ''}`, E(0.8), E(3.0), E(11), E(0.7), 2800, correct ? C.GREEN : C.OLIVE_GRAY, 'l', correct, false, FONT.TEXT);
  // False
  s += tb(id++, `B)  False${!correct ? '  \u2713' : ''}`, E(0.8), E(3.9), E(11), E(0.7), 2800, !correct ? C.GREEN : C.OLIVE_GRAY, 'l', !correct, false, FONT.TEXT);
  if (explanation) {
    s += tb(id++, explanation, E(0.8), E(5.0), E(11), E(1.0), 1600, C.TERRACOTTA, 'l', false, true, FONT.TEXT);
  }
  return { xml: wrapLight(s), notes: cfg.notes || `Quiz T/F: ${question}` };
}

// 37. Activity / Exercise Prompt
function activity_prompt(cfg) {
  const { instruction = 'Complete the following activity', duration = '5 minutes', hint = '' } = cfg || {};
  const bg = darkBgCenter(2, 'rId2', 30000);
  let s = bg.xml, id = bg.nextId;
  s += gradTb(id++, instruction, E(1), E(1.0), E(11), E(3.0), 4400, 'ctr', true);
  s += divLine(id++, E(4), E(4.2), E(5));
  s += tb(id++, duration, E(1), E(4.5), E(11), E(0.6), 2400, C.GOLD, 'ctr', true, false, FONT.PRIMARY);
  if (hint) s += tb(id++, hint, E(1.5), E(5.3), E(10), E(1.0), 1600, C.LIGHT_GRAY, 'ctr', false, true, FONT.TEXT);
  return { xml: wrapDark(s), notes: cfg.notes || instruction };
}

// 38. Scenario Card
function scenario_card(cfg) {
  const { number = 1, title = 'Scenario', situation = 'Situation description', questions = [] } = cfg || {};
  const qs = questions.length > 0 ? questions : ['What would you do?', 'What are the key considerations?'];
  let s = '', id = 2;
  s += tb(id++, `Scenario ${number}`, E(0.5), E(0.3), E(4), E(0.7), 4400, C.TERRACOTTA, 'l', true, false, FONT.PRIMARY);
  s += tb(id++, title, E(4.5), E(0.4), E(8), E(0.6), 2800, C.DARK_GRAY, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.5), E(1.1), E(12));
  // Situation
  s += tb(id++, 'Situation', E(0.5), E(1.4), E(2), E(0.4), 2000, C.TERRACOTTA, 'l', true, false, FONT.MEDIUM);
  s += tb(id++, situation, E(0.5), E(1.9), E(12), E(2.0), 2200, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  // Discussion questions
  s += tb(id++, 'Discussion Questions', E(6.5), E(4.2), E(6), E(0.4), 2000, C.TERRACOTTA, 'l', true, false, FONT.MEDIUM);
  qs.forEach((q, i) => {
    s += tb(id++, `${i + 1}.  ${q}`, E(6.5), E(4.7) + i * E(0.6), E(6), E(0.5), 1800, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  });
  return { xml: wrapLight(s), notes: cfg.notes || `Scenario ${number}: ${title}` };
}

// 39. Key Takeaway
function key_takeaway(cfg) {
  const { message = 'Key takeaway message', bullets = [] } = cfg || {};
  let s = '', id = 2;
  s += tb(id++, 'Key Takeaway', E(0.5), E(0.4), E(5), E(0.6), 2200, C.TERRACOTTA, 'l', true, false, FONT.MEDIUM);
  s += tb(id++, message, E(0.5), E(1.2), E(12), E(2.0), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.5), E(3.5), E(12));
  const pts = bullets.length > 0 ? bullets : ['Supporting point 1', 'Supporting point 2', 'Supporting point 3'];
  pts.forEach((b, i) => {
    s += tb(id++, '\u2022  ' + b, E(0.8), E(3.8) + i * E(0.7), E(11), E(0.6), 2200, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  });
  return { xml: wrapLight(s), notes: cfg.notes || message };
}

// 40. Reflection Prompt
function reflection_prompt(cfg) {
  const { prompt = 'How do you feel about this topic?', subtext = '' } = cfg || {};
  let s = '', id = 2;
  s += tb(id++, prompt, E(0.8), E(1.5), E(11), E(3.0), 4800, C.BLACK, 'ctr', false, false, FONT.PRIMARY);
  if (subtext) s += tb(id++, subtext, E(1.5), E(4.8), E(10), E(1.5), 2000, C.MID_GRAY, 'ctr', false, true, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || prompt };
}


// ═══════════════════════════════════════════════════════════════════
// CATEGORY 6: CLOSING & REFERENCE (5 types)
// ═══════════════════════════════════════════════════════════════════

// 41. Key Reminders & Contacts
function contacts(cfg) {
  const { title = 'Key Reminders & Contact Details', contactList = [], rules = [] } = cfg || {};
  const cl = contactList.length > 0 ? contactList : [
    { email: 'contact@company.com', desc: 'General inquiries' },
    { email: 'support@company.com', desc: 'Technical support' },
  ];
  const rl = rules.length > 0 ? rules : ['Always follow the established process', 'When in doubt, escalate'];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.3), E(12), E(0.8), 3800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.5), E(1.2), E(12));
  cl.forEach((c, i) => {
    s += tb(id++, c.email || '', E(0.8), E(1.5) + i * E(0.8), E(5), E(0.4), 2200, C.TERRACOTTA, 'l', true, false, FONT.MEDIUM);
    s += tb(id++, c.desc || '', E(6.0), E(1.5) + i * E(0.8), E(6), E(0.4), 1800, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  });
  const rulesY = E(1.5) + cl.length * E(0.8) + E(0.5);
  s += divLine(id++, E(0.5), rulesY, E(12));
  s += tb(id++, 'Golden Rules', E(0.5), rulesY + E(0.2), E(12), E(0.5), 2200, C.TERRACOTTA, 'ctr', true, false, FONT.MEDIUM);
  rl.forEach((r, i) => {
    s += tb(id++, '\u2713  ' + r, E(1), rulesY + E(0.7) + i * E(0.5), E(11), E(0.4), 1800, C.OLIVE_GRAY, 'ctr', false, false, FONT.TEXT);
  });
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 42. Appendix / Supporting Materials List
function appendix_list(cfg) {
  const { title = 'Supporting Materials', items = [] } = cfg || {};
  const it = items.length > 0 ? items : ['Appendix A — Reference Guide', 'Appendix B — FAQ', 'Appendix C — Glossary'];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(12), E(0.8), 4800, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += divLine(id++, E(0.5), E(1.3), E(12));
  it.forEach((item, i) => {
    s += tb(id++, item, E(0.8), E(1.8) + i * E(0.8), E(11), E(0.6), 2200, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
    if (i < it.length - 1) s += divLine(id++, E(0.8), E(1.8) + (i + 1) * E(0.8) - E(0.05), E(11));
  });
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 43. Next Steps
function next_steps(cfg) {
  const { title = 'Next Steps', steps = [], closing = '' } = cfg || {};
  const st = steps.length > 0 ? steps : [
    'Review the materials shared today',
    'Complete the follow-up exercise',
    'Schedule a check-in with your manager',
  ];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.4), E(12), E(0.8), 4800, C.BLACK, 'ctr', false, false, FONT.PRIMARY);
  s += divLine(id++, E(3), E(1.3), E(7));
  st.forEach((step, i) => {
    const num = String(i + 1).padStart(2, '0');
    s += tb(id++, num, E(1.0), E(1.8) + i * E(1.2), E(1.2), E(0.8), 4400, C.LAVENDER, 'l', true, false, FONT.PRIMARY);
    s += tb(id++, step, E(2.5), E(1.9) + i * E(1.2), E(9), E(0.7), 2200, C.OLIVE_GRAY, 'l', false, false, FONT.TEXT);
  });
  if (closing) {
    s += divLine(id++, E(3), E(5.8), E(7));
    s += tb(id++, closing, E(0.5), E(6.0), E(12), E(0.5), 1600, C.MID_GRAY, 'ctr', false, true, FONT.TEXT);
  }
  return { xml: wrapLight(s), notes: cfg.notes || title };
}

// 44. Thank You
function thank_you(cfg) {
  const { message = 'Thank You', subtitle = '' } = cfg || {};
  let s = '', id = 2;
  s += tb(id++, message, E(0.5), E(2.0), E(12), E(2.5), 6700, C.BLACK, 'ctr', false, false, FONT.PRIMARY);
  s += divLine(id++, E(4), E(4.5), E(5));
  if (subtitle) s += tb(id++, subtitle, E(0.5), E(4.8), E(12), E(0.6), 2000, C.MID_GRAY, 'ctr', false, false, FONT.TEXT);
  return { xml: wrapLight(s), notes: cfg.notes || message };
}

// 45. Legal Dictionary — three-column table (Avoid / Use Instead / Example)
function legal_dictionary(cfg) {
  const { title = 'The Legal Dictionary', terms = [] } = cfg || {};
  const t = terms.length > 0 ? terms : [
    { avoid: 'Defect', use: 'Condition', example: '"Can you describe the condition?"' },
    { avoid: 'Faulty', use: 'Issue', example: '"I\'ve noted the issue you\'re describing"' },
    { avoid: 'Unsafe', use: 'Behaviour', example: '"Tell me about the behaviour observed"' },
    { avoid: 'Broken', use: 'Functionality', example: '"We\'ve logged a symptom regarding..."' },
    { avoid: 'Poor quality', use: 'Characteristic', example: '"Thank you for highlighting that"' },
  ];
  let s = '', id = 2;
  s += tb(id++, title, E(0.5), E(0.3), E(12), E(0.8), 4400, C.BLACK, 'l', false, false, FONT.PRIMARY);
  s += tb(id++, 'Litigious Terms \u2192 Neutral Synonyms', E(0.5), E(1.0), E(12), E(0.4), 1600, C.TERRACOTTA, 'l', false, true, FONT.TEXT);
  s += divLine(id++, E(0.5), E(1.5), E(12));
  // Headers
  s += tb(id++, 'AVOID', E(0.5), E(1.7), E(3.5), E(0.4), 2000, C.RED, 'ctr', true, false, FONT.MEDIUM);
  s += tb(id++, 'USE INSTEAD', E(4.2), E(1.7), E(3.5), E(0.4), 2000, C.GREEN, 'ctr', true, false, FONT.MEDIUM);
  s += tb(id++, 'EXAMPLE PHRASE', E(7.8), E(1.7), E(4.5), E(0.4), 2000, C.MID_GRAY, 'ctr', true, false, FONT.MEDIUM);
  s += divLine(id++, E(0.5), E(2.2), E(12));
  const rowH = Math.min(E(0.75), E(4.2) / t.length);
  t.forEach((term, i) => {
    const y = E(2.4) + i * rowH;
    s += tb(id++, term.avoid || '', E(0.5), y, E(3.5), rowH * 0.8, 1800, C.RED, 'ctr', true, false, FONT.TEXT);
    s += tb(id++, '\u2192  ' + (term.use || ''), E(4.2), y, E(3.5), rowH * 0.8, 1800, C.GREEN, 'ctr', false, false, FONT.TEXT);
    s += tb(id++, term.example || '', E(7.8), y, E(4.5), rowH * 0.8, 1400, C.MID_GRAY, 'ctr', false, true, FONT.TEXT);
  });
  return { xml: wrapLight(s), notes: cfg.notes || title };
}


// ═══════════════════════════════════════════════════════════════════
// ASSEMBLE — packages slides into a finished PPTX
// ═══════════════════════════════════════════════════════════════════

async function assemble(slides, outputPath) {
  const templateBuf = fs.readFileSync(TEMPLATE_PATH);
  const zip = await JSZip.loadAsync(templateBuf);

  // Remove existing slides and media
  Object.keys(zip.files).filter(f => f.match(/^ppt\/(slides|notesSlides)\//)).forEach(f => zip.remove(f));

  // Add each slide
  slides.forEach((s, i) => {
    const n = i + 1;
    zip.file(`ppt/slides/slide${n}.xml`, s.xml);

    // Slide rels — layout ref only (no image ref for light slides)
    let rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout7.xml"/>`;
    // If slide XML references rId2 (dark bg with image), add image rel
    if (s.xml.includes('r:embed="rId2"')) {
      rels += `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/bg1.jpeg"/>`;
    }
    if (s.notes) {
      rels += `<Relationship Id="rId10" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide${n}.xml"/>`;
      zip.file(`ppt/notesSlides/notesSlide${n}.xml`, notesXml(s.notes));
      zip.file(`ppt/notesSlides/_rels/notesSlide${n}.xml.rels`, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="../slides/slide${n}.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="../notesMasters/notesMaster1.xml"/></Relationships>`);
    }
    rels += `</Relationships>`;
    zip.file(`ppt/slides/_rels/slide${n}.xml.rels`, rels);
  });

  // Build presentation.xml with correct slide size (12192000 x 6858000)
  const sldIds = slides.map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${100 + i}"/>`).join('');

  // Detect slide masters from zip
  const smCount = Object.keys(zip.files).filter(f => f.match(/^ppt\/slideMasters\/slideMaster\d+\.xml$/)).length || 1;
  let smList = '';
  for (let i = 1; i <= smCount; i++) smList += `<p:sldMasterId id="${2147483648 + (i - 1) * 12}" r:id="rId${i}"/>`;

  zip.file('ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" saveSubsetFonts="1"><p:sldMasterIdLst>${smList}</p:sldMasterIdLst><p:notesMasterIdLst><p:notesMasterId r:id="rId${smCount + 1}"/></p:notesMasterIdLst><p:sldIdLst>${sldIds}</p:sldIdLst><p:sldSz cx="${SLIDE_CX}" cy="${SLIDE_CY}"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle><a:defPPr><a:defRPr lang="en-US"/></a:defPPr></p:defaultTextStyle></p:presentation>`);

  // Build presentation.xml.rels
  let pR = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;
  for (let i = 1; i <= smCount; i++) pR += `<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster${i}.xml"/>`;
  pR += `<Relationship Id="rId${smCount + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="notesMasters/notesMaster1.xml"/>`;
  pR += `<Relationship Id="rId${smCount + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/>`;
  pR += `<Relationship Id="rId${smCount + 3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/>`;
  pR += `<Relationship Id="rId${smCount + 4}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/>`;
  slides.forEach((_, i) => {
    pR += `<Relationship Id="rId${100 + i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`;
  });
  pR += `</Relationships>`;
  zip.file('ppt/_rels/presentation.xml.rels', pR);

  // Build [Content_Types].xml
  let ct = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/><Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/><Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/>`;
  for (let i = 1; i <= smCount; i++) ct += `<Override PartName="/ppt/slideMasters/slideMaster${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>`;
  for (let i = 1; i <= 60; i++) {
    if (zip.files[`ppt/slideLayouts/slideLayout${i}.xml`]) ct += `<Override PartName="/ppt/slideLayouts/slideLayout${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>`;
  }
  for (let i = 1; i <= 10; i++) {
    if (zip.files[`ppt/theme/theme${i}.xml`]) ct += `<Override PartName="/ppt/theme/theme${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>`;
  }
  slides.forEach((s, i) => {
    ct += `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
    if (s.notes) ct += `<Override PartName="/ppt/notesSlides/notesSlide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>`;
  });
  ct += `</Types>`;
  zip.file('[Content_Types].xml', ct);

  const buf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  fs.writeFileSync(outputPath, buf);
  return { path: outputPath, size: buf.length, slideCount: slides.length };
}


// ═══════════════════════════════════════════════════════════════════
// TEST — generates one of each slide type
// ═══════════════════════════════════════════════════════════════════

async function test() {
  const desktopDir = path.join(require('os').homedir(), 'Desktop');
  // Fallback: if Desktop doesn't exist, use OneDrive Desktop
  let desktop = desktopDir;
  if (!fs.existsSync(desktop)) {
    const oneDrive = path.join(require('os').homedir(), 'OneDrive - Tesla', 'Desktop');
    if (fs.existsSync(oneDrive)) desktop = oneDrive;
    else desktop = __dirname; // fallback to script dir
  }
  const outputPath = path.join(desktop, 'template_engine_test.pptx');

  const allSlides = [
    // Cat 1: Covers & Dividers
    cover_dark({ title: 'Annual Review 2025', presenter: 'Jane Doe', jobTitle: 'Senior Manager', notes: 'Dark cover slide test' }),
    cover_light({ title: 'Quarterly Update\nQ3 2025', presenter: 'John Smith', jobTitle: 'Director, L&D', notes: 'Light cover slide test' }),
    section_divider_light({ title: 'Introduction &\nOverview', number: '01', subtitle: 'Getting started with the basics', notes: 'MASTER SWORD section divider' }),
    section_divider_dark({ title: 'Deep Dive\nAnalysis', subtitle: 'Understanding the core concepts', notes: 'Dark section divider test' }),
    panel_discussion({ title: 'Expert Panel', subtitle: 'Industry Leaders', speakers: [{ name: 'Alice Johnson', role: 'VP Engineering' }, { name: 'Bob Williams', role: 'CTO' }, { name: 'Carol Davis', role: 'Head of Design' }], notes: 'Panel discussion slide' }),
    qa_slide({ title: 'Q&A', subtitle: 'Ask your questions now', notes: 'Q&A slide test' }),

    // Cat 2: Content Slides
    statement_dark({ statement: 'The future of sustainable energy\nis already here.', notes: 'Dark statement test' }),
    statement_light({ statement: 'Every great achievement begins\nwith a clear vision.', body: 'This is the supporting context that helps frame the statement above.', notes: 'Light statement test' }),
    content_left_image_right({ title: 'Innovation Pipeline', body: 'Our innovation pipeline spans three critical areas:\n\n\u2022 Next-generation battery technology\n\u2022 Autonomous driving capabilities\n\u2022 Manufacturing efficiency gains\n\nEach area contributes to our long-term competitive advantage.', imageLabel: '[Product Photo]', notes: 'Content left + image right test' }),
    content_right_image_left({ title: 'Manufacturing Scale', body: 'Global manufacturing capacity continues to expand:\n\n\u2022 Fremont: 650K vehicles/year\n\u2022 Shanghai: 950K vehicles/year\n\u2022 Berlin: 500K vehicles/year\n\u2022 Austin: 500K vehicles/year', imageLabel: '[Factory Photo]', notes: 'Content right + image left test' }),
    content_full_width({ title: 'Program Overview', miniTitle: 'Training & Development', body: 'This comprehensive program covers all aspects of the training curriculum, from foundational knowledge through advanced topics. Participants will engage with interactive exercises, real-world scenarios, and assessments designed to validate competency.\n\nThe program is delivered over three sessions, each building on the previous one.', caption: 'Source: Internal L&D Department, 2025', notes: 'Full-width content test' }),
    two_column({ title: 'Before & After Comparison', leftHeading: 'Previous Process', leftBody: '\u2022 Manual data entry\n\u2022 Paper-based approvals\n\u2022 3-5 day turnaround\n\u2022 Error rate: 8%', rightHeading: 'New Process', rightBody: '\u2022 Automated workflows\n\u2022 Digital approvals\n\u2022 Same-day processing\n\u2022 Error rate: 0.5%', notes: 'Two-column content test' }),
    three_column({ title: 'Three Pillars of Success', columns: [{ heading: 'Quality', body: 'Maintain the highest standards in every vehicle that leaves the factory.' }, { heading: 'Speed', body: 'Reduce time-to-market while maintaining quality benchmarks.' }, { heading: 'Cost', body: 'Optimize manufacturing costs without compromising on materials.' }], notes: 'Three-column content test' }),
    bullet_numbers({ title: 'Core Principles', miniTitle: 'Guiding Framework', items: [{ number: '01', text: 'Customer obsession drives every decision we make' }, { number: '02', text: 'Data-informed choices replace intuition-based guesses' }, { number: '03', text: 'Continuous improvement is a daily practice, not a project' }, { number: '04', text: 'Collaboration across teams accelerates innovation' }], notes: 'Numbered bullets test' }),
    content_caption({ title: 'Compliance Update', body: 'All team members must complete the updated compliance training by end of Q3. The new modules cover recent regulatory changes and include updated scenario-based assessments.\n\nManagers are responsible for ensuring their teams complete training on schedule.', caption: 'Compliance deadline: September 30, 2025. Contact compliance@company.com for extensions.', notes: 'Content with caption test' }),
    process_steps({ title: 'Onboarding Flow', steps: [{ number: '1', text: 'Pre-boarding: Send welcome pack and access credentials 5 days before start' }, { number: '2', text: 'Day 1: Orientation session covering company values, tools, and team introductions' }, { number: '3', text: 'Week 1-2: Shadowing and mentorship with assigned buddy' }], body: 'Average onboarding completion time: 14 business days', notes: 'Process steps test' }),
    quad_block({ title: 'SWOT Analysis', miniTitle: 'Strategic Assessment', blocks: [{ label: 'S', text: 'Strong brand recognition\nGlobal manufacturing scale\nVertical integration' }, { label: 'W', text: 'Supply chain concentration\nService network gaps\nSoftware quality variance' }, { label: 'O', text: 'Emerging markets expansion\nEnergy storage growth\nAutonomy licensing' }, { label: 'T', text: 'Increasing competition\nRegulatory changes\nRaw material costs' }], summary: 'Net assessment: Strong competitive position with manageable risks', notes: 'Quad block test' }),
    content_sidebar({ title: 'Regional Performance', body: 'The EMEA region delivered record results in Q2, driven by strong demand in key markets. Germany, UK, and France contributed 68% of total volume.\n\nNotable trends include accelerating fleet sales and growing energy storage adoption across commercial customers.', sidebarItems: ['Q2 Revenue\n+23% YoY', 'Deliveries\n127,450 units', 'NPS Score\n82 / 100'], notes: 'Content with sidebar test' }),

    // Cat 3: Data & Stats
    big_stat_single({ value: '98.7%', label: 'Customer Satisfaction Rate', context: 'Highest satisfaction score in company history, measured across all service touchpoints in Q2 2025.', notes: 'Big stat single test' }),
    big_stat_multiple({ title: 'Q2 2025 Highlights', caption: 'All metrics represent global consolidated figures', stats: [{ value: '1.2M', label: 'Vehicles Delivered' }, { value: '$28.5B', label: 'Revenue' }, { value: '18.3%', label: 'Operating Margin' }, { value: '52K', label: 'New Employees' }], notes: 'Big stat multiple test' }),
    big_stat_comparison({ leftValue: '835', leftLabel: 'NMC Cell (liters water per kWh)', leftUnit: 'liters', rightValue: '2,118', rightLabel: 'LFP Cell (liters water per kWh)', rightUnit: 'liters', context: 'Water consumption comparison for battery cell production. LFP cells require 2.5x more water per kWh.', notes: 'Big stat comparison test' }),
    bar_chart({ title: 'Annual Deliveries (thousands)', description: 'Global vehicle deliveries 2020\u20132024', bars: [{ value: 500, label: '2020' }, { value: 936, label: '2021' }, { value: 1313, label: '2022' }, { value: 1808, label: '2023' }, { value: 2100, label: '2024' }], notes: 'Bar chart test' }),
    spec_sheet({ title: 'Model S Plaid', specs: [{ value: '1,020', unit: 'hp', label: 'Peak Power' }, { value: '1.99', unit: 's', label: '0-60 mph' }, { value: '200', unit: 'mph', label: 'Top Speed' }, { value: '396', unit: 'mi', label: 'EPA Range' }, { value: '129', unit: 'MPGe', label: 'Combined Efficiency' }], notes: 'Spec sheet test' }),
    timeline({ title: 'Project Roadmap 2025', phases: [{ label: 'Phase 1', period: 'Jan \u2013 Mar', items: 'Requirements gathering\nStakeholder alignment\nBudget approval' }, { label: 'Phase 2', period: 'Apr \u2013 Jun', items: 'Design & prototyping\nUser testing\nIteration' }, { label: 'Phase 3', period: 'Jul \u2013 Sep', items: 'Development sprint\nQA testing\nBeta release' }, { label: 'Phase 4', period: 'Oct \u2013 Dec', items: 'Launch\nMonitoring\nOptimization' }], notes: 'Timeline test' }),
    comparison_table({ title: 'NMC vs LFP Battery Chemistry', leftHeader: 'NMC', rightHeader: 'LFP', rows: [{ label: 'Energy Density', left: '250 Wh/kg', right: '160 Wh/kg' }, { label: 'Cycle Life', left: '1,500 cycles', right: '3,000+ cycles' }, { label: 'Cost per kWh', left: '$115', right: '$75' }, { label: 'Thermal Stability', left: 'Moderate', right: 'Excellent' }, { label: 'Cobalt Content', left: 'Yes', right: 'None' }], notes: 'Comparison table test' }),
    map_layout({ title: 'Global Operations', regions: [{ name: 'North America', locations: 'Fremont, CA \u2022 Austin, TX\nNew York, NY \u2022 Buffalo, NY' }, { name: 'Europe', locations: 'Berlin, DE \u2022 Tilburg, NL\nLondon, UK' }, { name: 'Asia-Pacific', locations: 'Shanghai, CN \u2022 Tokyo, JP' }], mapLabel: '[World Map]', notes: 'Map layout test' }),

    // Cat 4: Visual & Media
    full_bleed_image({ caption: 'Gigafactory Berlin-Brandenburg, 2025', imageLabel: '[Aerial Factory Photo]', notes: 'Full-bleed image test' }),
    image_statement({ statement: 'Accelerating the world\'s transition\nto sustainable energy.', notes: 'Image statement test' }),
    image_grid_2x2({ images: ['Model S', 'Model 3', 'Model X', 'Model Y'], captions: ['Flagship sedan', 'Mass market sedan', 'Premium SUV', 'Compact SUV'], notes: 'Image grid 2x2 test' }),
    image_grid_3({ images: ['Powerwall', 'Megapack', 'Solar Roof'], captions: ['Home energy storage', 'Utility-scale storage', 'Integrated solar tiles'], notes: 'Image grid 3-across test' }),
    image_text_block({ title: 'Cybertruck', description: 'The Cybertruck combines ultra-hard stainless steel exoskeleton with Tesla armor glass, providing maximum utility and performance.\n\nAvailable in three configurations with up to 500+ miles of range.', imageLabel: '[Cybertruck Photo]', notes: 'Image + text block test' }),
    video_placeholder({ title: 'Training Videos', videos: ['Module 1 \u2014 Introduction to Battery Technology', 'Module 2 \u2014 Manufacturing Process Overview', 'Module 3 \u2014 Quality Control Procedures', 'Module 4 \u2014 Safety Protocols'], notes: 'Video placeholder test' }),

    // Cat 5: Interactive / VARK
    discussion_dark({ question: 'What kind of emotions\ndo our customers experience\nduring their first delivery?', notes: 'Discussion dark test' }),
    discussion_light({ question: 'How does our current process\ncompare to industry best practices?', prompt: 'Take 2 minutes to discuss with your table partner. Consider both efficiency and customer satisfaction metrics.', notes: 'Discussion light test' }),
    quiz_mc({ question: 'Which battery chemistry offers the highest cycle life?', answers: ['NMC (Nickel Manganese Cobalt)', 'LFP (Lithium Iron Phosphate)', 'NCA (Nickel Cobalt Aluminum)', 'LCO (Lithium Cobalt Oxide)'], correctIndex: 1, explanation: 'LFP cells typically offer 3,000+ charge cycles compared to 1,500 for NMC, making them ideal for applications prioritizing longevity over energy density.', notes: 'Quiz MC test' }),
    quiz_tf({ question: 'True or False: The 14-day cooling-off period requires the customer to provide a reason for cancellation.', correct: false, explanation: 'The 14-day cooling-off period under EU Consumer Contracts Regulations 2013 allows cancellation without giving any reason.', notes: 'Quiz T/F test' }),
    activity_prompt({ instruction: 'Take 5 minutes to review\nthe scenario card at your table\nand prepare your team\'s response', duration: '\u23F1 5 minutes', hint: 'Focus on identifying the correct process flow and any potential compliance risks.', notes: 'Activity prompt test' }),
    scenario_card({ number: 1, title: 'The Uncertain Customer', situation: 'A customer calls 12 days after delivery. They say the vehicle is "not what they expected" and want to return it. They mention the car is financed through a third-party leasing company. When pressed, they admit there are no defects \u2014 they simply changed their mind.', questions: ['Is this a valid 14-day return?', 'Who is the legal owner of the vehicle?', 'What should you advise the customer?'], notes: 'Scenario card test' }),
    key_takeaway({ message: 'Process compliance protects both\nthe customer and the company.', bullets: ['Always verify B2C vs B2B status before proceeding', 'Document every step in the CMT system', 'When in doubt, escalate to Customer Resolutions'], notes: 'Key takeaway test' }),
    reflection_prompt({ prompt: 'Think about a time when\na clear process saved you\nfrom making a costly mistake.', subtext: 'Take a moment to reflect. What systems or habits helped you make the right decision?', notes: 'Reflection prompt test' }),

    // Cat 6: Closing & Reference
    contacts({ title: 'Key Reminders & Contact Details', contactList: [{ email: 'leasereturns-EU@tesla.com', desc: 'Updates on pending CMT cases' }, { email: 'contactUK@tesla.com', desc: '14-day qualification checks (UK)' }, { email: 'support@company.com', desc: 'General technical support' }], rules: ['Always verify B2C vs B2B first using the Final Invoice', 'Never promise a return without following process', 'Contact Customer Resolutions early if unsure'], notes: 'Contacts slide test' }),
    appendix_list({ title: 'Supporting Materials', items: ['Appendix A \u2014 14-Day Returns Process Flow', 'Appendix B \u2014 Buyback Eligibility Checklist', 'Appendix C \u2014 Legal Dictionary Reference Card', 'Appendix D \u2014 CMT System User Guide', 'Appendix E \u2014 Frequently Asked Questions'], notes: 'Appendix list test' }),
    next_steps({ title: 'Next Steps', steps: ['Review the Legal Dictionary reference card', 'Complete the online assessment by Friday', 'Schedule a practice session with your line manager'], closing: 'Questions? Contact the L&D team at training@company.com', notes: 'Next steps test' }),
    thank_you({ message: 'Thank You', subtitle: 'Your participation makes a difference.', notes: 'Thank you slide test' }),
    legal_dictionary({ title: 'The Legal Dictionary', terms: [{ avoid: 'Defect', use: 'Condition', example: '"Can you describe the condition?"' }, { avoid: 'Unsatisfactory', use: 'Concern', example: '"I understand you have a concern..."' }, { avoid: 'Fit for purpose', use: 'Observation', example: '"Tell me about this observation..."' }, { avoid: 'Faulty', use: 'Issue', example: '"I\'ve noted the issue you\'re describing"' }, { avoid: 'Unsafe', use: 'Behaviour', example: '"Tell me about the behaviour observed"' }, { avoid: 'Broken', use: 'Functionality', example: '"We\'ve logged a symptom regarding..."' }, { avoid: 'Malfunction', use: 'Performance', example: '"Our team will review next steps"' }, { avoid: 'Poor quality', use: 'Characteristic', example: '"Thank you for highlighting that"' }], notes: 'Legal dictionary test' }),
  ];

  console.log(`Building test deck with ${allSlides.length} slides...`);
  const result = await assemble(allSlides, outputPath);
  console.log(`SUCCESS`);
  console.log(`  File: ${result.path}`);
  console.log(`  Size: ${(result.size / 1024).toFixed(1)} KB`);
  console.log(`  Slides: ${result.slideCount}`);
  console.log(`  Slide types implemented: 45`);
  return result;
}


// ═══════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════

module.exports = {
  // Constants
  FONT, C, INS, SLIDE_CX, SLIDE_CY,
  // XML helpers
  X, E, tb, gradTb, divLine, vLine, solidRect, imgPlaceholder,
  bgBlack, bgImg, leftGrad, bottomGrad, accentBar,
  darkBgLeft, darkBgCenter, whiteBg, darkBgEl,
  wrapDark, wrapLight, notesXml,
  RADIAL_GRAD, LINEAR_GRAD,
  // Cat 1: Covers & Dividers
  cover_dark, cover_light, section_divider_light, section_divider_dark, panel_discussion, qa_slide,
  // Cat 2: Content Slides
  statement_dark, statement_light, content_left_image_right, content_right_image_left,
  content_full_width, two_column, three_column, bullet_numbers, content_caption,
  process_steps, quad_block, content_sidebar,
  // Cat 3: Data & Stats
  big_stat_single, big_stat_multiple, big_stat_comparison, bar_chart,
  spec_sheet, timeline, comparison_table, map_layout,
  // Cat 4: Visual & Media
  full_bleed_image, image_statement, image_grid_2x2, image_grid_3, image_text_block, video_placeholder,
  // Cat 5: Interactive / VARK
  discussion_dark, discussion_light, quiz_mc, quiz_tf, activity_prompt, scenario_card,
  key_takeaway, reflection_prompt,
  // Cat 6: Closing & Reference
  contacts, appendix_list, next_steps, thank_you, legal_dictionary,
  // Assembly & Test
  assemble, test,
};
