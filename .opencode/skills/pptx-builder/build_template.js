const fs=require('fs'),JSZip=require('jszip'),path=require('path');
(async()=>{
function X(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');}
const E=i=>Math.round(i*914400);
const W=12192000,H=6858000;

// ===== FONTS (weight hierarchy, NO bold attribute ever) =====
const FL='Universal Sans Display 330';  // Light — captions, fine print
const FR='Universal Sans Display 430';  // Regular — body text
const FM='Universal Sans Display 530';  // Medium — titles, emphasis
const FH='Universal Sans Display 630';  // Heavy — giant numbers
const FT='Universal Sans Text 430';     // Text — section divider titles

// ===== COLORS =====
const WHT='FFFFFF',BLK='000000';
const C={
  mgray:'929292', dgray:'5E5E5E', ogray:'6A6A66', lgray:'D5D5D5', lav:'D5CDE5',
  teal:'5B9A8B', rose:'C4848B', sage:'8BA87E', dusk:'7B8FA1', plum:'9B7EA5',
  sand:'C4A882', slate:'6E7E85', copper:'B87D5E', terra:'EC9668',
};

// ===== GRADIENT TEXT (5 color variants) =====
function gradFill(endColor){
  return `<a:gradFill flip="none" rotWithShape="1"><a:gsLst><a:gs pos="85000"><a:srgbClr val="${endColor}"/></a:gs><a:gs pos="20000"><a:schemeClr val="bg1"><a:alpha val="45000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect r="100000" b="100000"/></a:path><a:tileRect l="-100000" t="-100000"/></a:gradFill>`;
}
const GRADS={
  gold:gradFill('B26D15'), teal:gradFill('5B9A8B'), rose:gradFill('C4848B'),
  dusk:gradFill('7B8FA1'), plum:gradFill('9B7EA5'), sage:gradFill('8BA87E'),
  copper:gradFill('B87D5E'), sand:gradFill('C4A882'),
};
const gradKeys=Object.keys(GRADS);

// ===== BACKGROUND ELEMENTS =====
const BG_BLK=id=>`<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="B"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${W}" cy="${H}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
const BG_IMG=(id,rId)=>`<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="I"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rId}"><a:alphaModFix amt="25000"/></a:blip><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${W}" cy="${H}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;
const L_GRAD=id=>`<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="G"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="7208521" cy="${H}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:gradFill><a:gsLst><a:gs pos="32000"><a:srgbClr val="000000"><a:alpha val="67000"/></a:srgbClr></a:gs><a:gs pos="100000"><a:srgbClr val="000000"><a:alpha val="0"/></a:srgbClr></a:gs></a:gsLst><a:lin ang="7108"/></a:gradFill><a:ln w="12700"><a:miter lim="400000"/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
// Charge bar: green fills bottom→top. ang=0 in local space = bottom→top after 90° rotation
const CBAR=(id,gp)=>`<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="CB"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm rot="5400000"><a:off x="9093067" y="3374761"/><a:ext cx="5416098" cy="108478"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 50000"/></a:avLst></a:prstGeom><a:gradFill><a:gsLst><a:gs pos="0"><a:srgbClr val="4EA72E"><a:alpha val="90000"/></a:srgbClr></a:gs><a:gs pos="${gp}"><a:srgbClr val="D4D4D4"><a:alpha val="50000"/></a:srgbClr></a:gs></a:gsLst><a:lin ang="0" scaled="0"/></a:gradFill><a:ln w="12700"><a:noFill/><a:miter lim="400000"/></a:ln><a:effectLst><a:outerShdw blurRad="50800" dist="38100" dir="2700000" algn="tl" rotWithShape="0"><a:prstClr val="black"><a:alpha val="20000"/></a:prstClr></a:outerShdw></a:effectLst></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;

// Rounded corner image (proper aspect ratio via blipFill)
function rImg(id,rId,x,y,cx,cy){
  return `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="RI"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill rotWithShape="1"><a:blip r:embed="${rId}"/><a:srcRect/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 4000"/></a:avLst></a:prstGeom></p:spPr></p:pic>`;
}

// ===== BACKGROUND BUILDERS =====
const TOT=65;let SI=0;
function bgDark(sid){
  let s='',id=sid;
  s+=BG_BLK(id++);s+=BG_IMG(id++,'rId2');s+=L_GRAD(id++);
  s+=CBAR(id++,Math.round((SI/TOT)*100000)||1000);
  return{xml:s,nextId:id};
}
function bgLight(sid){
  let s='',id=sid;
  s+=CBAR(id++,Math.round((SI/TOT)*100000)||1000);
  return{xml:s,nextId:id};
}

// ===== TEXT with Material Design typography =====
// Line spacing: >=40pt → 120%, 20-39pt → 150%, <20pt → 140%
// NEVER bold. Use font weight.
function tb(id,text,x,y,cx,cy,sz,clr,al,font){
  const f=font||FR,a=al||'l';
  const ls=sz>=4000?120000:sz>=2000?150000:140000;
  const p=X(text).split('\n').map(l=>`<a:p><a:pPr algn="${a}"><a:lnSpc><a:spcPct val="${ls}"/></a:lnSpc></a:pPr><a:r><a:rPr lang="en-GB" sz="${sz}" dirty="0"><a:solidFill><a:srgbClr val="${clr}"/></a:solidFill><a:latin typeface="${f}"/></a:rPr><a:t>${l}</a:t></a:r></a:p>`).join('');
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="T"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="50800" tIns="25400" rIns="50800" bIns="25400"><a:normAutofit/></a:bodyPr><a:lstStyle/>${p}</p:txBody></p:sp>`;
}
// Gradient title text (takes gradient key name)
function gTb(id,text,x,y,cx,cy,sz,al,gradKey){
  const a=al||'l',gf=GRADS[gradKey||'gold'];
  const ls=sz>=4000?120000:150000;
  const p=X(text).split('\n').map(l=>`<a:p><a:pPr algn="${a}"><a:lnSpc><a:spcPct val="${ls}"/></a:lnSpc></a:pPr><a:r><a:rPr lang="en-GB" sz="${sz}" dirty="0">${gf}<a:latin typeface="${FR}"/></a:rPr><a:t>${l}</a:t></a:r></a:p>`).join('');
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="GT"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="50800" tIns="25400" rIns="50800" bIns="25400"><a:spAutoFit/></a:bodyPr><a:lstStyle/>${p}</p:txBody></p:sp>`;
}
function dLine(id,x,y,cx,gradClr){
  const gc=gradClr||C.lgray;
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="DL"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="25400"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:gradFill><a:gsLst><a:gs pos="0"><a:srgbClr val="${gc}"><a:alpha val="80000"/></a:srgbClr></a:gs><a:gs pos="100000"><a:srgbClr val="${gc}"><a:alpha val="10000"/></a:srgbClr></a:gs></a:gsLst><a:lin ang="0" scaled="0"/></a:gradFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
}
function vLine(id,x,y,cy,clr){return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="VL"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="12700" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="${clr||C.lgray}"><a:alpha val="25000"/></a:srgbClr></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;}
// Rounded rect shape (for poll bars, action planning boxes etc)
function rRect(id,x,y,cx,cy,fillClr,alpha){return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="RR"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 8000"/></a:avLst></a:prstGeom><a:solidFill><a:srgbClr val="${fillClr}"><a:alpha val="${alpha||20000}"/></a:srgbClr></a:solidFill><a:ln><a:solidFill><a:srgbClr val="${fillClr}"><a:alpha val="${(alpha||20000)+15000}"/></a:srgbClr></a:solidFill></a:ln></p:spPr><p:txBody><a:bodyPr anchor="ctr" lIns="137160"/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;}

function wrapD(s){return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${s}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;}
function wrapL(s){return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="F5F5F5"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${s}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;}

const slides=[],imgs=[];
function dark(shapes,img,grad){let b=bgDark(2),s=b.xml,id=b.nextId;const r=typeof shapes==='function'?shapes(id,grad||gradKeys[SI%gradKeys.length]):shapes;slides.push({xml:wrapD(typeof r==='object'?r.s:s+r),light:false});imgs.push(img||`bg${(SI%14)+1}.jpg`);SI++;}
function light(shapes,img){let b=bgLight(2),s=b.xml,id=b.nextId;const r=typeof shapes==='function'?shapes(id):shapes;slides.push({xml:wrapL(typeof r==='object'?r.s:s+r),light:true});imgs.push(img||`bg${(SI%14)+1}.jpg`);SI++;}

// ===== HELPER: build dark slide content =====
function mkDark(buildFn,img,gradKey){
  const b=bgDark(2);let s=b.xml,id=b.nextId;
  const content=buildFn(id,gradKey||gradKeys[SI%gradKeys.length]);
  slides.push({xml:wrapD(s+content),light:false});
  imgs.push(img||`bg${(SI%14)+1}.jpg`);SI++;
}
function mkLight(buildFn,img){
  const b=bgLight(2);let s=b.xml,id=b.nextId;
  const content=buildFn(id);
  slides.push({xml:wrapL(s+content),light:true});
  imgs.push(img||`bg${(SI%14)+1}.jpg`);SI++;
}

// =====================================================================
// 65 TEMPLATE SLIDES
// =====================================================================

// --- COVERS (1-6) ---

// 1. Title Cover — gradient title, centered vertically
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Title Here',E(0.8),E(2.5),E(8),E(2.5),6000,'l',gk);
  s+=dLine(id++,E(0.6),E(5.0),E(7),C.sand);
  s+=tb(id++,'Subtitle Line',E(0.8),E(5.3),E(7),E(0.5),2400,WHT,'l',FM);
  s+=tb(id++,'Presenter  |  Role  |  Date',E(0.8),E(6.2),E(7),E(0.4),1500,C.lgray,'l',FL);
  return s;},'bg1.jpg','gold');

// 2. Title Cover Alt — title at bottom
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Presentation\nTitle Here',E(0.6),E(3.8),E(8),E(2.5),5400,'l',gk);
  s+=tb(id++,'Date  |  Team  |  Location',E(0.6),E(6.5),E(7),E(0.3),1500,C.lgray,'l',FL);
  return s;},'bg2.jpg','teal');

