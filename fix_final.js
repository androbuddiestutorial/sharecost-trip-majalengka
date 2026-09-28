const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/booking/page.tsx', 'utf-8');

const s1 = '{currentStep === 1 && (\n              <div className="space-y-4">\n                <div className="space-y-2">\n                  <Label>Jenis Trip</Label>';
const s2 = '{currentStep === 1 && (\r\n              <div className="space-y-4">\r\n                <div className="space-y-2">\r\n                  <Label>Jenis Trip</Label>';

const repl = `{currentStep === 1 && (
              <div className="space-y-4">
                {isLockedByUrl && watchJadwalTrip && watchMeetingPoint ? (
                  <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Destinasi</span>
                        <span className="font-semibold text-primary">{watchDestinasi}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Jadwal Trip</span>
                        <span className="font-medium">{trips.find(t => t.id === watchJadwalTrip)?.date || "-"}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Meeting Point</span>
                        <span className="font-medium">{watchMeetingPoint}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Jenis Trip</Label>`;

content = content.replace(s1, repl).replace(s2, repl);
fs.writeFileSync('src/app/(public)/booking/page.tsx', content);
