const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'frontend', 'src');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walkDir(directory);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Enhance extreme minimalism and futuristic styles based on DESIGN.md
  
  // 1. Convert text-on-surface-variant to darker, high-contrast, or subtle neon where appropriate
  content = content.replace(/text-on-surface-variant/g, 'text-gray-500');
  content = content.replace(/dark:text-dark-muted/g, 'dark:text-on-dark-muted');
  
  // 2. Adjust backgrounds to use extreme blacks and glass panels
  // Any hardcoded bg-gray-900 or bg-gray-800 goes to pure black or dark-card
  content = content.replace(/bg-gray-900/g, 'bg-dark-surface');
  content = content.replace(/bg-gray-800/g, 'bg-dark-card');
  content = content.replace(/dark:bg-gray-\d{3}/g, 'dark:bg-dark-card');
  
  // 3. Remove chunky borders and rely on sheer glass effect
  content = content.replace(/border-gray-700/g, 'border-white/5');
  content = content.replace(/border-gray-800/g, 'border-white/5');
  content = content.replace(/dark:border-dark-border/g, 'dark:border-white/5');
  content = content.replace(/border-gray-200/g, 'border-white/10');
  
  // 4. Boost glassmorphism in cards that might not be using .apple-card
  content = content.replace(/bg-white shadow-sm rounded-2xl/g, 'apple-card');
  content = content.replace(/bg-white dark:bg-dark-card rounded-2xl p-6/g, 'apple-card');
  content = content.replace(/bg-white\/95 dark:bg-dark-card\/95/g, 'bg-white/5 dark:bg-black/40 backdrop-blur-xl border border-white/10 dark:border-white/5');

  // 5. Update neon glows for gradients
  content = content.replace(/from-blue-600 to-indigo-600/g, 'from-indigo-500 via-purple-500 to-indigo-500');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated UI for ${path.basename(file)}`);
  }
});
console.log('Finished updating UI layers to minimalist futuristic design.');