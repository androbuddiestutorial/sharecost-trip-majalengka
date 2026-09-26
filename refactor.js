const fs = require('fs');
const path = require('path');

const basePath = "e:/PROJECT/APLIKASI/sharecosttrip majalengka";
const files = [
  "src/app/admin/bookings/actions.ts",
  "src/app/admin/destinasi/actions.ts",
  "src/app/admin/gallery/actions.ts",
  "src/app/admin/meeting-points/actions.ts",
  "src/app/admin/paket/actions.ts",
  "src/app/admin/payments/actions.ts",
  "src/app/admin/testimoni/actions.ts",
  "src/app/admin/trips/actions.ts"
];

for (const relPath of files) {
  const file = path.join(basePath, relPath);
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/import\s+{\s*createClient\s*}\s*from\s*["']@\/utils\/supabase\/server["'];/, 'import { assertAdmin } from "@/lib/auth";');
  
  const funcRegex = /export\s+async\s+function\s+(\w+)\s*\(([^)]*)\)\s*\{([\s\S]*?^\})/gm;
  
  content = content.replace(funcRegex, (match, funcName, args, body) => {
    let cleanBody = body.replace(/^\s*const\s+supabase\s*=\s*await\s+createClient\(\);\r?\n/m, '');
    cleanBody = cleanBody.replace(/\}$/, '');
    
    // We can try to indent everything by 2 spaces
    const indentedBody = cleanBody.split('\n').map(line => line.length > 0 ? '  ' + line : line).join('\n');
    
    return `export async function ${funcName}(${args}) {
  try {
    const { supabase } = await assertAdmin();
${indentedBody}  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}`;
  });
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${relPath}`);
}
