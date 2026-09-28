const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/booking/page.tsx', 'utf-8');

// 1. Remove the global meeting_points fetch
content = content.replace(/fetch\('\/api\/meeting-points'\)\.then\(res => res\.json\(\)\)\.then\(data => \{\s*if\(data\.success\) setMeetingPoints\(data\.data\);\s*\}\);/g, '');

// 2. Parse trip meeting points
const parseScript = `
  const selectedTripObjForMp = trips.find(t => t.id === watchJadwalTrip);
  const tripMps = (() => {
    if (!selectedTripObjForMp?.meeting_points) return [];
    try {
      const arr = typeof selectedTripObjForMp.meeting_points === 'string' ? JSON.parse(selectedTripObjForMp.meeting_points) : selectedTripObjForMp.meeting_points;
      return Array.isArray(arr) ? arr : [];
    } catch { return []; }
  })();
`;

// Insert it right after the `const watchJenisTrip = watch("jenisTrip");` line
content = content.replace('const watchJenisTrip = watch("jenisTrip");', 'const watchJenisTrip = watch("jenisTrip");\n' + parseScript);

// 3. Update the dropdown rendering
content = content.replace(/\{meetingPoints\.map\(mp => \(/g, '{tripMps.map((mp: any, idx: number) => (');
content = content.replace(/<SelectItem key=\{mp\.id\} value=\{mp\.name\}>/g, '<SelectItem key={idx} value={mp.name}>');

// 4. Update the price calculation
const calcRegex = /const mpPrice = isLockedByUrl \? mpPriceFromUrl : \(Number\(meetingPoints\.find\(mp => mp\.name === watchMeetingPoint\)\?\.price\) \|\| 0\);/g;
content = content.replace(calcRegex, 'const mpPrice = isLockedByUrl ? mpPriceFromUrl : (Number(tripMps.find((mp: any) => mp.name === watchMeetingPoint)?.price) || 0);');

fs.writeFileSync('src/app/(public)/booking/page.tsx', content);
