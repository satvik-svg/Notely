const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-white': 'bg-card',
  'text-slate-900': 'text-foreground',
  'text-slate-800': 'text-card-foreground',
  'text-slate-700': 'text-foreground/90',
  'text-slate-600': 'text-muted-foreground',
  'text-slate-500': 'text-muted-foreground',
  'text-slate-400': 'text-muted-foreground/80',
  'border-slate-100': 'border-border',
  'border-slate-200': 'border-border',
  'bg-slate-50': 'bg-accent',
  'bg-slate-100': 'bg-secondary',
  'shadow-sm': 'shadow-sm dark:shadow-none',
  'shadow-md': 'shadow-md dark:shadow-none',
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace each class, ensuring it's matched as a whole word within quotes or backticks
  for (const [oldClass, newClass] of Object.entries(replacements)) {
    // Regex to match the class name with word boundaries, taking care of hyphens
    const regex = new RegExp(`(?<=[\\s"'\\\\\`])(${oldClass})(?=[\\s"'\\\\\`])`, 'g');
    content = content.replace(regex, newClass);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir('./src');
console.log('Done.');