// 3. Title + Rounded Image
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Title Here',E(0.6),E(1.8),E(5.5),E(2.0),5400,'l',gk);
  s+=tb(id++,'Supporting context for the presentation',E(0.6),E(4.0),E(5),E(1.0),1800,C.lgray,'l',FR);
  s+=rImg(id++,'rId3',E(7.2),E(1.0),E(5.5),E(5.5));
  return s;},'bg3.jpg','rose');

// 4. Panel Discussion
mkDark((id,gk)=>{let s='';
  s+=tb(id++,'Panel Discussion',E(0.6),E(0.5),E(6),E(0.6),3200,C.terra,'l',FM);
  s+=gTb(id++,'Panel Title Here',E(0.6),E(1.2),E(8),E(2.0),5400,'l',gk);
  s+=dLine(id++,E(0.6),E(5.0),E(7),C.terra);
  s+=tb(id++,'Speaker Name',E(0.6),E(5.3),E(3.5),E(0.4),1800,WHT,'l',FM);
  s+=tb(id++,'Job Title',E(0.6),E(5.7),E(3.5),E(0.3),1400,C.mgray,'l',FL);
  s+=tb(id++,'Speaker Name',E(4.5),E(5.3),E(3.5),E(0.4),1800,WHT,'l',FM);
  s+=tb(id++,'Job Title',E(4.5),E(5.7),E(3.5),E(0.3),1400,C.mgray,'l',FL);
  return s;},'bg4.jpg','gold');

// 5. Section Divider (giant number right)
mkDark((id)=>{let s='';
  s+=tb(id++,'1',E(8.2),E(0.2),E(4.5),E(6.5),28800,C.lav,'r',FH);
  s+=tb(id++,'Section Title\nHere',E(0.6),E(4.8),E(7),E(1.8),4200,WHT,'l',FT);
  s+=tb(id++,'Section description',E(0.6),E(6.6),E(6),E(0.3),1500,C.lgray,'l',FL);
  return s;},'bg5.jpg');

// 6. Section Divider Alt (number left)
mkDark((id)=>{let s='';
  s+=tb(id++,'2',E(0.3),E(0.2),E(5),E(6.5),28800,C.lav,'l',FH);
  s+=tb(id++,'Section Title\nHere',E(5.5),E(4.5),E(7),E(1.8),4200,WHT,'l',FT);
  return s;},'bg6.jpg');

// --- CONTENT DARK (7-14) ---

// 7. Statement (one big line fills slide)
mkDark((id,gk)=>{return gTb(id,'A powerful statement\nthat fills the slide\nand captures attention',E(1.2),E(1.2),E(9),E(5.5),6600,'l',gk);},'bg7.jpg','dusk');

// 8. Statement + body
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Key message\ngoes here',E(0.8),E(1.5),E(8),E(2.5),5400,'l',gk);
  s+=dLine(id++,E(0.6),E(4.5),E(8),'9B7EA5');
  s+=tb(id++,'Supporting detail that adds context.\nKeep to two sentences max.',E(0.6),E(4.9),E(7),E(1.5),1800,C.lgray,'l',FR);
  return s;},'bg8.jpg','plum');

// 9. Content left + rounded image right
mkDark((id,gk)=>{let s='';
  s+=tb(id++,'Main Title',E(0.6),E(0.5),E(5.5),E(0.6),4800,C.mgray,'l',FM);
  s+=tb(id++,'Mini Title',E(0.6),E(1.3),E(5.5),E(0.5),3200,C.teal,'l',FR);
  s+=tb(id++,'Body text here. Key points and\nsupporting evidence for this topic.\n\nKeep language clear and direct.',E(0.6),E(2.2),E(5.5),E(4.0),1800,C.lgray,'l',FR);
  s+=rImg(id++,'rId3',E(6.8),E(0.5),E(5.8),E(3.5));
  return s;},'bg9.jpg','teal');

