// Extract background images from Customer Connect for reuse
const fs = require('fs');
const JSZip = require('jszip');
const path = require('path');

async function extractImages() {
  const data = fs.readFileSync('C:\\Users\\pgillett\\OneDrive - Tesla\\Desktop\\Customer Connect.pptx');
  const zip = await JSZip.loadAsync(data);

  // Key images used across Customer Connect slides:
  // image3.jpeg - slide 1 title bg
  // image4.jpeg - slides 2-5 bg (most common content bg)
  // image6.jpeg - slides 7-8 bg
  // image8.jpeg - slide 10 bg
  const imagesToExtract = [
    'ppt/media/image3.jpeg',
    'ppt/media/image4.jpeg',
    'ppt/media/image6.jpeg',
    'ppt/media/image8.jpeg',
    'ppt/media/image11.jpeg',
    'ppt/media/image13.jpeg',
    'ppt/media/image17.jpeg',
    'ppt/media/image23.jpeg',
  ];

  const outDir = 'C:\\Users\\pgillett\\AppData\\Local\\Temp\\opencode\\cc_images';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const img of imagesToExtract) {
    if (zip.files[img]) {
      const buf = await zip.files[img].async('nodebuffer');
      const outFile = path.join(outDir, path.basename(img));
      fs.writeFileSync(outFile, buf);
      console.log(`Extracted ${img} -> ${outFile} (${(buf.length/1024).toFixed(1)} KB)`);
    } else {
      console.log(`NOT FOUND: ${img}`);
    }
  }
  console.log('Done extracting images.');
}

extractImages().catch(e => console.error(e));
