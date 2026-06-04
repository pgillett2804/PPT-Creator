const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');
(async()=>{

function X(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');}
const E = (i) => Math.round(i * 914400);

// ===================== BACKGROUND LAYERS =====================
// Two overlay styles:
// A) Left gradient (CC original) — for slides with left-heavy text
// B) Full dark overlay — for slides with centered/spread text

const BG_BLACK = (id) => `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="Bg"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12192000" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
const BG_IMG = (id, rId, alpha) => `<p:pic><p:nvPicPr><p:cNvPr id="${id}" name="I"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rId}"><a:alphaModFix amt="${alpha}"/></a:blip><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12192000" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;
const LEFT_GRAD = (id) => `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="G"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="7208521" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:gradFill><a:gsLst><a:gs pos="32000"><a:srgbClr val="000000"><a:alpha val="67000"/></a:srgbClr></a:gs><a:gs pos="100000"><a:srgbClr val="000000"><a:alpha val="0"/></a:srgbClr></a:gs></a:gsLst><a:lin ang="7108"/></a:gradFill><a:ln w="12700"><a:miter lim="400000"/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
// Full-width bottom gradient (dark at bottom, clear at top) — allows centered text
const BOTTOM_GRAD = (id) => `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="G"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12192000" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:gradFill><a:gsLst><a:gs pos="0"><a:srgbClr val="000000"><a:alpha val="30000"/></a:srgbClr></a:gs><a:gs pos="50000"><a:srgbClr val="000000"><a:alpha val="55000"/></a:srgbClr></a:gs><a:gs pos="100000"><a:srgbClr val="000000"><a:alpha val="75000"/></a:srgbClr></a:gs></a:gsLst><a:lin ang="5400000"/></a:gradFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
const ACCENT_BAR = (id) => `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="B"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm rot="5400000"><a:off x="9093067" y="3374761"/><a:ext cx="5416098" cy="108478"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val 50000"/></a:avLst></a:prstGeom><a:gradFill flip="none" rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="D4D4D4"><a:alpha val="50000"/></a:srgbClr></a:gs><a:gs pos="68000"><a:schemeClr val="accent6"><a:alpha val="90000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect l="100000" t="100000"/></a:path><a:tileRect r="-100000" b="-100000"/></a:gradFill><a:ln w="12700"><a:noFill/><a:miter lim="400000"/></a:ln><a:effectLst><a:outerShdw blurRad="50800" dist="38100" dir="2700000" algn="tl" rotWithShape="0"><a:prstClr val="black"><a:alpha val="20000"/></a:prstClr></a:outerShdw></a:effectLst></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;

function bgLeft(startId, rId, alpha) {
  let s='',id=startId; s+=BG_BLACK(id++); s+=BG_IMG(id++,rId,alpha||30000); s+=LEFT_GRAD(id++); s+=ACCENT_BAR(id++); return{xml:s,nextId:id};
}
function bgCenter(startId, rId, alpha) {
  let s='',id=startId; s+=BG_BLACK(id++); s+=BG_IMG(id++,rId,alpha||30000); s+=BOTTOM_GRAD(id++); s+=ACCENT_BAR(id++); return{xml:s,nextId:id};
}

// ===================== TEXT ELEMENTS =====================
const RADIAL = `<a:gradFill flip="none" rotWithShape="1"><a:gsLst><a:gs pos="85000"><a:srgbClr val="B26D15"/></a:gs><a:gs pos="20000"><a:schemeClr val="bg1"><a:alpha val="45000"/></a:schemeClr></a:gs></a:gsLst><a:path path="circle"><a:fillToRect r="100000" b="100000"/></a:path><a:tileRect l="-100000" t="-100000"/></a:gradFill>`;
const LINEAR = `<a:gradFill flip="none" rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="FFFFFF"><a:alpha val="45000"/></a:srgbClr></a:gs><a:gs pos="78000"><a:srgbClr val="B26D15"/></a:gs></a:gsLst><a:lin ang="0" scaled="0"/></a:gradFill>`;

function tb(id,text,x,y,cx,cy,sz,color,algn,bold,italic,font){
  const b=bold?' b="1"':'';const it=italic?' i="1"':'';const f=font||'Universal Sans Text';const al=algn||'l';
  const lines=X(text).split('\n');
  const paras=lines.map(l=>`<a:p><a:pPr algn="${al}"/><a:r><a:rPr lang="en-GB" sz="${sz}"${b}${it} dirty="0"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="${f}"/></a:rPr><a:t>${l}</a:t></a:r></a:p>`).join('');
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="T"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="50800" tIns="25400" rIns="50800" bIns="25400"><a:normAutofit/></a:bodyPr><a:lstStyle/>${paras}</p:txBody></p:sp>`;
}

function gradTb(id,text,x,y,cx,cy,sz,algn,radial){
  const fill=radial!==false?RADIAL:LINEAR;const al=algn||'l';
  const lines=X(text).split('\n');
  const paras=lines.map(l=>`<a:p><a:pPr algn="${al}"/><a:r><a:rPr lang="en-GB" sz="${sz}" dirty="0">${fill}<a:latin typeface="Universal Sans Display 430"/></a:rPr><a:t>${l}</a:t></a:r></a:p>`).join('');
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="GT"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="50800" tIns="25400" rIns="50800" bIns="25400"><a:spAutoFit/></a:bodyPr><a:lstStyle/>${paras}</p:txBody></p:sp>`;
}

// Horizontal divider line
function divLine(id,x,y,cx){
  return `<p:sp><p:nvSpPr><p:cNvPr id="${id}" name="L"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="12700"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="D8AA6E"><a:alpha val="40000"/></a:srgbClr></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
}

// Icon card
function iconCard(startId,emoji,label,cx,cy){
  const rW=1223889,rH=1400000;
  const rx=cx-rW/2,ry=cy;
  const lx=cx-1300000,ly=cy+rH+100000;
  let id=startId,xml='';
  // Rounded rect with gold gradient AND emoji text inside
  xml+=`<p:sp><p:nvSpPr><p:cNvPr id="${id++}" name="Card"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${Math.round(rx)}" y="${Math.round(ry)}"/><a:ext cx="${rW}" cy="${rH}"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst/></a:prstGeom><a:gradFill><a:gsLst><a:gs pos="20000"><a:srgbClr val="B26D15"/></a:gs><a:gs pos="85000"><a:schemeClr val="bg1"><a:lumMod val="95000"/><a:alpha val="70000"/></a:schemeClr></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr rtlCol="0" anchor="ctr"/><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="en-GB" sz="4800"><a:solidFill><a:schemeClr val="bg1"/></a:solidFill></a:rPr><a:t>${emoji}</a:t></a:r></a:p></p:txBody></p:sp>`;
  // Label text below
  xml+=`<p:sp><p:nvSpPr><p:cNvPr id="${id++}" name="Lbl"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${Math.round(lx)}" y="${Math.round(ly)}"/><a:ext cx="2600000" cy="600000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square" lIns="50800" tIns="25400" rIns="50800" bIns="25400"><a:spAutoFit/></a:bodyPr><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="en-GB" sz="1600"><a:solidFill><a:schemeClr val="bg1"/></a:solidFill><a:latin typeface="Universal Sans Display 430"/></a:rPr><a:t>${X(label)}</a:t></a:r></a:p></p:txBody></p:sp>`;
  return{xml,nextId:id};
}

function wrap(shapes){return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:schemeClr val="tx1"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>${shapes}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>`;}

function notesXml(t){const p=X(t).split('\n').map(l=>`<a:p><a:r><a:rPr lang="en-GB" dirty="0"/><a:t>${l}</a:t></a:r></a:p>`).join('');return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:notes xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:sp><p:nvSpPr><p:cNvPr id="2" name="SI"/><p:cNvSpPr><a:spLocks noGrp="1" noRot="1" noChangeAspect="1"/></p:cNvSpPr><p:nvPr><p:ph type="sldImg"/></p:nvPr></p:nvSpPr><p:spPr/></p:sp><p:sp><p:nvSpPr><p:cNvPr id="3" name="N"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr><p:spPr/><p:txBody><a:bodyPr/><a:lstStyle/>${p}</p:txBody></p:sp></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:notes>`;}

// ===================== LOAD TEMPLATE =====================
console.log('Loading template...');
const zip = await JSZip.loadAsync(fs.readFileSync('C:\\Users\\pgillett\\OneDrive - Tesla\\Desktop\\Customer Connect.pptx'));
Object.keys(zip.files).filter(f => f.match(/^ppt\/(slides|notesSlides|media)\//)).forEach(f => zip.remove(f));

// Add background images
const ccImg = 'C:\\Users\\pgillett\\AppData\\Local\\Temp\\opencode\\cc_images\\';
const imgMap = { 'bg1.jpeg':'image3.jpeg','bg2.jpeg':'image4.jpeg','bg3.jpeg':'image6.jpeg','bg4.jpeg':'image8.jpeg','bg5.jpeg':'image11.jpeg','bg6.jpeg':'image13.jpeg','bg7.jpeg':'image17.jpeg','bg8.jpeg':'image23.jpeg' };
for (const [dst,src] of Object.entries(imgMap)) { const p=path.join(ccImg,src); if(fs.existsSync(p)) zip.file(`ppt/media/${dst}`,fs.readFileSync(p)); }

// Add icons
const omIcons = 'C:\\Users\\pgillett\\AppData\\Local\\Temp\\opencode\\om_icons\\';
['image6.png','image8.png','image10.png','image12.png','image14.png','image16.png','image18.png'].forEach((n,i)=>{ const p=path.join(omIcons,n); if(fs.existsSync(p)) zip.file(`ppt/media/icon${i+1}.png`,fs.readFileSync(p)); });

// ===================== BUILD SLIDES =====================
const slides = [];

// S1: Title — centered, full-width gradient bg, large text middle of slide
function s1(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'14-Day Returns &\nBuyback Policy',E(1.5),E(1.2),E(12),E(3.0),6600,'ctr',true);
  s+=divLine(id++,E(4.5),E(4.8),E(4.5));
  s+=tb(id++,'Compliance Training','ctr' ? E(1.5):0,E(5.1),E(12),E(0.6),2400,'D8AA6E','ctr',false,false,'Universal Sans Display 430');
  s+=tb(id++,'EMEA  |  Instructor-Led Virtual Training',E(1.5),E(5.8),E(12),E(0.5),2000,'D4D4D4','ctr');
  return{xml:wrap(s),notes:"By the end of today's session, you should feel confident with four key skills: identifying B2C vs B2B, applying eligibility criteria, distinguishing Return vs Buyback, and following the escalation process."};
}
slides.push(s1());

// S2: Agenda — two columns, numbered items spread across slide
function s2(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'Agenda',E(0.8),E(0.4),E(5),E(1.0),4400,'l',true);
  s+=divLine(id++,E(0.8),E(1.6),E(11.5));
  // Left column
  s+=tb(id++,'01',E(0.8),E(2.0),E(1.0),E(0.8),4400,'D8AA6E','l',true,false,'Universal Sans Display 430');
  s+=tb(id++,'14-Day Order Cancellation Process',E(2.0),E(2.0),E(4.5),E(0.8),2200,'FFFFFF','l');
  s+=tb(id++,'02',E(0.8),E(3.0),E(1.0),E(0.8),4400,'D8AA6E','l',true,false,'Universal Sans Display 430');
  s+=tb(id++,'Buyback & Returns Policy',E(2.0),E(3.0),E(4.5),E(0.8),2200,'FFFFFF','l');
  s+=tb(id++,'03',E(0.8),E(4.0),E(1.0),E(0.8),4400,'D8AA6E','l',true,false,'Universal Sans Display 430');
  s+=tb(id++,'The Legal Dictionary',E(2.0),E(4.0),E(4.5),E(0.8),2200,'FFFFFF','l');
  // Right column
  s+=tb(id++,'04',E(7.0),E(2.0),E(1.0),E(0.8),4400,'D8AA6E','l',true,false,'Universal Sans Display 430');
  s+=tb(id++,'Customer Scenarios',E(8.2),E(2.0),E(4.5),E(0.8),2200,'FFFFFF','l');
  s+=tb(id++,'05',E(7.0),E(3.0),E(1.0),E(0.8),4400,'D8AA6E','l',true,false,'Universal Sans Display 430');
  s+=tb(id++,'Key Takeaways & Common Pitfalls',E(8.2),E(3.0),E(4.5),E(0.8),2200,'FFFFFF','l');
  s+=tb(id++,'06',E(7.0),E(4.0),E(1.0),E(0.8),4400,'D8AA6E','l',true,false,'Universal Sans Display 430');
  s+=tb(id++,'Q&A',E(8.2),E(4.0),E(4.5),E(0.8),2200,'FFFFFF','l');
  return{xml:wrap(s),notes:"This session covers the full 14-day returns and buyback policy."};
}
slides.push(s2());

// S3: Objectives — 4 icon cards spread across full width
function s3(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'Learning Objectives',E(0.5),E(0.4),E(12),E(1.5),6600,'ctr',true);
  s+=tb(id++,'By the end of this session, you will be able to:',E(1),E(2.0),E(11),E(0.5),2000,'E2B48D','ctr',false,true);
  const cards=[
    {l:'Identify B2C\nvs B2B',e:'\u{1F465}'},
    {l:'Apply eligibility\ncriteria',e:'\u{2705}'},
    {l:'Return vs\nBuyback',e:'\u{1F504}'},
    {l:'Escalation\nprocess',e:'\u{1F4CB}'},
  ];
  const positions=[E(2.0),E(5.0),E(8.0),E(11.0)];
  cards.forEach((c,i)=>{const ic=iconCard(id,c.e,c.l,positions[i],E(3.0));s+=ic.xml;id=ic.nextId;});
  return{xml:wrap(s),notes:"By the end you will correctly handle 14-day returns and buyback requests."};
}
slides.push(s3());

