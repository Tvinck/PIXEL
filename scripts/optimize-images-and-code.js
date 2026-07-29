import sharp from 'sharp';
import fs from 'fs/promises';
import { join, extname, basename } from 'path';

const IMAGES_DIR = './public/images';
const CODE_FILE = './src/data/templates.js';

async function processImages(dir) {
  const files = await fs.readdir(dir);
  let convertedCount = 0;
  
  for (const file of files) {
    const filePath = join(dir, file);
    const fileStat = await fs.stat(filePath);
    
    if (fileStat.isDirectory()) {
      convertedCount += await processImages(filePath);
      continue;
    }
    
    const ext = extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
    
    const webpPath = filePath.replace(ext, '.webp');
    
    try {
      // Check if webp file already exists (to avoid duplicate processing, but overwrite if needed)
      // Convert to webp
      await sharp(filePath)
        .webp({ quality: 80 })
        .toFile(webpPath);
        
      // Delete original file
      await fs.unlink(filePath);
      
      console.log(`Optimized: ${file} -> webp (deleted original)`);
      convertedCount++;
    } catch (err) {
      console.error(`Failed to process ${file}:`, err.message);
    }
  }
  return convertedCount;
}

async function updateCodeReferences() {
  try {
    let content = await fs.readFile(CODE_FILE, 'utf8');
    
    // Replace `/images/name.jpeg` or `.jpg` or `.png` with `.webp`
    const regex = /(\/images\/[a-zA-Z0-9_\-\.]+)\.(jpeg|jpg|png)/g;
    
    const updatedContent = content.replace(regex, '$1.webp');
    
    if (content !== updatedContent) {
      await fs.writeFile(CODE_FILE, updatedContent, 'utf8');
      console.log(`Updated all image extension references in ${CODE_FILE} to .webp`);
    } else {
      console.log('No extension references needed updates in code.');
    }
  } catch (err) {
    console.error('Failed to update code references:', err.message);
  }
}

async function run() {
  console.log('🚀 Starting image optimization (converting to WebP + deleting originals)...');
  const count = await processImages(IMAGES_DIR);
  console.log(`🎉 Finished processing ${count} images!`);
  
  console.log('⚙️ Updating code references in templates.js...');
  await updateCodeReferences();
  console.log('✨ All done!');
}

run();
