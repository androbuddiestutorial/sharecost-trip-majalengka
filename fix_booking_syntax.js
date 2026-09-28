const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/booking/page.tsx', 'utf-8');
const oldText = `                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Kontak Darurat */}`;
const newText = `                  </div>
                )}
                </>
                )}
              </div>
            )}

            {/* STEP 3: Kontak Darurat */}`;
content = content.replace(oldText, newText);
fs.writeFileSync('src/app/(public)/booking/page.tsx', content);
