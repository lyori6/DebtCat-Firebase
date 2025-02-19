import fs from 'fs';
import path from 'path';

const footerContent = fs.readFileSync('public/components/footer.html', 'utf8');
const cssLink = '<link href="/css/footer.css" rel="stylesheet" type="text/css">';

function updateFile(filePath) {
  if (filePath.includes('chat.html')) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Add footer CSS if not present
  if (!content.includes('footer.css')) {
    content = content.replace(
      '</head>',
      `  ${cssLink}\n</head>`
    );
  }

  // Replace old footer with new one
  content = content
    .replace(/<main class="footer">[\s\S]*?<\/main>/g, footerContent)
    .replace(/<footer class="footer">[\s\S]*?<\/footer>/g, footerContent);

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.html')) {
      updateFile(filePath);
    }
  });
}

// Start processing from public directory
processDirectory('public');
console.log('Footer update complete!');