// S4: Section divider — big centered statement
function sectionDiv(title,subtitle,notes){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,title,E(1),E(2.0),E(11),E(2.5),6600,'ctr',true);
  if(subtitle) s+=tb(id++,subtitle,E(1),E(4.8),E(11),E(0.6),2400,'D4D4D4','ctr',false,true);
  return{xml:wrap(s),notes:notes||''};
}
slides.push(sectionDiv('14-Day Order\nCancellation Process','Understanding the legal framework',''));

// S5: Why 14-Day Right — centered title, two info blocks side by side
function s5(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'Why the 14-Day\nRight Exists',E(0.4),E(0.3),E(12),E(2.2),5400,'ctr',true);
  s+=divLine(id++,E(3),E(2.6),E(7));
  // Left block — big label, small body
  s+=gradTb(id++,'EU Consumer Contracts\nRegulations 2013',E(0.8),E(3.0),E(5.2),E(1.0),2400,'l',false);
  s+=tb(id++,'\u2022  Covers distance & off-premises contracts\n\u2022  Right to cancel within 14 days\n\u2022  No reason required',E(0.8),E(4.2),E(5.2),E(1.5),1500,'D4D4D4','l');
  // Right block
  s+=gradTb(id++,'Consumer Rights\nAct 2015',E(7),E(3.0),E(5.2),E(1.0),2400,'l',false);
  s+=tb(id++,'\u2022  Covers goods and services quality\n\u2022  Short-Term Right to Reject (30 days)\n\u2022  Requires a fault or defect',E(7),E(4.2),E(5.2),E(1.5),1500,'D4D4D4','l');
  // Bottom callout
  s+=tb(id++,'If a defect exists \u2192 Short-Term Right to Reject, not cooling-off period',E(1.5),E(6.0),E(10),E(0.5),1600,'E2B48D','ctr',true);
  return{xml:wrap(s),notes:"This right comes from the EU Consumer Contracts Regulations 2013 and Consumer Rights Act 2015."};
}
slides.push(s5());

