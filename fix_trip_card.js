const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/trip/trip-card.tsx', 'utf-8');

const oldStr = 'const basePrice = Number((trip.price > 0 ? trip.price : trip.destinations?.price) || 0);';
const newStr = `  let lowestMpPrice = 0;
  if (tripMps.length > 0) {
    const prices = tripMps.map(mp => Number(mp.price)).filter(p => !isNaN(p) && p > 0);
    if (prices.length > 0) {
      lowestMpPrice = Math.min(...prices);
    }
  }
  const basePrice = lowestMpPrice > 0 ? lowestMpPrice : Number((trip.price > 0 ? trip.price : trip.destinations?.price) || 0);`;

content = content.replace(oldStr, newStr);
fs.writeFileSync('src/app/(public)/trip/trip-card.tsx', content);