// 10. Content right + rounded image left
mkDark((id,gk)=>{let s='';
  s+=rImg(id++,'rId3',E(0.3),E(0.5),E(5.8),E(3.5));
  s+=tb(id++,'Main Title',E(6.5),E(0.5),E(6),E(0.6),4800,WHT,'l',FM);
  s+=tb(id++,'Body text with key points\nand supporting detail.',E(6.5),E(1.5),E(5.8),E(5.0),1800,C.lgray,'l',FR);
  return s;},'bg10.jpg');

// 11. Two-Column (no horiz line — vertical divider is enough. Added 12pt body bullets)
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Two Column\nTitle',E(0.6),E(0.3),E(7),E(1.5),4800,'l',gk);
  s+=tb(id++,'Column A Heading',E(0.6),E(2.0),E(5.5),E(0.5),2200,WHT,'l',FM);
  s+=tb(id++,'Left column content.\nDescribe the first concept.',E(0.6),E(2.7),E(5.5),E(1.5),1600,C.lgray,'l',FR);
  s+=tb(id++,'\u2022  Lorem ipsum dolor sit amet\n\u2022  Consectetur adipiscing elit\n\u2022  Sed do eiusmod tempor',E(0.6),E(4.4),E(5.5),E(2.5),1200,C.mgray,'l',FL);
  s+=vLine(id++,E(6.3),E(2.0),E(5.0),C.sand);
  s+=tb(id++,'Column B Heading',E(6.8),E(2.0),E(5.5),E(0.5),2200,WHT,'l',FM);
  s+=tb(id++,'Right column content.\nDescribe the second concept.',E(6.8),E(2.7),E(5.5),E(1.5),1600,C.lgray,'l',FR);
  s+=tb(id++,'\u2022  Ut enim ad minim veniam\n\u2022  Quis nostrud exercitation\n\u2022  Ullamco laboris nisi ut',E(6.8),E(4.4),E(5.5),E(2.5),1200,C.mgray,'l',FL);
  return s;},'bg11.jpg','copper');

// 12. Three-Column
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Three Themes',E(0.6),E(1.0),E(7),E(1.0),4400,'l',gk);
  s+=dLine(id++,E(0.6),E(2.2),E(10),'8BA87E');
  [0,1,2].forEach(i=>{const x=E(0.6+i*4.2);
    s+=tb(id++,`Theme ${i+1}`,x,E(2.6),E(3.8),E(0.5),2000,WHT,'l',FM);
    s+=tb(id++,'Description for this\ntheme or topic area.',x,E(3.3),E(3.8),E(3.5),1500,C.lgray,'l',FR);
  });
  return s;},'bg12.jpg','sage');

// 13. Content + Caption Bar
mkDark((id,gk)=>{let s='';
  s+=tb(id++,'Title Statement',E(0.6),E(0.5),E(7),E(0.6),4800,WHT,'l',FM);
  s+=tb(id++,'Body text with main content.\nDescribe the topic in detail.',E(0.6),E(1.5),E(7),E(2.5),1800,C.lgray,'l',FR);
  s+=rImg(id++,'rId3',E(0.5),E(4.3),E(12),E(2.2));
  s+=tb(id++,'Caption: additional context',E(0.6),E(6.7),E(12),E(0.3),1300,C.mgray,'l',FL);
  return s;},'bg13.jpg');

// 14. Content Sidebar (70/30)
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Main Content\nTitle',E(0.6),E(0.3),E(7),E(1.5),4800,'l',gk);
  s+=tb(id++,'Primary content area.\nUse for core message.',E(0.6),E(2.2),E(7.5),E(4.0),1800,C.lgray,'l',FR);
  s+=vLine(id++,E(8.5),E(0.5),E(6.5),C.sand);
  s+=tb(id++,'Sidebar',E(9.0),E(0.5),E(3.5),E(0.5),2000,C.sand,'l',FM);
  s+=tb(id++,'Key stat or callout',E(9.0),E(1.3),E(3.5),E(5.0),1600,C.lgray,'l',FR);
  return s;},'bg14.jpg','sand');

// --- CONTENT LIGHT (15-22) ---

// 15. Full-Width (white bg)
mkLight(id=>{let s='';
  s+=tb(id++,'Main Title',E(0.6),E(0.5),E(8),E(0.7),4800,C.mgray,'l',FM);
  s+=tb(id++,'Mini Title',E(0.6),E(1.3),E(8),E(0.5),3200,C.teal,'l',FR);
  s+=tb(id++,'Body text spanning full width.\nDescribe the topic in detail here.\n\nKeep language clear and direct.',E(0.6),E(2.2),E(12),E(4.5),1800,C.ogray,'l',FR);
  return s;});

// 16. Two-Column (white)
mkLight(id=>{let s='';
  s+=tb(id++,'Comparison Title',E(0.6),E(0.5),E(8),E(0.7),4800,C.mgray,'l',FM);
  s+=dLine(id++,E(0.6),E(1.4),E(12),C.teal);
  s+=tb(id++,'Option A',E(0.6),E(1.7),E(5.5),E(0.5),2200,C.sage,'l',FM);
  s+=tb(id++,'Content for option A.\nDetail the first perspective.',E(0.6),E(2.4),E(5.5),E(4.0),1600,C.ogray,'l',FR);
  s+=vLine(id++,E(6.3),E(1.7),E(5),C.teal);
  s+=tb(id++,'Option B',E(6.8),E(1.7),E(5.5),E(0.5),2200,C.rose,'l',FM);
  s+=tb(id++,'Content for option B.\nDetail the second perspective.',E(6.8),E(2.4),E(5.5),E(4.0),1600,C.ogray,'l',FR);
  return s;});

// 17. Three-Column (white)
mkLight(id=>{let s='';
  s+=tb(id++,'Three Topics',E(0.6),E(0.5),E(8),E(0.7),4800,C.mgray,'l',FM);
  s+=dLine(id++,E(0.6),E(1.4),E(12),C.plum);
  [0,1,2].forEach(i=>{const x=E(0.6+i*4.2);const clrs=[C.teal,C.plum,C.copper];
    s+=tb(id++,`Topic ${i+1}`,x,E(1.7),E(3.8),E(0.5),2000,clrs[i],'l',FM);
    s+=tb(id++,'Description for this\ntopic area.',x,E(2.4),E(3.8),E(4.0),1500,C.ogray,'l',FR);
  });
  return s;});

// 18. Key Points A/B/C (white)
mkLight(id=>{let s='';
  s+=tb(id++,'Main Title',E(0.6),E(0.5),E(8),E(0.7),4800,C.mgray,'l',FM);
  s+=tb(id++,'Mini Title',E(0.6),E(1.2),E(8),E(0.5),3200,C.dusk,'l',FR);
  ['A','B','C'].forEach((l,i)=>{const y=E(2.0+i*1.7);
    s+=tb(id++,l,E(0.6),y,E(0.5),E(0.5),2400,C.dusk,'l',FM);
    s+=tb(id++,'Point description text with detail.',E(1.8),y,E(10),E(1.2),1800,C.ogray,'l',FR);
  });
  return s;});