// S6: Cooling-Off vs Short-Term — split with centered headers
function s6(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'Cooling-Off Period\nvs Short-Term Right to Reject',E(0.3),E(0.15),E(12.5),E(1.3),3600,'ctr',true);
  s+=divLine(id++,E(0.8),E(1.5),E(11.5));
  // Left — big header, small details
  s+=gradTb(id++,'14-Day\nCooling-Off',E(0.8),E(1.8),E(5),E(1.2),3200,'l',true);
  s+=tb(id++,'Consumer Contracts Regulations 2013',E(0.8),E(3.1),E(5),E(0.3),1200,'D4D4D4','l',false,true);
  s+=tb(id++,'\u2022  "Buyer\'s remorse" \u2014 no fault required\n\u2022  Cancel without giving a reason\n\u2022  14 days from delivery date',E(0.8),E(3.6),E(5),E(2.0),1500,'FFFFFF','l');
  // Vertical divider
  s+=`<p:sp><p:nvSpPr><p:cNvPr id="${id++}" name="Div"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${E(6.4)}" y="${E(1.8)}"/><a:ext cx="12700" cy="${E(4.0)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="D8AA6E"><a:alpha val="30000"/></a:srgbClr></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
  // Right — big header, small details
  s+=gradTb(id++,'Short-Term\nRight to Reject',E(7),E(1.8),E(5.5),E(1.2),3200,'l',true);
  s+=tb(id++,'Consumer Rights Act 2015',E(7),E(3.1),E(5.5),E(0.3),1200,'D4D4D4','l',false,true);
  s+=tb(id++,'\u2022  30 days from delivery\n\u2022  Requires a fault or defect\n\u2022  Escalate to Customer Resolutions',E(7),E(3.6),E(5.5),E(2.0),1500,'FFFFFF','l');
  // Bottom
  s+=tb(id++,'UK: defective vehicles \u2192 Customer Resolutions, not 14-day cooling-off',E(1.5),E(6.2),E(10),E(0.5),1400,'E2B48D','ctr',true);
  return{xml:wrap(s),notes:"The 14-day cooling-off is a buyer's remorse right. Defective vehicles use the Short-Term Right to Reject."};
}
slides.push(s6());

// S7: Who Qualifies — green/red split
function s7(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'Who Qualifies?',E(0.3),E(0.2),E(12.5),E(1.0),5400,'ctr',true);
  s+=divLine(id++,E(0.8),E(1.3),E(11.5));
  // B2C — big label
  s+=tb(id++,'B2C',E(1.2),E(1.8),E(4),E(1.0),5400,'6BCB77','l',true,false,'Universal Sans Display 430');
  s+=tb(id++,'Consumer',E(3.8),E(2.0),E(3),E(0.6),2000,'6BCB77','l',false,false,'Universal Sans Display 430');
  s+=tb(id++,'\u2022  Paid personally\n\u2022  Customer name & address on invoice\n\u2022  No company details\n\u2022  14-day right applies',E(1.2),E(3.0),E(4.5),E(2.5),1500,'D4D4D4','l');
  // Vertical divider
  s+=`<p:sp><p:nvSpPr><p:cNvPr id="${id++}" name="Div"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${E(6.4)}" y="${E(1.5)}"/><a:ext cx="12700" cy="${E(4.5)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="D8AA6E"><a:alpha val="30000"/></a:srgbClr></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
  // B2B — big label
  s+=tb(id++,'B2B',E(7.2),E(1.8),E(4),E(1.0),5400,'E8665D','l',true,false,'Universal Sans Display 430');
  s+=tb(id++,'Business',E(9.8),E(2.0),E(3),E(0.6),2000,'E8665D','l',false,false,'Universal Sans Display 430');
  s+=tb(id++,'\u2022  Paid through a business\n\u2022  Purchased via leasing/finance\n\u2022  Return must go through\n   the finance provider',E(7.2),E(3.0),E(4.8),E(2.5),1500,'D4D4D4','l');
  return{xml:wrap(s),notes:"For B2C customers the 14-day right applies. B2B must go through the finance provider."};
}
slides.push(s7());

