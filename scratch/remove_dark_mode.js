const fs = require('fs');
const path = require('path');

const classesToRemove = [
  'dark:bg-slate-900',
  'dark:bg-slate-800',
  'dark:bg-slate-950',
  'dark:text-slate-100',
  'dark:text-slate-200',
  'dark:text-slate-300',
  'dark:text-slate-400',
  'dark:text-slate-500',
  'dark:border-slate-800',
  'dark:border-slate-700',
  'dark:border-slate-800/50',
  'dark:hover:bg-slate-800',
  'dark:hover:text-white',
  'dark:hover:text-slate-300'
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modifiedContent = content;

      // We look for className="..." or className={`...`} and replace utilities inside them
      const classNameRegex = /className=["']([^"']+)["']|className=\{`([^`]+)`\}/g;
      
      modifiedContent = modifiedContent.replace(classNameRegex, (match, p1, p2) => {
        let isTemplate = false;
        let classStr = p1 !== undefined ? p1 : p2;
        if (p2 !== undefined) isTemplate = true;
        
        let classes = classStr.split(/\s+/);
        let newClasses = classes.filter(c => !classesToRemove.includes(c));
        
        const newClassStr = newClasses.join(' ');
        if (p1 !== undefined) {
          return `className="${newClassStr}"`;
        } else {
          return `className={\`${newClassStr}\`}`;
        }
      });
      
      if (modifiedContent !== content) {
        fs.writeFileSync(fullPath, modifiedContent, 'utf8');
        console.log(`Cleaned safely: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, '..', 'src'));
console.log('Dark mode classes removed successfully.');