// 19. Quad Block (white)
mkLight(id=>{let s='';
  s+=tb(id++,'Quad Block Title',E(0.6),E(0.5),E(8),E(0.7),4800,C.mgray,'l',FM);
  s+=dLine(id++,E(0.6),E(1.3),E(12),C.copper);
  ['A','B','C','D'].forEach((l,i)=>{const col=i%2,row=Math.floor(i/2);const x=col===0?E(0.6):E(6.8);const y=E(1.6+row*2.6);
    s+=tb(id++,l,x,y,E(0.5),E(0.5),2400,C.copper,'l',FM);
    s+=tb(id++,'Content for this quadrant.\nAdd detail as needed.',x+E(0.7),y,E(5),E(2.0),1600,C.ogray,'l',FR);
  });
  return s;});

// 20. Comparison Table (white)
mkLight(id=>{let s='';
  s+=tb(id++,'Comparison Title',E(0.8),E(0.5),E(8),E(0.7),4800,C.mgray,'l',FM);
  s+=dLine(id++,E(0.6),E(1.3),E(12),C.sage);
  s+=tb(id++,'Option A',E(0.6),E(1.5),E(5.5),E(0.5),2200,C.sage,'ctr',FM);
  s+=tb(id++,'Option B',E(6.8),E(1.5),E(5.5),E(0.5),2200,C.rose,'ctr',FM);
  s+=vLine(id++,E(6.3),E(1.5),E(5),C.sage);
  [0,1,2,3].forEach(i=>{const y=E(2.3+i*1.1);
    s+=tb(id++,'Detail A row '+(i+1),E(0.6),y,E(5.5),E(0.7),1600,C.ogray,'l',FR);
    s+=tb(id++,'Detail B row '+(i+1),E(6.8),y,E(5.5),E(0.7),1600,C.ogray,'l',FR);
    if(i<3) s+=dLine(id++,E(0.6),y+E(0.8),E(12),C.lgray);
  });
  return s;});

// 21. Timeline (white)
mkLight(id=>{let s='';
  s+=tb(id++,'Timeline Title',E(0.8),E(0.5),E(8),E(0.7),4800,C.mgray,'l',FM);
  s+=dLine(id++,E(0.6),E(1.3),E(12),C.plum);
  [0,1,2,3,4].forEach(i=>{const y=E(1.6+i*1.05);
    s+=tb(id++,'Phase '+(i+1),E(0.6),y,E(2.8),E(0.4),1800,C.plum,'r',FM);
    s+=tb(id++,'Activity description',E(3.8),y,E(8.5),E(0.4),1600,C.ogray,'l',FR);
    if(i<4) s+=dLine(id++,E(0.6),y+E(0.6),E(12),C.lgray);
  });
  return s;});

// 22. Content + rounded image (white)
mkLight(id=>{let s='';
  s+=tb(id++,'Content Title',E(0.8),E(0.6),E(6),E(0.7),4800,C.mgray,'l',FM);
  s+=tb(id++,'Body text with key points.',E(0.6),E(1.5),E(5.5),E(4.0),1800,C.ogray,'l',FR);
  s+=rImg(id++,'rId3',E(6.8),E(0.5),E(5.8),E(3.5));
  return s;});

// --- DATA & STATS (23-30) ---

// 23. Big Stat Single (dark) — supporting text sits tight under number
mkDark((id,gk)=>{let s='';
  s+=tb(id++,'000',E(0.8),E(0.8),E(6),E(3.0),18000,WHT,'l',FH);
  s+=tb(id++,'Data Label',E(0.6),E(3.2),E(5),E(0.5),3000,C.teal,'l',FM);
  s+=dLine(id++,E(0.6),E(3.9),E(6),'5B9A8B');
  s+=tb(id++,'Context about this number\nand what it represents.',E(0.6),E(4.2),E(8),E(2.0),1800,C.lgray,'l',FR);
  return s;},'bg1.jpg','teal');

// 24. Big Stat Multiple (dark) — labels tight under numbers
mkDark((id)=>{let s='';
  s+=tb(id++,'Main Title',E(0.6),E(0.5),E(8),E(0.7),4800,C.mgray,'l',FM);
  const clrs=[C.teal,C.rose,C.dusk];
  [0,1,2].forEach(i=>{const x=E(0.6+i*4.2);
    s+=tb(id++,'Data '+(i+1),x,E(1.5),E(3.8),E(0.4),1600,clrs[i],'l',FM);
    s+=tb(id++,'000',x,E(1.9),E(3.8),E(2.2),14400,C.lav,'l',FH);
    s+=tb(id++,'Unit or context',x,E(3.8),E(3.8),E(0.4),1400,C.mgray,'l',FL);
  });
  return s;},'bg2.jpg');

// 25. Big Stat Comparison (white)
mkLight(id=>{let s='';
  s+=tb(id++,'-1',E(0.6),E(0.5),E(5),E(2.8),14400,C.rose,'l',FH);
  s+=tb(id++,'Label A',E(0.6),E(2.8),E(5),E(0.5),2800,C.rose,'l',FM);
  s+=tb(id++,'What this number means',E(0.6),E(3.4),E(5),E(3.0),1600,C.ogray,'l',FR);
  s+=vLine(id++,E(6.3),E(0.5),E(6.0),C.sage);
  s+=tb(id++,'0',E(6.8),E(0.5),E(5),E(2.8),14400,C.sage,'l',FH);
  s+=tb(id++,'Label B',E(6.8),E(2.8),E(5),E(0.5),2800,C.sage,'l',FM);
  s+=tb(id++,'What this number means',E(6.8),E(3.4),E(5),E(3.0),1600,C.ogray,'l',FR);
  return s;});

// 26. Spec Sheet (dark)
mkDark((id)=>{let s='';
  s+=tb(id++,'Model Name',E(0.6),E(0.5),E(6),E(1.0),6800,WHT,'l',FR);
  s+=rImg(id++,'rId3',E(7.5),E(0.3),E(5),E(3));
  [0,1,2].forEach(i=>{const y=E(2.0+i*1.6);
    s+=tb(id++,'Variant '+(i+1),E(0.6),y,E(3),E(0.5),2200,WHT,'l',FM);
    s+=tb(id++,'000',E(4.0),y,E(1.2),E(0.5),3600,WHT,'l',FH);
    s+=tb(id++,'mi',E(5.1),y+E(0.1),E(0.5),E(0.3),1400,C.mgray,'l',FL);
    s+=tb(id++,'000',E(5.8),y,E(1.2),E(0.5),3600,WHT,'l',FH);
    s+=tb(id++,'mph',E(6.9),y+E(0.1),E(0.6),E(0.3),1400,C.mgray,'l',FL);
  });
  return s;},'bg3.jpg');