// S8: How to Check — steps with big numbers spread across
function s8(){
  const b=bgLeft(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'How to Check\nB2C vs B2B',E(0.5),E(0.2),E(7),E(1.8),5400,'l',true);
  // Three steps — BIG keyword left, small description right (One Motion slide 8 style)
  s+=gradTb(id++,'Invoice',E(0.5),E(2.3),E(4),E(0.9),4400,'l',true);
  s+=tb(id++,'Check the final invoice on the\ncustomer\'s profile in DRO',E(4.8),E(2.4),E(5),E(0.8),1500,'D4D4D4','l');

  s+=gradTb(id++,'Sold To',E(0.5),E(3.6),E(4),E(0.9),4400,'l',true);
  s+=tb(id++,'Look at the "sold to" field\non the invoice',E(4.8),E(3.7),E(5),E(0.8),1500,'D4D4D4','l');

  s+=gradTb(id++,'Limited',E(0.5),E(4.9),E(4),E(0.9),4400,'l',true);
  s+=tb(id++,'If it contains "Limited"\n\u2192 customer is B2B',E(4.8),E(5.0),E(5),E(0.8),1500,'D4D4D4','l');

  s+=tb(id++,'B2B = no 14-day cancellation right',E(0.5),E(6.2),E(8),E(0.5),1600,'E2B48D','l',true);
  return{xml:wrap(s),notes:"Check the final invoice in DRO. Look at 'sold to' field."};
}
slides.push(s8());

// S9: Key Eligibility — 3 icon cards
function s9(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'Key Eligibility Criteria',E(0.5),E(0.4),E(12),E(1.5),6600,'ctr',true);
  const cards=[
    {l:'Legal owner\nof the vehicle',e:'\u{1F511}'},
    {l:'Within 14 days\nof delivery',e:'\u{1F4C5}'},
    {l:'Must be B2C\ncustomer',e:'\u{1F464}'},
  ];
  [E(3.0),E(6.7),E(10.3)].forEach((cx,i)=>{const ic=iconCard(id,cards[i].e,cards[i].l,cx,E(2.8));s+=ic.xml;id=ic.nextId;});
  return{xml:wrap(s),notes:"Customer must be legal owner, within 14 days, and B2C."};
}
slides.push(s9());

