import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = 'e:/menswear-react/public';

const pngFiles = [
  { src: path.join(publicDir, 'logo.png'), dest: path.join(publicDir, 'logo.webp') },
  { src: path.join(publicDir, 'logo-original-backup.png'), dest: path.join(publicDir, 'logo-original-backup.webp') },
  { src: path.join(publicDir, 'images/luxury-model.png'), dest: path.join(publicDir, 'images/luxury-model.webp') },
  { src: path.join(publicDir, 'images/satin-bg.png'), dest: path.join(publicDir, 'images/satin-bg.webp') }
];

async function convert() {
  for (const file of pngFiles) {
    if (fs.existsSync(file.src)) {
      console.log(`Converting ${file.src} to WebP...`);
      try {
        await sharp(file.src)
          .webp({ quality: 85 })
          .toFile(file.dest);
        
        const origStats = fs.statSync(file.src);
        const webpStats = fs.statSync(file.dest);
        console.log(`Converted successfully! Saved: ${(origStats.size - webpStats.size) / 1024} KB`);
      } catch (err) {
        console.error(`Failed to convert ${file.src}:`, err);
      }
    } else {
      console.warn(`File not found: ${file.src}`);
    }
  }
}

convert().catch(console.error);