// 27. Bar Chart placeholder (white)
mkLight(id=>{let s='';
  s+=tb(id++,'Chart Title',E(0.6),E(0.5),E(5),E(0.7),4800,C.dgray,'l',FM);
  s+=tb(id++,'Chart Subtitle',E(0.6),E(1.3),E(5),E(0.4),2000,C.mgray,'l',FR);
  const heights=[1.5,2.2,1.8,3.0,2.5,3.5];const clrs=[C.teal,C.teal,C.dusk,C.dusk,C.plum,C.plum];
  heights.forEach((h,i)=>{const x=E(1.5+i*1.8);
    s+=rRect(id++,x,E(6.3-h),E(1.2),E(h),clrs[i],30000);
    s+=tb(id++,'202'+i,x,E(6.4),E(1.2),E(0.3),1400,C.mgray,'ctr',FL);
  });
  return s;});

// 28. Map Layout (dark)
mkDark((id)=>{let s='';
  s+=tb(id++,'Map Title',E(0.6),E(0.5),E(5),E(0.7),4800,WHT,'l',FM);
  s+=rImg(id++,'rId3',E(6.5),E(0.3),E(6),E(7));
  ['Region A','Region B','Region C'].forEach((r,i)=>{
    s+=tb(id++,r,E(0.6),E(1.5+i*1.5),E(5),E(0.4),1800,C.dusk,'l',FM);
    s+=tb(id++,'Location 1, Location 2',E(0.6),E(2.0+i*1.5),E(5.5),E(0.4),1500,C.lgray,'l',FR);
  });
  return s;},'bg4.jpg');

// 29. Dictionary/Table (dark)
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Dictionary Title',E(0.6),E(0.3),E(7),E(1.0),4400,'l',gk);
  s+=dLine(id++,E(0.6),E(1.5),E(12),C.sand);
  s+=tb(id++,'COLUMN A',E(0.6),E(1.7),E(3.5),E(0.4),1600,C.rose,'l',FM);
  s+=tb(id++,'COLUMN B',E(4.2),E(1.7),E(3.5),E(0.4),1600,C.sage,'l',FM);
  s+=tb(id++,'COLUMN C',E(7.8),E(1.7),E(4.5),E(0.4),1600,C.mgray,'l',FM);
  [0,1,2,3,4,5].forEach(i=>{const y=E(2.3+i*0.7);
    s+=tb(id++,'Term '+(i+1),E(0.6),y,E(3.5),E(0.5),1600,C.rose,'l',FR);
    s+=tb(id++,'\u2192  Synonym',E(4.2),y,E(3.5),E(0.5),1600,C.sage,'l',FR);
    s+=tb(id++,'Example phrase',E(7.8),y,E(4.5),E(0.5),1300,C.mgray,'l',FL);
  });
  return s;},'bg5.jpg','sand');

// 30. Stats with rounded images (dark) — text tight
mkDark((id)=>{let s='';
  s+=tb(id++,'1 Million',E(0.6),E(2.5),E(7),E(2.2),10000,WHT,'l',FR);
  s+=tb(id++,'Units Produced',E(0.6),E(4.5),E(7),E(0.6),4800,C.terra,'l',FM);
  return s;},'bg6.jpg');

// --- IMAGE LAYOUTS (31-38) ---

// 31. Full image + bottom statement
mkDark((id,gk)=>{return tb(id,'Statement text over the image',E(0.6),E(5.5),E(9),E(1.0),4800,WHT,'l',FR);},'bg7.jpg');

// 32. Two rounded images + captions
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Visual Title',E(0.6),E(0.3),E(7),E(1.0),4400,'l',gk);
  s+=rImg(id++,'rId3',E(0.5),E(1.5),E(5.8),E(3.5));
  s+=rImg(id++,'rId4',E(6.8),E(1.5),E(5.8),E(3.5));
  s+=tb(id++,'Caption 1',E(0.5),E(5.2),E(5.8),E(0.4),1300,C.mgray,'ctr',FL);
  s+=tb(id++,'Caption 2',E(6.8),E(5.2),E(5.8),E(0.4),1300,C.mgray,'ctr',FL);
  return s;},'bg8.jpg','rose');

// 33. Three rounded images
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Image Gallery',E(0.6),E(0.3),E(7),E(1.0),4400,'l',gk);
  [0,1,2].forEach(i=>{const x=E(0.5+i*4.2);
    s+=rImg(id++,'rId3',x,E(1.5),E(3.8),E(4.5));
    s+=tb(id++,'Caption '+(i+1),x,E(6.2),E(3.8),E(0.3),1300,C.mgray,'ctr',FL);
  });
  return s;},'bg9.jpg','plum');

// 34. Four images grid (2x2)
mkDark((id)=>{let s='';
  s+=tb(id++,'Image Grid',E(0.6),E(0.2),E(5),E(0.5),3200,WHT,'l',FM);
  [[0.5,0.8,5.8,2.8],[6.8,0.8,5.8,2.8],[0.5,3.9,5.8,2.8],[6.8,3.9,5.8,2.8]].forEach(p=>{
    s+=rImg(id++,'rId3',E(p[0]),E(p[1]),E(p[2]),E(p[3]));
  });
  return s;},'bg10.jpg');

// 35. Large image left + text right
mkDark((id,gk)=>{let s='';
  s+=rImg(id++,'rId3',E(0.3),E(0.5),E(6.5),E(6.5));
  s+=tb(id++,'Title Here',E(7.3),E(1.0),E(5),E(1.0),4400,WHT,'l',FM);
  s+=tb(id++,'Description related to\nthe image.',E(7.3),E(2.5),E(5),E(4.0),1800,C.lgray,'l',FR);
  return s;},'bg11.jpg');

// 36. Feature points
mkDark((id)=>{let s='';
  s+=tb(id++,'Feature overview text',E(0.6),E(5.5),E(9),E(0.7),2200,WHT,'l',FR);
  ['Feature 1','Feature 2','Feature 3'].forEach((f,i)=>{
    s+=tb(id++,f,E(0.5+i*4.2),E(6.5),E(3.8),E(0.4),1800,C.terra,'l',FM);
  });
  return s;},'bg12.jpg');

// 37. How It Works (3-step + images)
mkDark((id,gk)=>{let s='';
  s+=tb(id++,'How It Works',E(0.6),E(0.4),E(5),E(0.6),4200,WHT,'l',FM);
  s+=tb(id++,'Process subtitle',E(0.6),E(1.1),E(5),E(0.4),2000,C.terra,'l',FR);
  [0,1,2].forEach(i=>{const x=E(0.5+i*4.2);
    s+=tb(id++,String(i+1),x,E(1.8),E(0.8),E(0.5),2200,C.lav,'l',FH);
    s+=tb(id++,'Step description',x,E(2.3),E(3.8),E(0.8),1600,C.lgray,'l',FR);
    s+=rImg(id++,'rId3',x,E(3.3),E(3.8),E(3.2));
  });
  return s;},'bg13.jpg');

