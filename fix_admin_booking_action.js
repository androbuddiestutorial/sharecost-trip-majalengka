const fs = require('fs');
let content = fs.readFileSync('src/app/admin/bookings/create/actions.ts', 'utf-8');

const regex1 = /const \{ data: trip \} = await supabase\s*\.from\("trips"\)\s*\.select\("price, destinations\(price\)"\)\s*\.eq\("id", trip_id\)\s*\.single\(\);/g;

const repl1 = `const { data: trip } = await supabase
      .from("trips")
      .select("price, meeting_points, destinations(price)")
      .eq("id", trip_id)
      .single();`;

content = content.replace(regex1, repl1);

const regex2 = /const total_amount = pricePerPax \* pax;/g;
const repl2 = `
    let mpPrice = 0;
    if (meeting_point) {
      let tripMps = [];
      if (trip?.meeting_points) {
        try {
          tripMps = typeof trip.meeting_points === 'string' ? JSON.parse(trip.meeting_points) : trip.meeting_points;
        } catch (e) {}
      }
      const foundMp = (Array.isArray(tripMps) ? tripMps : []).find(mp => mp.name === meeting_point);
      if (foundMp?.price) {
        mpPrice = Number(foundMp.price);
      }
    }
    const total_amount = (pricePerPax + mpPrice) * pax;
`;
content = content.replace(regex2, repl2);

const regex3 = /meeting_point,\s*pax,\s*total_amount,/g;
const repl3 = `meeting_point,
          meeting_point_price: mpPrice,
          pax,
          total_amount,`;
content = content.replace(regex3, repl3);

fs.writeFileSync('src/app/admin/bookings/create/actions.ts', content);