// S10: Financed Vehicles — split
function s10(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'Financed Vehicles',E(0.3),E(0.2),E(12.5),E(1.0),5400,'ctr',true);
  s+=divLine(id++,E(0.8),E(1.3),E(11.5));
  // TFS — big label
  s+=tb(id++,'TFS',E(1.2),E(1.8),E(3),E(1.0),5400,'6BCB77','l',true,false,'Universal Sans Display 430');
  s+=tb(id++,'Internal',E(3.5),E(2.0),E(3),E(0.6),2000,'6BCB77','l',false,false,'Universal Sans Display 430');
  s+=tb(id++,'\u2022  TFS remains legal owner\n\u2022  Handled internally\n\u2022  Follow standard 14-day process',E(1.2),E(3.0),E(4.5),E(2.0),1500,'D4D4D4','l');
  // Divider
  s+=`<p:sp><p:nvSpPr><p:cNvPr id="${id++}" name="D"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${E(6.4)}" y="${E(1.5)}"/><a:ext cx="12700" cy="${E(4.5)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="D8AA6E"><a:alpha val="30000"/></a:srgbClr></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
  // Third party — big label
  s+=tb(id++,'3rd Party',E(7.2),E(1.8),E(5),E(1.0),4400,'E8665D','l',true,false,'Universal Sans Display 430');
  s+=tb(id++,'\u2022  Finance company is legal owner\n\u2022  Customer cannot exercise right directly\n\u2022  Must go through finance company',E(7.2),E(3.0),E(5),E(2.0),1500,'D4D4D4','l');
  s+=tb(id++,'Request pay-off figures ASAP \u2014 common source of delays in the UK',E(1.5),E(6.2),E(10),E(0.5),1400,'E2B48D','ctr',false,true);
  return{xml:wrap(s),notes:"TFS = internal. Third-party = must go through finance company."};
}
slides.push(s10());

// S11: Key Timelines — big "14" centered with timeline below
function s11(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'14',E(0.5),E(0.2),E(12),E(2.5),16000,'ctr',true);
  s+=tb(id++,'days',E(0.5),E(2.8),E(12),E(0.6),4400,'D8AA6E','ctr',false,false,'Universal Sans Display 430');
  s+=divLine(id++,E(3),E(3.5),E(7));
  // Timeline entries spread across
  s+=tb(id++,'Day 1',E(0.8),E(3.9),E(2.5),E(0.4),2400,'D8AA6E','r',true,false,'Universal Sans Display 430');
  s+=tb(id++,'Day after vehicle delivery',E(3.5),E(3.9),E(6),E(0.4),2200,'FFFFFF','l');
  s+=tb(id++,'Before Day 14',E(0.8),E(4.6),E(2.5),E(0.4),2400,'D8AA6E','r',true,false,'Universal Sans Display 430');
  s+=tb(id++,'Customer must notify Tesla',E(3.5),E(4.6),E(6),E(0.4),2200,'FFFFFF','l');
  s+=tb(id++,'14 days after notify',E(0.8),E(5.3),E(2.5),E(0.4),2400,'D8AA6E','r',true,false,'Universal Sans Display 430');
  s+=tb(id++,'Vehicle must be returned',E(3.5),E(5.3),E(6),E(0.4),2200,'FFFFFF','l');
  s+=tb(id++,'14 days after return',E(0.8),E(6.0),E(2.5),E(0.4),2400,'D8AA6E','r',true,false,'Universal Sans Display 430');
  s+=tb(id++,'Refund to original payor',E(3.5),E(6.0),E(6),E(0.4),2200,'FFFFFF','l');
  return{xml:wrap(s),notes:"Day 1 = delivery. Before Day 14 = notify. 14 days to return. 14 days to refund."};
}
slides.push(s11());

// S12: How to Process — 6 steps, 2 columns of 3
function s12(){
  const b=bgLeft(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'How to Process a\n14-Day Return',E(0.5),E(0.3),E(7),E(1.5),3800,'l',true);
  const steps=[
    '1.  Customer notifies Tesla\n     (Stream, Outlook, in-person)',
    '2.  Sales/Delivery creates\n     Goodwill case',
    '3.  Line Manager confirms\n     eligibility',
    '4.  Schedule drop-off +\n     signed Intake Form',
    '5.  Upload all documents\n     to AMP/CMT',
    '6.  Order Ops \u2192 AMP case\n     Finance Ops \u2192 refund'
  ];
  steps.forEach((st,i)=>{
    const col=i%2,row=Math.floor(i/2);
    const x=col===0?E(0.5):E(6.0);
    const y=E(2.2)+row*E(1.7);
    s+=tb(id++,st,x,y,E(5.5),E(1.4),2000,'FFFFFF','l',false,false);
  });
  return{xml:wrap(s),notes:"6 steps: notify, Goodwill case, eligibility, drop-off, upload, AMP/refund."};
}
slides.push(s12());

// S13: Important Rules — 4 icon cards across
function s13(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'Important Rules\n& Reminders',E(0.5),E(0.3),E(12),E(1.8),5400,'ctr',true);
  const cards=[
    {l:'Refund to\noriginal payor',e:'\u{1F4B3}'},
    {l:'Retain Tesla\napp access',e:'\u{1F4F1}'},
    {l:'Order Ops\napproval needed',e:'\u{1F91D}'},
    {l:'All documents\nrequired',e:'\u{1F4C4}'},
  ];
  [E(2.0),E(5.0),E(8.0),E(11.0)].forEach((cx,i)=>{const ic=iconCard(id,cards[i].e,cards[i].l,cx,E(2.8));s+=ic.xml;id=ic.nextId;});
  return{xml:wrap(s),notes:"Always refund to original payor. Customer must keep Tesla app access."};
}
slides.push(s13());

// S14-20: Quiz section
slides.push(sectionDiv('Quiz\n14-Day Returns','6 Questions',''));

function quiz(q,ans,ci,expl){
  const b=bgLeft(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,q,E(0.5),E(0.3),E(8.5),E(2.0),3200,'l',false);
  ans.forEach((a,i)=>{
    const ok=i===ci;
    s+=tb(id++,`${String.fromCharCode(65+i)})  ${a}${ok?' \u2713':''}`,E(0.8),E(2.5+i*0.75),E(8),E(0.6),2200,ok?'6BCB77':'D4D4D4','l',ok);
  });
  if(expl) s+=tb(id++,expl,E(0.8),E(2.5+ans.length*0.75+0.4),E(8),E(0.8),1400,'E2B48D','l',false,true);
  return{xml:wrap(s),notes:''};
}
slides.push(quiz('Q1. The 14-day cooling-off period is governed by which two pieces of legislation?',['Consumer Rights Act 2015 & Sale of Goods Act 1979','EU Consumer Contracts Regs 2013 & Consumer Rights Act 2015','EU Consumer Contracts Regs 2013 & Data Protection Act 2018','Consumer Rights Act 2015 & Competition Act 1998'],1,''));
slides.push(quiz('Q2. Customer says vehicle has a defect, wants 14-day return. What do you do?',['Process the return immediately','Decline entirely','Direct to Customer Resolutions for non-policy rejection','Escalate to Finance Ops'],2,''));
slides.push(quiz('Q3. Maximum time to return the vehicle after notifying Tesla?',['7 days','14 days','30 days'],1,'Must return within 14 days of cancellation notice.'));
slides.push(quiz('Q4. Who to contact first for 14-day eligibility?',['Order Operations','Customer Resolutions (ContactUK@tesla.com)','Finance Ops'],1,'Customer Resolutions are the correct team.'));
slides.push(quiz('Q5. Returned vehicle is damaged \u2014 what happens to repair costs?',['Tesla absorbs them','Deducted from the refund'],1,'Repair costs are deducted from the refund.'));
slides.push(quiz('Q6. True or False: Once returned, customer can still change their mind.',['True','False'],1,'Once returned, the process is final.'));

// S21: Section
slides.push(sectionDiv('Returns &\nBuyback','Understanding the critical distinctions',''));

// S22: Return vs Buyback — centered split
function s22(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'Return vs Buyback',E(0.3),E(0.2),E(12.5),E(1.0),5400,'ctr',true);
  s+=divLine(id++,E(0.8),E(1.3),E(11.5));
  // Return — big label
  s+=gradTb(id++,'Return',E(1.2),E(1.8),E(4.5),E(0.9),4400,'l',true);
  s+=tb(id++,'\u2022  Cancellation of original sale\n\u2022  Full refund (deductions apply)\n\u2022  Counts as -1 delivery\n\u2022  Reduces team targets',E(1.2),E(2.9),E(4.5),E(2.5),1500,'D4D4D4','l');
  // Divider
  s+=`<p:sp><p:nvSpPr><p:cNvPr id="${id++}" name="D"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${E(6.4)}" y="${E(1.5)}"/><a:ext cx="12700" cy="${E(4.5)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="D8AA6E"><a:alpha val="30000"/></a:srgbClr></a:solidFill><a:ln><a:noFill/></a:ln></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:endParaRPr lang="en-GB"/></a:p></p:txBody></p:sp>`;
  // Buyback — big label
  s+=gradTb(id++,'Buyback',E(7.2),E(1.8),E(5),E(0.9),4400,'l',true);
  s+=tb(id++,'\u2022  Tesla purchases at agreed price\n\u2022  New transaction\n\u2022  Delivery count unchanged\n\u2022  Invoice needed if business seller',E(7.2),E(2.9),E(5),E(2.5),1500,'D4D4D4','l');
  return{xml:wrap(s),notes:"A Return cancels the sale. A Buyback is a new transaction."};
}
slides.push(s22());

// S23: Commercial Impact — big "-1" centered
function s23(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  // "-1" with gradient red fill instead of flat red
  s+=`<p:sp><p:nvSpPr><p:cNvPr id="${id++}" name="Big"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${E(1)}" y="${E(0.5)}"/><a:ext cx="${E(11)}" cy="${E(3.0)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square"><a:spAutoFit/></a:bodyPr><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="en-GB" sz="16000" b="1" dirty="0"><a:gradFill flip="none" rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="FF6B6B"/></a:gs><a:gs pos="100000"><a:srgbClr val="8B0000"/></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill><a:latin typeface="Universal Sans Display 430"/></a:rPr><a:t>-1</a:t></a:r></a:p></p:txBody></p:sp>`;
  // "delivery" with gradient red
  s+=`<p:sp><p:nvSpPr><p:cNvPr id="${id++}" name="Del"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${E(1)}" y="${E(3.5)}"/><a:ext cx="${E(11)}" cy="${E(0.8)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square"><a:spAutoFit/></a:bodyPr><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="en-GB" sz="4400" dirty="0"><a:gradFill flip="none" rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="FF6B6B"/></a:gs><a:gs pos="100000"><a:srgbClr val="8B0000"/></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill><a:latin typeface="Universal Sans Display 430"/></a:rPr><a:t>delivery</a:t></a:r></a:p></p:txBody></p:sp>`;
  s+=divLine(id++,E(3.5),E(4.5),E(6));
  s+=tb(id++,'A Return directly reduces team and individual delivery targets\nand can negatively affect performance metrics and KPIs',E(1.5),E(4.8),E(10),E(1.0),1800,'D4D4D4','ctr');
  // Buyback line with gradient green
  s+=`<p:sp><p:nvSpPr><p:cNvPr id="${id++}" name="Buy"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="${E(1.5)}" y="${E(6.0)}"/><a:ext cx="${E(10)}" cy="${E(0.6)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr><p:txBody><a:bodyPr wrap="square"><a:spAutoFit/></a:bodyPr><a:lstStyle/><a:p><a:pPr algn="ctr"/><a:r><a:rPr lang="en-GB" sz="2000" b="1" dirty="0"><a:gradFill flip="none" rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="A8E6CF"/></a:gs><a:gs pos="100000"><a:srgbClr val="2E8B57"/></a:gs></a:gsLst><a:lin ang="0" scaled="0"/></a:gradFill><a:latin typeface="Universal Sans Display 430"/></a:rPr><a:t>A Buyback has no impact on delivery count</a:t></a:r></a:p></p:txBody></p:sp>`;
  return{xml:wrap(s),notes:"A Return counts as -1 delivery. A Buyback does not affect the count."};
}
slides.push(s23());

// S24-26: Policy, Limits, Process (Layout B with left gradient)
function contentLeft(title,lines,notes,tsz){
  const b=bgLeft(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,title,E(0.5),E(0.3),E(8),E(1.5),tsz||3800,'l',true);
  let y=E(2.2);
  lines.forEach(l=>{
    if(l.big){
      // Big text (sub-heading) — gradient title style
      s+=gradTb(id++,l.text,E(0.5),y,E(8.5),E(0.6),3200,'l',true);
      y+=E(0.65);
    } else if(l.accent){
      s+=tb(id++,l.text,E(0.5),y,E(8.5),E(0.55),2200,'E2B48D','l',l.bold,true);
      y+=E(0.55);
    } else if(l.step){
      // Combined number + text on one line
      s+=tb(id++,l.text,E(0.5),y,E(9),E(0.5),2200,'FFFFFF','l',false,false);
      y+=E(0.55);
    } else if(l.gap){
      y+=E(l.gap);
    } else {
      s+=tb(id++,l.text,E(0.5),y,E(8.5),E(0.5),2200,'FFFFFF','l',l.bold);
      y+=E(0.5);
    }
  });
  return{xml:wrap(s),notes:notes||''};
}

slides.push(contentLeft('Tesla Policy on\nNon-Defect Buybacks',[
  {accent:true,text:'Tesla does not buy back vehicles without a defect unless all other solutions have been exhausted',bold:true},
  {gap:0.3},
  {text:'Full EMEA Complaint & Escalation Process must be followed first'},
  {gap:0.3},
  {text:'Buybacks require triple approval:'},
  {gap:0.15},
  {step:true,text:'1.   Country Department Manager'},
  {step:true,text:'2.   Regional Department Leader'},
  {step:true,text:'3.   EMEA Business Resolutions Partner'},
],"Buybacks require exhausting all solutions and triple approval."));

slides.push(contentLeft('Approval Limits\nBased on Cost to Tesla',[
  {accent:true,text:'Approval determined by estimated total cost'},
  {gap:0.4},
  {big:true,text:'Return Cost'},
  {text:'= Refund Amount \u2212 Resale Valuation + Goodwill Costs'},
  {gap:0.4},
  {big:true,text:'Buyback Cost'},
  {text:'= Buyback Price \u2212 Trade-in Valuation + Goodwill Costs'},
],"Tesla bases sign-off on estimated cost to the business."));

slides.push(contentLeft('Buyback Process Flow\n(Early Ownership)',[
  {step:true,text:'1.   Return notification received'},
  {gap:0.15},
  {step:true,text:'2.   Confirm eligibility via Business Resolutions'},
  {gap:0.15},
  {step:true,text:'3.   Vehicle drop-off & document collection'},
  {gap:0.15},
  {step:true,text:'4.   Create CMT case'},
  {gap:0.15},
  {step:true,text:'5.   Upload documents'},
  {gap:0.15},
  {step:true,text:'6.   Process acquisition in AMP (leasereturns-EU)'},
],"Buyback flow: notification, BRES eligibility, drop-off, CMT, upload, AMP.",3800));

// S27-32: Buyback quiz
slides.push(sectionDiv('Quiz\nEMEA Buyback & Returns','5 Questions',''));
slides.push(quiz('Q1. Which option counts as -1 on the delivery count?',['Return','Buyback'],0,'A Return cancels and counts as -1.'));
slides.push(quiz('Q2. Who must approve a Buyback/Return?',['Sales Advisor only','Country Dept Manager + Regional Leader + EMEA BRES Partner'],1,'All three must agree.'));
slides.push(quiz('Q3. Vehicle delivered 5 months ago, 8,000 km \u2014 which process?',['Standard 14-day return','Early Ownership Process'],1,'Under 6 months + below 10,000 km = Early Ownership.'));
slides.push(quiz('Q4. Can settlement agreements be created locally without Legal?',['True','False'],1,'Must be approved by EMEA Business Resolution / Legal.'));
slides.push(quiz('Q5. Buyback from a business \u2014 what extra document?',['Proof of insurance','Invoice to confirm VAT/Margin status'],1,'Invoice required for VAT/Margin verification.'));

// S33: Scenarios section
slides.push(sectionDiv('Customer\nScenarios','Applying what you\'ve learned',"Encouraging discussion and application."));

// S34-36: Scenarios — using centered bg with situation and questions spread
function scenario(num,title,situation,questions,notes){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,`Scenario ${num}`,E(0.5),E(0.2),E(4),E(0.7),4400,'l',true);
  s+=tb(id++,title,E(4.5),E(0.3),E(8),E(0.7),2800,'D4D4D4','l',false,false,'Universal Sans Display 430');
  s+=divLine(id++,E(0.5),E(1.1),E(12));
  // Situation — wider, centered
  s+=tb(id++,'Situation',E(0.5),E(1.4),E(2),E(0.4),2000,'E2B48D','l',true,false,'Universal Sans Display 430');
  s+=tb(id++,situation,E(0.5),E(2.0),E(12),E(2.0),2200,'FFFFFF','l');
  // Questions — right-aligned block
  s+=tb(id++,'Discussion Questions',E(6.5),E(4.3),E(6),E(0.4),2000,'E2B48D','l',true,false,'Universal Sans Display 430');
  questions.forEach((q,i)=>{s+=tb(id++,`${i+1}.  ${q}`,E(6.5),E(4.8+i*0.6),E(6),E(0.5),2000,'FFFFFF','l');});
  return{xml:wrap(s),notes:notes||''};
}

