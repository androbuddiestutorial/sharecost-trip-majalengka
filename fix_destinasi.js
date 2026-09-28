const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/destinasi/page.tsx', 'utf-8');

// 1. Update the query
content = content.replace(
  "await supabase.from('destinations').select('*')",
  "await supabase.from('destinations').select('*, trips(meeting_points)')"
);

// 3. inside the map:
const oldMapItem = /safeDestinations\.map\(\(dest\) => \{\s*return \(/;
const newMapItem = `safeDestinations.map((dest) => {
          let lowestPrice = Number(dest.price) || 0;
          if (dest.trips && dest.trips.length > 0) {
            let allPrices: number[] = [];
            dest.trips.forEach((trip: any) => {
              if (trip.meeting_points) {
                try {
                  const arr = typeof trip.meeting_points === 'string' ? JSON.parse(trip.meeting_points) : trip.meeting_points;
                  if (Array.isArray(arr)) {
                    arr.forEach((mp: any) => {
                      const p = Number(mp.price);
                      if (!isNaN(p) && p > 0) allPrices.push(p);
                    });
                  }
                } catch (e) {}
              }
            });
            if (allPrices.length > 0) {
              lowestPrice = Math.min(...allPrices);
            }
          }
          return (`;
content = content.replace(oldMapItem, newMapItem);

// 4. Update the display
content = content.replace(
  '<span className="font-bold text-primary">Rp {Number(dest.price).toLocaleString(\'id-ID\')}</span>',
  '<span className="font-bold text-primary">Rp {lowestPrice.toLocaleString(\'id-ID\')}</span>'
);

fs.writeFileSync('src/app/(public)/destinasi/page.tsx', content);
