const fs = require('fs');
let content = fs.readFileSync('src/app/api/bookings/route.ts', 'utf-8');

const regex1 = /let pricePerPax = 0;\s*if \(body\.jadwalTrip\) \{\s*const \{ data: tripData \} = await supabase\s*\.from\('trips'\)\s*\.select\('\*, destinations\(price\)'\)\s*\.eq\('id', body\.jadwalTrip\)\s*\.single\(\);\s*if \(tripData\?\.price && Number\(tripData\.price\) > 0\) \{\s*pricePerPax = Number\(tripData\.price\);\s*\} else if \(tripData\?\.destinations\?\.price\) \{\s*pricePerPax = Number\(tripData\.destinations\.price\);\s*\}\s*\}/;

const repl1 = `let pricePerPax = 0;
    let tripDataRow = null;
    if (body.jadwalTrip) {
      const { data: tripData } = await supabase
        .from('trips')
        .select('*, destinations(price)')
        .eq('id', body.jadwalTrip)
        .single();
      
      tripDataRow = tripData;
      
      if (tripData?.price && Number(tripData.price) > 0) {
        pricePerPax = Number(tripData.price);
      } else if (tripData?.destinations?.price) {
        pricePerPax = Number(tripData.destinations.price);
      }
    }`;

content = content.replace(regex1, repl1);

const regex2 = /let meetingPointPrice = 0;\s*if \(body\.meetingPoint && body\.meetingPoint !== \"Lainnya\"\) \{\s*const \{ data: mpData \} = await supabase\.from\('meeting_points'\)\.select\('price'\)\.eq\('name', body\.meetingPoint\)\.single\(\);\s*if \(mpData\?\.price\) \{\s*meetingPointPrice = Number\(mpData\.price\);\s*\}\s*\}/;

const repl2 = `let meetingPointPrice = 0;
    if (body.meetingPoint && body.meetingPoint !== "Lainnya") {
      let tripMps = [];
      if (tripDataRow?.meeting_points) {
        try {
          tripMps = typeof tripDataRow.meeting_points === 'string' ? JSON.parse(tripDataRow.meeting_points) : tripDataRow.meeting_points;
        } catch (e) {}
      }
      const foundMp = (Array.isArray(tripMps) ? tripMps : []).find(mp => mp.name === body.meetingPoint);
      if (foundMp?.price) {
        meetingPointPrice = Number(foundMp.price);
      }
    }`;

content = content.replace(regex2, repl2);
fs.writeFileSync('src/app/api/bookings/route.ts', content);
