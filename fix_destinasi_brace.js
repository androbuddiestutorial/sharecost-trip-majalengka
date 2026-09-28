const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/destinasi/page.tsx', 'utf-8');
content = content.replace(/<\/Card>\n\s*\)\)/, '<\/Card>\n          )}');
fs.writeFileSync('src/app/(public)/destinasi/page.tsx', content);
