const fs = require('fs');
const path = require('path');

const replacements = {
  'border-slate-50': 'border-border',
  'bg-slate-50/50': 'bg-accent/50',
  'bg-slate-50': 'bg-accent',
  'hover:bg-slate-50': 'hover:bg-accent',
  'text-slate-300': 'text-muted-foreground',
  'bg-slate-300': 'bg-muted',
  'border-slate-300': 'border-border',
  'text-slate-400': 'text-muted-foreground/80',
  'placeholder:text-slate-400': 'placeholder:text-muted-foreground/80',
  'hover:border-slate-400': 'hover:border-border',
  'text-slate-600': 'text-muted-foreground',
  'hover:text-slate-600': 'hover:text-foreground/80',
  'hover:text-slate-700': 'hover:text-foreground/90',
  'bg-slate-800': 'bg-foreground',
  'bg-slate-900': 'bg-foreground',
  'text-slate-900': 'text-foreground',
  'hover:text-slate-900': 'hover:text-foreground',
  'hover:bg-slate-100': 'hover:bg-secondary',
  'hover:border-slate-200': 'hover:border-border',
  'from-slate-200': 'from-secondary',
  'to-slate-300': 'to-muted',
  'from-slate-300': 'from-muted',
  'to-slate-400': 'to-muted-foreground/50'
};

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We sort by length descending so that longer classes are replaced first (e.g. hover:text-slate-900 before text-slate-900)
  const sortedKeys = Object.keys(replacements).sort((a, b) => b.length - a.length);

  for (const oldClass of sortedKeys) {
    const newClass = replacements[oldClass];
    // Regex to match the class name with word boundaries
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
console.log('Done fix_more_colors.');
