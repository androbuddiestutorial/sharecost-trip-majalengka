const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/destinasi/page.tsx', 'utf-8');
const search = "          </Card>\r\n          ))}\r\n        </div>";
const repl = "          </Card>\n          )}\n        </div>";
content = content.replace(search, repl);
const search2 = "          </Card>\n          ))}\n        </div>";
content = content.replace(search2, repl);
fs.writeFileSync('src/app/(public)/destinasi/page.tsx', content);
