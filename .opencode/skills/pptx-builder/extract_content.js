// Extract text content and styling from PPTX files
const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');

async function extractPptx(filePath, label) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`EXTRACTING: ${label}`);
  console.log(`File: ${filePath}`);
  console.log(`${'='.repeat(80)}\n`);

  const data = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(data);

  // List all files in the zip
  const fileList = Object.keys(zip.files);
  console.log('--- Files in archive ---');
  fileList.forEach(f => console.log(f));

  // Extract theme info
  const themeFiles = fileList.filter(f => f.startsWith('ppt/theme/'));
  for (const tf of themeFiles) {
    const content = await zip.files[tf].async('text');
    console.log(`\n--- Theme: ${tf} ---`);
    // Extract font info
    const fontMatches = content.match(/<a:(majorFont|minorFont)[^>]*>[\s\S]*?<\/a:\1>/g);
    if (fontMatches) {
      fontMatches.forEach(m => console.log(m));
    }
    // Extract color scheme
    const colorMatches = content.match(/<a:clrScheme[^>]*>[\s\S]*?<\/a:clrScheme>/g);
    if (colorMatches) {
      colorMatches.forEach(m => console.log(m));
    }
  }

  // Extract slide master info
  const masterFiles = fileList.filter(f => f.startsWith('ppt/slideMasters/'));
  for (const mf of masterFiles) {
    const content = await zip.files[mf].async('text');
    console.log(`\n--- Slide Master: ${mf} (first 2000 chars) ---`);
    console.log(content.substring(0, 2000));
  }

  // Extract slide layout info
  const layoutFiles = fileList.filter(f => f.startsWith('ppt/slideLayouts/'));
  console.log(`\n--- Slide Layouts (${layoutFiles.length} found) ---`);
  for (const lf of layoutFiles.slice(0, 3)) {
    const content = await zip.files[lf].async('text');
    // Get layout name
    const nameMatch = content.match(/type="([^"]+)"/);
    console.log(`${lf}: type=${nameMatch ? nameMatch[1] : 'unknown'}`);
  }

  // Extract slide content
  const slideFiles = fileList.filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/)).sort((a, b) => {
    const numA = parseInt(a.match(/slide(\d+)/)[1]);
    const numB = parseInt(b.match(/slide(\d+)/)[1]);
    return numA - numB;
  });

  console.log(`\n--- Slides (${slideFiles.length} total) ---`);

  for (const sf of slideFiles) {
    const content = await zip.files[sf].async('text');
    const slideNum = sf.match(/slide(\d+)/)[1];

    console.log(`\n--- Slide ${slideNum} ---`);

    // Extract all text runs
    const textParts = [];
    // Match <a:t> tags for text
    const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g);
    if (textMatches) {
      textMatches.forEach(m => {
        const text = m.replace(/<\/?a:t>/g, '');
        if (text.trim()) textParts.push(text);
      });
    }

    // Extract font info from runs
    const fontInfos = [];
    const rPrMatches = content.match(/<a:rPr[^>]*>/g);
    if (rPrMatches) {
      rPrMatches.forEach(m => {
        const szMatch = m.match(/sz="(\d+)"/);
        const bMatch = m.match(/\bb="1"/);
        fontInfos.push({
          size: szMatch ? parseInt(szMatch[1]) / 100 : null,
          bold: !!bMatch
        });
      });
    }

    // Extract colors used
    const srgbMatches = content.match(/<a:srgbClr val="([A-Fa-f0-9]{6})"/g);
    const colors = new Set();
    if (srgbMatches) {
      srgbMatches.forEach(m => {
        const val = m.match(/val="([^"]+)"/)[1];
        colors.add(val);
      });
    }

    // Check for images
    const imageRefs = content.match(/<a:blip[^>]*r:embed="([^"]+)"/g);

    console.log('Text content:');
    textParts.forEach(t => console.log(`  "${t}"`));
    if (fontInfos.length > 0) {
      const uniqueSizes = [...new Set(fontInfos.filter(f => f.size).map(f => f.size))];
      console.log(`Font sizes used: ${uniqueSizes.join(', ')} pt`);
    }
    if (colors.size > 0) {
      console.log(`Colors used: ${[...colors].join(', ')}`);
    }
    if (imageRefs) {
      console.log(`Images: ${imageRefs.length} image(s) on this slide`);
    }

    // Look for background fills
    const bgMatch = content.match(/<p:bg>[\s\S]*?<\/p:bg>/);
    if (bgMatch) {
      console.log('Has background fill: Yes');
    }

    // Extract notes if any
    const noteFile = `ppt/notesSlides/notesSlide${slideNum}.xml`;
    if (zip.files[noteFile]) {
      const noteContent = await zip.files[noteFile].async('text');
      const noteTexts = noteContent.match(/<a:t>([^<]*)<\/a:t>/g);
      if (noteTexts) {
        const notes = noteTexts.map(m => m.replace(/<\/?a:t>/g, '')).filter(t => t.trim() && !t.match(/^\d+$/));
        if (notes.length > 0) {
          console.log('Speaker Notes:');
          notes.forEach(n => console.log(`  ${n}`));
        }
      }
    }
  }

  // Extract presentation.xml for slide size
  if (zip.files['ppt/presentation.xml']) {
    const presContent = await zip.files['ppt/presentation.xml'].async('text');
    const sizeMatch = presContent.match(/<p:sldSz[^>]*\/>/);
    if (sizeMatch) {
      console.log(`\nSlide size: ${sizeMatch[0]}`);
    }
  }

  // List images
  const imageFiles = fileList.filter(f => f.startsWith('ppt/media/'));
  if (imageFiles.length > 0) {
    console.log(`\n--- Media files (${imageFiles.length}) ---`);
    for (const img of imageFiles) {
      const imgData = await zip.files[img].async('nodebuffer');
      console.log(`${img} - ${(imgData.length / 1024).toFixed(1)} KB`);
    }
  }
}

async function main() {
  const file1 = 'C:\\Users\\pgillett\\OneDrive - Tesla\\Desktop\\Customer Connect.pptx';
  const file2 = 'C:\\Users\\pgillett\\OneDrive - Tesla\\Desktop\\14 Day Return and Buyback Process VILT.pptx';

  await extractPptx(file1, 'CUSTOMER CONNECT (Style Reference)');
  await extractPptx(file2, '14 DAY RETURN AND BUYBACK (Content Source)');
}

main().catch(err => console.error('Error:', err));
