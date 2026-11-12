import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'client/dist');
const destDir = path.join(__dirname, 'public');

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  if (fs.existsSync(srcDir)) {
    copyRecursive(srcDir, destDir);
    console.log('Successfully prepared public directory for Vercel');
  } else {
    console.error('Source directory client/dist not found');
    process.exit(1);
  }
} catch (err) {
  console.error('Error copying build output to public:', err);
  process.exit(1);
}