slides.push(scenario(1,'B2C vs B2B Identification','A customer emails requesting a 14-day return. Their invoice shows the vehicle was sold to "Smith Holdings Limited". The customer says they paid personally using their own bank account.',['How should you qualify this customer?','What steps would you take next?','What would you say to the customer?'],'B2B due to "Limited". No 14-day right.'));
slides.push(scenario(2,'Defective Vehicle','A customer calls 10 days after delivery. They say the car has a software fault and they want to return it under the 14-day cooling-off period because "they\'ve changed their mind."',['Is this a valid 14-day return?','What is the correct process?','Who should handle this case?'],'Defect = not a 14-day return. Direct to Customer Resolutions.'));
slides.push(scenario(3,'Third-Party Finance','A customer wants to return their vehicle 8 days after delivery. The vehicle was financed through a third-party leasing company (not TFS). The leasing company told them to contact Tesla.',['Who is the legal owner?','Can they exercise 14-day right with Tesla?','What should the advisor do?'],'Finance company is legal owner. Must go through leasing company.'));

// S37: Consequences — icon cards
function s37(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'Consequences of\nNot Following Process',E(0.5),E(0.3),E(12),E(1.8),5400,'ctr',true);
  const cards=[{l:'Breach of\nSection 34',e:'\u{26A0}'},{l:'Small Claims\n& litigation',e:'\u{2696}'},{l:'CMA\ninvestigation',e:'\u{1F50D}'},{l:'Reputation\ndamage',e:'\u{1F4C9}'}];
  [E(2.0),E(5.0),E(8.0),E(11.0)].forEach((cx,i)=>{const ic=iconCard(id,cards[i].e,cards[i].l,cx,E(2.8));s+=ic.xml;id=ic.nextId;});
  return{xml:wrap(s),notes:"Failing to follow process can result in breach of Section 34."};
}
slides.push(s37());

