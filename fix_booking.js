const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/booking/page.tsx', 'utf-8');
const regex = /if\s*\(mpParam\)\s*\{\s*setValue\('meetingPoint',\s*mpParam\);\s*setMpLocked\(true\);\s*\}/g;
content = content.replace(regex, 
`if (mpParam) {
        setValue('meetingPoint', mpParam);
        setMpLocked(true);
        const priceParam = params.get('mp_price');
        if (priceParam && !isNaN(Number(priceParam))) {
          setMpPriceFromUrl(Number(priceParam));
        }
      }`
);

// ALSO UPDATE PRICE CALCULATION SECTION
const calcRegex = /const selectedMpObj = meetingPoints\.find\(mp => mp\.name === watchMeetingPoint\);\s*const mpPrice = Number\(selectedMpObj\?\.price\) \|\| 0;/g;
content = content.replace(calcRegex, 
`const mpPrice = isLockedByUrl ? mpPriceFromUrl : (Number(meetingPoints.find(mp => mp.name === watchMeetingPoint)?.price) || 0);`
);

fs.writeFileSync('src/app/(public)/booking/page.tsx', content);