// 38. Video placeholder
mkDark((id)=>{let s='';
  s+=tb(id++,'Videos',E(0.6),E(0.5),E(4),E(0.7),4200,WHT,'l',FT);
  s+=tb(id++,'Video Title 1',E(0.6),E(1.8),E(6),E(0.4),1500,C.terra,'l',FR);
  s+=tb(id++,'Video Title 2',E(0.6),E(2.4),E(6),E(0.4),1500,C.terra,'l',FR);
  s+=tb(id++,'Video Title 3',E(0.6),E(3.0),E(6),E(0.4),1500,C.terra,'l',FR);
  return s;},'bg14.jpg');

// --- INTERACTIVE / VARK (39-52) ---

// 39. Discussion (fills slide)
mkDark((id,gk)=>{return gTb(id,'What does this\nmean to you\nand your team?',E(1.0),E(1.0),E(9),E(5.8),6600,'l',gk);},'bg1.jpg','dusk');

// 40. Discussion + context
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Discussion\nQuestion Here',E(0.8),E(1.2),E(9),E(3.0),5400,'l',gk);
  s+=dLine(id++,E(0.6),E(4.5),E(7),C.dusk);
  s+=tb(id++,'Think about your experience\nand share with the group',E(0.6),E(4.8),E(8),E(1.0),1800,C.lgray,'l',FR);
  return s;},'bg2.jpg','plum');

// 41. Quiz MC
mkDark((id)=>{let s='';
  s+=tb(id++,'Quiz question text goes here?',E(0.6),E(0.5),E(9),E(1.2),3200,WHT,'l',FR);
  s+=dLine(id++,E(0.6),E(1.8),E(8),C.sand);
  ['A)  Answer option one','B)  Answer option two','C)  Answer option three  \u2713','D)  Answer option four'].forEach((a,i)=>{
    const clr=i===2?C.sage:C.lgray;const f=i===2?FM:FR;
    s+=tb(id++,a,E(0.8),E(2.2+i*0.9),E(9),E(0.7),2000,clr,'l',f);
  });
  s+=tb(id++,'Explanation text',E(0.8),E(5.8),E(9),E(0.4),1500,C.terra,'l',FL);
  return s;},'bg3.jpg');

// 42. Quiz TF
mkDark((id)=>{let s='';
  s+=tb(id++,'True or False: Statement here',E(0.6),E(0.5),E(9),E(1.5),3200,WHT,'l',FR);
  s+=dLine(id++,E(0.6),E(2.2),E(8),C.sand);
  s+=tb(id++,'A)  True  \u2713',E(0.8),E(3.0),E(9),E(0.6),2400,C.sage,'l',FM);
  s+=tb(id++,'B)  False',E(0.8),E(3.9),E(9),E(0.6),2400,C.lgray,'l',FR);
  s+=tb(id++,'Explanation',E(0.8),E(4.8),E(9),E(0.4),1500,C.terra,'l',FL);
  return s;},'bg4.jpg');

// 43. Activity Prompt
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Activity instruction\nthat tells the group\nwhat to do',E(0.6),E(1.0),E(9),E(3.5),4400,'l',gk);
  s+=tb(id++,'10 minutes',E(0.6),E(5.0),E(3),E(0.5),2200,WHT,'l',FM);
  s+=tb(id++,'Hint or guidance for facilitator',E(0.6),E(5.8),E(9),E(0.4),1500,C.lgray,'l',FL);
  return s;},'bg5.jpg','copper');

// 44. Scenario Card
mkDark((id)=>{let s='';
  s+=tb(id++,'Scenario 1',E(0.6),E(0.3),E(3.5),E(0.6),3200,C.terra,'l',FM);
  s+=tb(id++,'Scenario Title',E(4.2),E(0.4),E(7),E(0.5),2000,C.lgray,'l',FR);
  s+=dLine(id++,E(0.6),E(1.1),E(12),C.terra);
  s+=tb(id++,'Situation',E(0.6),E(1.4),E(2),E(0.4),1600,C.terra,'l',FM);
  s+=tb(id++,'Customer scenario description.',E(0.6),E(1.9),E(11.5),E(1.8),1600,C.lgray,'l',FR);
  s+=dLine(id++,E(0.6),E(3.9),E(12),C.terra);
  s+=tb(id++,'Discussion Questions',E(0.6),E(4.2),E(4),E(0.4),1600,C.terra,'l',FM);
  s+=tb(id++,'1.  First question?\n2.  Second question?\n3.  Third question?',E(0.8),E(4.7),E(11),E(1.8),1600,C.lgray,'l',FR);
  return s;},'bg6.jpg');

// 45. Key Takeaway
mkDark((id,gk)=>{let s='';
  s+=tb(id++,'Key Takeaway',E(0.6),E(0.5),E(4),E(0.5),3200,C.terra,'l',FM);
  s+=gTb(id++,'The main insight the\naudience should remember',E(0.6),E(1.5),E(9),E(2.5),4400,'l',gk);
  s+=dLine(id++,E(0.6),E(4.5),E(8),C.terra);
  s+=tb(id++,'\u2022  Supporting point one\n\u2022  Supporting point two',E(0.8),E(4.8),E(9),E(1.5),1600,C.lgray,'l',FR);
  return s;},'bg7.jpg','sage');

// 46. Reflection
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Think about\nyour experience.\n\nWhat would you\ndo differently?',E(1.0),E(0.8),E(9),E(5.8),4800,'l',gk);
  s+=dLine(id++,E(0.6),E(6.5),E(6),C.plum);
  s+=tb(id++,'Take a moment to reflect',E(0.6),E(6.7),E(6),E(0.3),1400,C.mgray,'l',FL);
  return s;},'bg8.jpg','plum');

// 47-52: Learning/Activity slides (white)

// 47. Pair Activity
mkLight(id=>{let s='';
  s+=tb(id++,'Pair Activity',E(0.6),E(0.5),E(5),E(0.7),4800,C.teal,'l',FM);
  s+=dLine(id++,E(0.6),E(1.4),E(12),C.teal);
  s+=tb(id++,'Work in pairs to complete\nthe following task.',E(0.6),E(1.8),E(10),E(1.5),2000,C.dgray,'l',FR);
  s+=tb(id++,'5 minutes',E(0.6),E(3.8),E(3),E(0.5),2200,C.teal,'l',FM);
  s+=tb(id++,'Instructions or materials',E(0.6),E(4.8),E(10),E(1.5),1600,C.mgray,'l',FL);
  return s;});

// 48. Group Exercise
mkLight(id=>{let s='';
  s+=tb(id++,'Group Exercise',E(0.6),E(0.5),E(6),E(0.7),4800,C.plum,'l',FM);
  s+=dLine(id++,E(0.6),E(1.4),E(12),C.plum);
  s+=tb(id++,'In your groups, work\nthrough the following.',E(0.6),E(1.8),E(7),E(1.5),2000,C.dgray,'l',FR);
  s+=tb(id++,'15 minutes',E(0.6),E(3.8),E(3),E(0.5),2200,C.plum,'l',FM);
  s+=rImg(id++,'rId3',E(7.2),E(1.5),E(5.5),E(3.5));
  return s;});

