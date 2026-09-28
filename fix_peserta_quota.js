const fs = require('fs');

// 1. UPDATE page.tsx to fetch quota
let pageContent = fs.readFileSync('src/app/admin/peserta/page.tsx', 'utf-8');
pageContent = pageContent.replace(
  "trips(date_start, destinations(title))', emergency",
  "trips(date_start, quota, destinations(title)), emergency"
);
// fix the exact string
pageContent = pageContent.replace(
  "trips(date_start, destinations(title)), emergency_contacts",
  "trips(date_start, quota, destinations(title)), emergency_contacts"
);
pageContent = pageContent.replace(
  "trips(date_start, destinations(title)))')",
  "trips(date_start, quota, destinations(title)))')"
);
fs.writeFileSync('src/app/admin/peserta/page.tsx', pageContent);

// 2. UPDATE peserta-table.tsx to include quota and display it
let tableContent = fs.readFileSync('src/app/admin/peserta/peserta-table.tsx', 'utf-8');

const targetMapB = `      const tgl = tripData?.date_start ? formatLocalDate(tripData.date_start) : '-';
      const trip_key = \`\${destData?.title || '-'} (\${tgl})\`;

      bookingMap.set(b.booking_code, {`;

const replaceMapB = `      const tgl = tripData?.date_start ? formatLocalDate(tripData.date_start) : '-';
      const trip_key = \`\${destData?.title || '-'} (\${tgl})\`;
      const quota = tripData?.quota || 0;

      bookingMap.set(b.booking_code, {
        quota: quota,`;
tableContent = tableContent.replace(targetMapB, replaceMapB);


const targetMapM = `      const destData = Array.isArray(tripData?.destinations) ? tripData?.destinations[0] : tripData?.destinations;
      const tgl = tripData?.date_start ? formatLocalDate(tripData.date_start) : '-';
      
      const trip_key = \`\${destData?.title || '-'} (\${tgl})\`;`;

const replaceMapM = `      const destData = Array.isArray(tripData?.destinations) ? tripData?.destinations[0] : tripData?.destinations;
      const tgl = tripData?.date_start ? formatLocalDate(tripData.date_start) : '-';
      const quota = tripData?.quota || 0;
      
      const trip_key = \`\${destData?.title || '-'} (\${tgl})\`;`;

// Actually we don't need to add quota for members, since members are added to the booking group, and the booking group already has the quota.

const targetHeader = `                {/* LEVEL 1: TRIP & TANGGAL */}
                <TableRow className="bg-primary/10 hover:bg-primary/10">
                  <TableCell colSpan={3} className="font-bold text-primary py-3">
                    📍 {tripKey}
                  </TableCell>
                </TableRow>`;

const replaceHeader = `                {/* LEVEL 1: TRIP & TANGGAL */}
                {(() => {
                  const groups = groupedByTrip[tripKey];
                  const quota = groups[0]?.quota || 0;
                  
                  // Calculate total participants in this trip
                  let totalParticipants = 0;
                  groups.forEach((g: any) => {
                    totalParticipants += 1 + g.members.length;
                  });
                  
                  const isFull = quota > 0 && totalParticipants >= quota;
                  
                  return (
                    <TableRow className="bg-primary/10 hover:bg-primary/10">
                      <TableCell colSpan={3} className="font-bold text-primary py-3 flex items-center justify-between">
                        <span>📍 {tripKey} — {totalParticipants} Peserta</span>
                        {quota > 0 ? (
                          isFull ? (
                            <Badge variant="destructive" className="ml-4">FULL ({totalParticipants}/{quota})</Badge>
                          ) : (
                            <Badge variant="secondary" className="ml-4 bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                              Sisa Kuota: {quota - totalParticipants} (Total: {quota})
                            </Badge>
                          )
                        ) : (
                          <Badge variant="outline" className="ml-4">Kuota Tidak Dibatasi</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })()}`;

tableContent = tableContent.replace(targetHeader, replaceHeader);
fs.writeFileSync('src/app/admin/peserta/peserta-table.tsx', tableContent);

console.log('peserta quota script applied');