// S38: Contacts — centered layout
function s38(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'Key Reminders &\nContact Details',E(0.5),E(0.2),E(12),E(1.2),3800,'ctr',true);
  s+=divLine(id++,E(1.5),E(1.6),E(10));
  // Contacts in a centered grid
  const contacts=[
    {email:'Leasereturns-EU@Tesla.com',desc:'Updates on pending CMT cases'},
    {email:'ContactUK@Tesla.com',desc:'14-day qualification checks (UK)'},
    {email:'ContactIreland@Tesla.com',desc:'14-day qualification checks (IE)'},
  ];
  contacts.forEach((c,i)=>{
    s+=tb(id++,c.email,E(1.5),E(2.0+i*1.0),E(5),E(0.4),2200,'D8AA6E','l',true);
    s+=tb(id++,c.desc,E(6.5),E(2.0+i*1.0),E(5.5),E(0.4),2000,'FFFFFF','l');
  });
  s+=divLine(id++,E(1.5),E(5.2),E(10));
  s+=tb(id++,'Golden Rules',E(1.5),E(5.5),E(10),E(0.5),2200,'D8AA6E','ctr',true,false,'Universal Sans Display 430');
  s+=tb(id++,'\u2713  Always verify B2C vs B2B first using the Final Invoice',E(2),E(5.9),E(9),E(0.4),2000,'FFFFFF','ctr');
  s+=tb(id++,'\u2713  Never promise a return or buyback without following process',E(2),E(6.2),E(9),E(0.4),2000,'FFFFFF','ctr');
  s+=tb(id++,'\u2713  Contact Customer Resolutions early if unsure',E(2),E(6.5),E(9),E(0.4),2000,'FFFFFF','ctr');
  return{xml:wrap(s),notes:"For CMT updates email leasereturns-EU. For qualification, contact Customer Resolutions."};
}
slides.push(s38());