// 49. Role Play
mkLight(id=>{let s='';
  s+=tb(id++,'Role Play',E(0.6),E(0.5),E(4),E(0.7),4800,C.copper,'l',FM);
  s+=tb(id++,'Practice scenario',E(4.5),E(0.6),E(5),E(0.5),2000,C.mgray,'l',FR);
  s+=dLine(id++,E(0.6),E(1.4),E(12),C.copper);
  s+=tb(id++,'Person A',E(0.6),E(1.8),E(5.5),E(0.5),2000,C.copper,'l',FM);
  s+=tb(id++,'Role description for A',E(0.6),E(2.5),E(5.5),E(2.0),1600,C.ogray,'l',FR);
  s+=vLine(id++,E(6.3),E(1.8),E(4),C.copper);
  s+=tb(id++,'Person B',E(6.8),E(1.8),E(5.5),E(0.5),2000,C.copper,'l',FM);
  s+=tb(id++,'Role description for B',E(6.8),E(2.5),E(5.5),E(2.0),1600,C.ogray,'l',FR);
  s+=tb(id++,'10 minutes per round',E(0.6),E(6.0),E(4),E(0.4),1800,C.copper,'l',FM);
  return s;});

// 50. Knowledge Check
mkLight(id=>{let s='';
  s+=tb(id++,'Knowledge Check',E(0.6),E(0.5),E(6),E(0.7),4800,C.dusk,'l',FM);
  s+=dLine(id++,E(0.6),E(1.4),E(12),C.dusk);
  s+=tb(id++,'Rate your confidence:',E(0.6),E(1.8),E(10),E(0.5),2000,C.dgray,'l',FR);
  ['Topic 1','Topic 2','Topic 3','Topic 4'].forEach((t,i)=>{const y=E(2.6+i*0.9);
    s+=tb(id++,t,E(0.6),y,E(5),E(0.4),1800,C.ogray,'l',FR);
    s+=tb(id++,'\u2B24  \u2B24  \u2B24  \u2B24  \u2B24',E(7.5),y,E(4),E(0.4),1500,C.dusk,'l',FR);
  });
  s+=tb(id++,'1 = Low    5 = High',E(0.6),E(6.3),E(10),E(0.3),1300,C.mgray,'l',FL);
  return s;});

// 51. Quick Poll
mkLight(id=>{let s='';
  s+=tb(id++,'Quick Poll',E(0.6),E(0.5),E(5),E(0.7),4800,C.sage,'l',FM);
  s+=dLine(id++,E(0.6),E(1.4),E(12),C.sage);
  s+=tb(id++,'Polling question here?',E(0.6),E(2.0),E(10),E(1.0),3200,BLK,'l',FR);
  ['Option A','Option B','Option C'].forEach((o,i)=>{
    s+=rRect(id++,E(0.6),E(3.5+i*1.0),E(8),E(0.7),C.sage,20000);
    s+=tb(id++,o,E(1.0),E(3.55+i*1.0),E(7),E(0.6),1800,C.dgray,'l',FR);
  });
  return s;});

// 52. Case Study
mkLight(id=>{let s='';
  s+=tb(id++,'Case Study',E(0.6),E(0.4),E(4),E(0.6),4000,C.rose,'l',FM);
  s+=tb(id++,'Case Title',E(4.5),E(0.5),E(7),E(0.5),2200,C.dgray,'l',FR);
  s+=dLine(id++,E(0.6),E(1.2),E(12),C.rose);
  s+=tb(id++,'Background',E(0.6),E(1.5),E(2),E(0.4),1600,C.rose,'l',FM);
  s+=tb(id++,'Case study detail.',E(0.6),E(2.0),E(7),E(2.0),1600,C.ogray,'l',FR);
  s+=rImg(id++,'rId3',E(7.8),E(1.5),E(4.8),E(2.8));
  s+=dLine(id++,E(0.6),E(4.3),E(12),C.rose);
  s+=tb(id++,'Questions',E(0.6),E(4.6),E(4),E(0.4),1600,C.rose,'l',FM);
  s+=tb(id++,'1.  Key issues?\n2.  Your recommendation?\n3.  What are the risks?',E(0.6),E(5.1),E(11),E(1.8),1600,C.ogray,'l',FR);
  return s;});

// --- CLOSING (53-60) ---

// 53. Contacts
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Key Reminders &\nContacts',E(0.6),E(0.3),E(7),E(1.5),4400,'l',gk);
  s+=dLine(id++,E(0.6),E(2.0),E(12),C.sand);
  [0,1,2].forEach(i=>{
    s+=tb(id++,'email@company.com',E(0.6),E(2.3+i*0.8),E(4.5),E(0.4),1800,WHT,'l',FM);
    s+=tb(id++,'Contact description',E(5.5),E(2.3+i*0.8),E(6),E(0.4),1500,C.lgray,'l',FR);
  });
  s+=dLine(id++,E(0.6),E(4.8),E(12),C.sand);
  s+=tb(id++,'Golden Rules',E(0.6),E(5.1),E(4),E(0.5),2000,WHT,'l',FM);
  s+=tb(id++,'\u2713  Rule one\n\u2713  Rule two\n\u2713  Rule three',E(0.6),E(5.7),E(10),E(1.2),1600,C.lgray,'l',FR);
  return s;},'bg9.jpg','sand');

// 54. Next Steps
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Next Steps',E(0.6),E(0.3),E(7),E(1.0),4400,'l',gk);
  s+=dLine(id++,E(0.6),E(1.5),E(12),C.teal);
  [0,1,2,3].forEach(i=>{const y=E(1.8+i*1.2);
    s+=tb(id++,String(i+1).padStart(2,'0'),E(0.6),y,E(1),E(0.8),4400,C.lav,'l',FH);
    s+=tb(id++,'Action item here',E(2.0),y+E(0.1),E(10),E(0.7),1800,C.lgray,'l',FR);
  });
  s+=tb(id++,'For questions, contact the team',E(0.6),E(6.5),E(10),E(0.3),1400,C.mgray,'l',FL);
  return s;},'bg10.jpg','teal');

// 55. Q&A
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Q&A',E(1.5),E(1.8),E(10),E(3.0),12000,'l',gk);
  s+=dLine(id++,E(1),E(4.8),E(7),C.sand);
  s+=tb(id++,'Thank you for participating',E(1),E(5.2),E(11),E(0.5),2000,C.lgray,'l',FR);
  return s;},'bg11.jpg','gold');

// 56. Thank You
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Thank You',E(1.0),E(2.8),E(8),E(2.0),6700,'l',gk);
  s+=tb(id++,'Closing message',E(0.6),E(5.0),E(8),E(0.5),1800,C.lgray,'l',FR);
  return s;},'bg12.jpg','copper');

// 57. Appendix
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'Supporting\nMaterials',E(0.6),E(0.3),E(7),E(1.5),4800,'l',gk);
  s+=tb(id++,'Appendix A: Title\nAppendix B: Title\nAppendix C: Title\nAppendix D: Title',E(0.6),E(2.5),E(10),E(4.0),1800,C.lgray,'l',FR);
  return s;},'bg13.jpg','dusk');

