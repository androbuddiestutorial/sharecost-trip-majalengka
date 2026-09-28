const fs = require('fs');
let content = fs.readFileSync('src/app/admin/peserta/peserta-table.tsx', 'utf-8');

content = content.replace(
  '<TableCell colSpan={3} className="font-bold text-primary py-3 flex items-center justify-between">',
  '<TableCell colSpan={3} className="font-bold text-primary py-3"><div className="flex items-center justify-between">'
);
content = content.replace(
  '  </Badge>\n                        )}\n                      </TableCell>',
  '  </Badge>\n                        )}\n                      </div></TableCell>'
);

fs.writeFileSync('src/app/admin/peserta/peserta-table.tsx', content);
console.log('Fixed flex table cell');