// S39: Legal Dictionary — centered table-like layout
function s39(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'The Legal Dictionary',E(0.5),E(0.2),E(12),E(0.8),4400,'ctr',true);
  s+=tb(id++,'Litigious Terms \u2192 Neutral Synonyms',E(1),E(1.0),E(11),E(0.4),1600,'E2B48D','ctr',false,true);
  s+=divLine(id++,E(1.5),E(1.5),E(10));
  // Header
  s+=tb(id++,'AVOID',E(1.5),E(1.8),E(3),E(0.35),1800,'E8665D','ctr',true);
  s+=tb(id++,'USE INSTEAD',E(4.5),E(1.8),E(3),E(0.35),1800,'6BCB77','ctr',true);
  s+=tb(id++,'EXAMPLE PHRASE',E(7.5),E(1.8),E(4.5),E(0.35),1800,'D4D4D4','ctr',true);
  const terms=[
    {b:'Defect',g:'Condition',e:'"Can you describe the condition?"'},
    {b:'Unsatisfactory',g:'Concern',e:'"I understand you have a concern..."'},
    {b:'Fit for purpose',g:'Observation',e:'"Tell me about this observation..."'},
    {b:'Faulty',g:'Issue',e:'"I\'ve noted the issue you\'re describing"'},
    {b:'Unsafe',g:'Behaviour',e:'"Tell me about the behaviour observed"'},
    {b:'Broken',g:'Functionality',e:'"We\'ve logged a symptom regarding..."'},
    {b:'Malfunction',g:'Performance',e:'"Our team will review next steps"'},
    {b:'Poor quality',g:'Characteristic',e:'"Thank you for highlighting that"'},
  ];
  terms.forEach((t,i)=>{
    const y=E(2.3+i*0.58);
    s+=tb(id++,t.b,E(1.5),y,E(3),E(0.45),1800,'E8665D','ctr',true);
    s+=tb(id++,'\u2192  '+t.g,E(4.5),y,E(3),E(0.45),1800,'6BCB77','ctr');
    s+=tb(id++,t.e,E(7.5),y,E(4.5),E(0.45),1500,'D4D4D4','ctr',false,true);
  });
  return{xml:wrap(s),notes:"Words like 'defect' carry legal weight. Use neutral synonyms."};
}
slides.push(s39());

// S40: Q&A — big centered
function s40(){
  const b=bgCenter(2,'rId2',30000); let s=b.xml,id=b.nextId;
  s+=gradTb(id++,'Q&A',E(1),E(1.5),E(11),E(3.0),12000,'ctr',true);
  s+=divLine(id++,E(4),E(4.5),E(5));
  s+=tb(id++,'Thank you for your participation',E(1),E(4.8),E(11),E(0.6),2200,'D8AA6E','ctr',false,false,'Universal Sans Display 430');
  s+=tb(id++,'When in doubt, check with Customer Resolutions',E(1),E(5.6),E(11),E(0.5),1600,'D4D4D4','ctr',false,true);
  return{xml:wrap(s),notes:"Thank you. When in doubt, check with Customer Resolutions."};
}
slides.push(s40());

console.log(`Built ${slides.length} slides`);

// ===================== ASSEMBLE =====================
const bgCycle=['bg1.jpeg','bg2.jpeg','bg2.jpeg','bg3.jpeg','bg2.jpeg','bg2.jpeg','bg3.jpeg','bg3.jpeg','bg5.jpeg','bg5.jpeg','bg6.jpeg','bg6.jpeg','bg7.jpeg','bg4.jpeg','bg3.jpeg','bg3.jpeg','bg3.jpeg','bg3.jpeg','bg3.jpeg','bg3.jpeg','bg8.jpeg','bg7.jpeg','bg7.jpeg','bg8.jpeg','bg8.jpeg','bg6.jpeg','bg4.jpeg','bg3.jpeg','bg3.jpeg','bg3.jpeg','bg3.jpeg','bg3.jpeg','bg4.jpeg','bg6.jpeg','bg6.jpeg','bg6.jpeg','bg8.jpeg','bg5.jpeg','bg5.jpeg','bg1.jpeg'];

slides.forEach((s,i)=>{
  const n=i+1;
  zip.file(`ppt/slides/slide${n}.xml`,s.xml);
  let rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout7.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/${bgCycle[i]||'bg2.jpeg'}"/>`;
  if(s.notes){
    rels+=`<Relationship Id="rId10" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide${n}.xml"/>`;
    zip.file(`ppt/notesSlides/notesSlide${n}.xml`,notesXml(s.notes));
    zip.file(`ppt/notesSlides/_rels/notesSlide${n}.xml.rels`,`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="../slides/slide${n}.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="../notesMasters/notesMaster1.xml"/></Relationships>`);
  }
  rels+=`</Relationships>`;
  zip.file(`ppt/slides/_rels/slide${n}.xml.rels`,rels);
});

const sldIds=slides.map((_,i)=>`<p:sldId id="${256+i}" r:id="rId${100+i}"/>`).join('');
zip.file('ppt/presentation.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" saveSubsetFonts="1"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/><p:sldMasterId id="2147483660" r:id="rId2"/><p:sldMasterId id="2147483672" r:id="rId3"/><p:sldMasterId id="2147483704" r:id="rId4"/></p:sldMasterIdLst><p:notesMasterIdLst><p:notesMasterId r:id="rId5"/></p:notesMasterIdLst><p:sldIdLst>${sldIds}</p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle><a:defPPr><a:defRPr lang="en-US"/></a:defPPr></p:defaultTextStyle></p:presentation>`);

let pR=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">`;
for(let i=1;i<=4;i++) pR+=`<Relationship Id="rId${i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster${i}.xml"/>`;
pR+=`<Relationship Id="rId5" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="notesMasters/notesMaster1.xml"/><Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/><Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/><Relationship Id="rId8" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/>`;
slides.forEach((_,i)=>{pR+=`<Relationship Id="rId${100+i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i+1}.xml"/>`;});
pR+=`</Relationships>`;
zip.file('ppt/_rels/presentation.xml.rels',pR);

let ct=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/><Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/><Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/ppt/notesMasters/notesMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesMaster+xml"/>`;
for(let i=1;i<=4;i++) ct+=`<Override PartName="/ppt/slideMasters/slideMaster${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>`;
for(let i=1;i<=51;i++) if(zip.files[`ppt/slideLayouts/slideLayout${i}.xml`]) ct+=`<Override PartName="/ppt/slideLayouts/slideLayout${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>`;
for(let i=1;i<=5;i++) if(zip.files[`ppt/theme/theme${i}.xml`]) ct+=`<Override PartName="/ppt/theme/theme${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>`;
slides.forEach((s,i)=>{ct+=`<Override PartName="/ppt/slides/slide${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;if(s.notes) ct+=`<Override PartName="/ppt/notesSlides/notesSlide${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml"/>`;});
ct+=`</Types>`;
zip.file('[Content_Types].xml',ct);

const out='C:\\Users\\pgillett\\OneDrive - Tesla\\Desktop\\test 123.pptx';
const buf=await zip.generateAsync({type:'nodebuffer',compression:'DEFLATE',compressionOptions:{level:6}});
fs.writeFileSync(out,buf);
console.log(`SUCCESS: ${out}\nSize: ${(buf.length/1024/1024).toFixed(2)} MB | Slides: ${slides.length}`);
})().catch(e=>console.error('ERROR:',e));