// 58. Blank Dark
mkDark((id)=>{return tb(id,'Custom content slide',E(0.6),E(3.0),E(8),E(1.0),2200,C.mgray,'ctr',FL);},'bg14.jpg');

// 59. Blank White
mkLight(id=>{return tb(id,'Custom content slide',E(0.6),E(3.0),E(8),E(1.0),2200,C.mgray,'ctr',FL);});

// 60. End Card
mkDark((id,gk)=>{return gTb(id,'End',E(1.5),E(2.8),E(10),E(2.5),9600,'ctr',gk);},'bg1.jpg','gold');

// --- EXTRA VARIANTS (61-65) ---

// 61. Learning Objectives Checklist (white)
mkLight(id=>{let s='';
  s+=tb(id++,'Learning Objectives',E(0.6),E(0.5),E(8),E(0.7),4800,C.slate,'l',FM);
  s+=tb(id++,'By the end, you will be able to:',E(0.6),E(1.3),E(10),E(0.4),1800,C.mgray,'l',FL);
  s+=dLine(id++,E(0.6),E(1.8),E(12),C.slate);
  [1,2,3,4].forEach(i=>{const y=E(2.0+(i-1)*1.1);
    s+=tb(id++,'\u2610',E(0.6),y,E(0.5),E(0.6),2400,C.slate,'l',FR);
    s+=tb(id++,'Objective '+i+' description',E(1.3),y+E(0.05),E(10),E(0.7),1800,C.dgray,'l',FR);
  });
  return s;});

// 62. Recap (dark)
mkDark((id,gk)=>{let s='';
  s+=gTb(id++,'What have we\ncovered today?',E(0.6),E(0.8),E(9),E(3.0),5400,'l',gk);
  s+=tb(id++,'\u2022  Topic 1\n\u2022  Topic 2\n\u2022  Topic 3',E(0.6),E(4.5),E(8),E(2.0),2000,C.lgray,'l',FR);
  return s;},'bg2.jpg','sage');

// 63. Feedback (white)
mkLight(id=>{let s='';
  s+=tb(id++,'Session Feedback',E(0.6),E(0.5),E(6),E(0.7),4800,C.sand,'l',FM);
  s+=dLine(id++,E(0.6),E(1.4),E(12),C.sand);
  s+=tb(id++,'We value your feedback.',E(0.6),E(1.8),E(10),E(0.6),2000,C.dgray,'l',FR);
  s+=tb(id++,'1.  What worked well?\n2.  What could improve?\n3.  What else to learn?',E(0.6),E(2.8),E(10),E(2.5),2000,C.ogray,'l',FR);
  return s;});

// 64. Action Planning (white)
mkLight(id=>{let s='';
  s+=tb(id++,'Action Planning',E(0.6),E(0.5),E(6),E(0.7),4800,C.teal,'l',FM);
  s+=dLine(id++,E(0.6),E(1.4),E(12),C.teal);
  s+=tb(id++,'Based on today, write down:',E(0.6),E(1.8),E(10),E(0.5),1800,C.dgray,'l',FR);
  [['START',C.sage],['STOP',C.rose],['CONTINUE',C.teal]].forEach((item,i)=>{const y=E(2.6+i*1.5);
    s+=rRect(id++,E(0.5),y,E(12),E(1.2),item[1],12000);
    s+=tb(id++,item[0],E(1.0),y+E(0.15),E(10),E(0.7),2000,item[1],'l',FM);
  });
  return s;});

// 65. Centered Statement (dark) — alt gradient
mkDark((id,gk)=>{return gTb(id,'A centered statement\nthat commands\nattention',E(1.5),E(1.8),E(10),E(4.5),6000,'ctr',gk);},'bg3.jpg','rose');

console.log(`Built ${slides.length} slides (SI=${SI})`);

// ===================== ASSEMBLE =====================
const zip=await JSZip.loadAsync(fs.readFileSync(path.join(__dirname,'master_sword_template.pptx')));
Object.keys(zip.files).filter(f=>f.match(/^ppt\/(slides|notesSlides|media)\//)).forEach(f=>zip.remove(f));

const gDir=path.join(__dirname,'gallery');
for(let i=1;i<=14;i++){const p=path.join(gDir,`bg${i}.jpg`);if(fs.existsSync(p))zip.file(`ppt/media/bg${i}.jpg`,fs.readFileSync(p));}
['bg3.jpg','bg7.jpg','bg10.jpg'].forEach((f,i)=>{const p=path.join(gDir,f);if(fs.existsSync(p))zip.file(`ppt/media/roundimg${i+1}.jpg`,fs.readFileSync(p));});

slides.forEach((sl,i)=>{
  const n=i+1;
  zip.file(`ppt/slides/slide${n}.xml`,sl.xml);
  let rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout2.xml"/>`;
  if(!sl.light) rels+=`<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${imgs[i]}"/>`;
  if(sl.xml.includes('rId3')) rels+=`<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/roundimg1.jpg"/>`;
  if(sl.xml.includes('rId4')) rels+=`<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/roundimg2.jpg"/>`;
  rels+=`</Relationships>`;
  zip.file(`ppt/slides/_rels/slide${n}.xml.rels`,rels);
});

const sIds=slides.map((_,i)=>`<p:sldId id="${256+i}" r:id="rId${100+i}"/>`).join('');
zip.file('ppt/presentation.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" saveSubsetFonts="1"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:notesMasterIdLst><p:notesMasterId r:id="rId2"/></p:notesMasterIdLst><p:sldIdLst>${sIds}</p:sldIdLst><p:sldSz cx="${W}" cy="${H}"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle><a:defPPr><a:defRPr lang="en-US"/></a:defPPr></p:defaultTextStyle></p:presentation>`);

let pR=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="notesMasters/notesMaster1.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/><Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/>`;
slides.forEach((_,i)=>{pR+=`<Relationship Id="rId${100+i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i+1}.xml"/>`;});
pR+=`</Relationships>`;zip.file('ppt/_rels/presentation.xml.rels',pR);

let ct=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="jpg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/><Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/><Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>`;
for(let i=1;i<=11;i++)if(zip.files[`ppt/slideLayouts/slideLayout${i}.xml`])ct+=`<Override PartName="/ppt/slideLayouts/slideLayout${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>`;
for(let i=1;i<=2;i++)if(zip.files[`ppt/theme/theme${i}.xml`])ct+=`<Override PartName="/ppt/theme/theme${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>`;
slides.forEach((_,i)=>{ct+=`<Override PartName="/ppt/slides/slide${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;});
ct+=`</Types>`;zip.file('[Content_Types].xml',ct);

const out='C:\\Users\\pgillett\\OneDrive - Tesla\\Desktop\\new test 123.pptx';
const buf=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:6}});
fs.writeFileSync(out,buf);
console.log(`SUCCESS: ${out}\nSize: ${(buf.length/1024/1024).toFixed(2)} MB | Slides: ${slides.length}`);
})().catch(e=>console.error('ERROR:',e));
