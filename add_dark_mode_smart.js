const fs = require('fs');
const path = require('path');

const mappings = {
  'bg-white': 'dark:bg-slate-900',
  'bg-slate-50': 'dark:bg-slate-800',
  'bg-slate-100': 'dark:bg-slate-800',
  'bg-brand-50': 'dark:bg-slate-800',
  'bg-surface-secondary': 'dark:bg-slate-950',
  
  'text-slate-900': 'dark:text-slate-100',
  'text-slate-800': 'dark:text-slate-200',
  'text-slate-700': 'dark:text-slate-300',
  'text-slate-600': 'dark:text-slate-400',
  'text-slate-500': 'dark:text-slate-400',
  'text-slate-400': 'dark:text-slate-500',
  
  'border-slate-100': 'dark:border-slate-800',
  'border-slate-200': 'dark:border-slate-700',
  'border-slate-50': 'dark:border-slate-800/50',
  
  'hover:bg-slate-50': 'dark:hover:bg-slate-800',
  'hover:text-slate-900': 'dark:hover:text-white',
  'hover:text-slate-600': 'dark:hover:text-slate-300'
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // We look for className="..." or `...` and replace utilities inside them
      const classNameRegex = /className=["']([^"']+)["']|className=\{`([^`]+)`\}/g;
      
      let modifiedContent = content.replace(classNameRegex, (match, p1, p2) => {
        let isTemplate = false;
        let classStr = p1 !== undefined ? p1 : p2;
        if (p2 !== undefined) isTemplate = true;
        
        let classes = classStr.split(/\s+/);
        let newClasses = [...classes];
        
        for (const [lightClass, darkClass] of Object.entries(mappings)) {
          // Check if this utility literally exists in the classes array
          if (classes.includes(lightClass)) {
            // Ensure we don't already have a dark variant for this specific property
            // e.g., if lightClass is bg-white, the darkClass is dark:bg-slate-900.
            // Check if any class starts with the same prefix as darkClass (e.g. 'dark:bg-')
            const prefix = darkClass.split('-')[0] + '-' + darkClass.split('-')[1]; // dark:bg
            const prefix2 = darkClass.substring(0, darkClass.lastIndexOf('-')); // dark:bg-slate
            
            const hasDarkVariant = classes.some(c => c.startsWith('dark:') && 
              // Check if it's applying to the same property (e.g., bg, text, border)
              c.split(':')[1].split('-')[0] === lightClass.split('-')[0]
            );
            
            if (!hasDarkVariant && !newClasses.includes(darkClass)) {
              newClasses.push(darkClass);
            }
          }
        }
        
        const newClassStr = newClasses.join(' ');
        if (p1 !== undefined) {
          return `className="${newClassStr}"`;
        } else {
          return `className={\`${newClassStr}\`}`;
        }
      });
      
      if (modifiedContent !== content) {
        fs.writeFileSync(fullPath, modifiedContent, 'utf8');
        console.log(`Updated safely: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
console.log('Safe mapping completed.');
