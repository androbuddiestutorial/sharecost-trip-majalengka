const fs = require('fs');
let content = fs.readFileSync('src/app/admin/bookings/create/create-booking-client.tsx', 'utf-8');

// 1. Add state for meetingPoint
content = content.replace(
  'const [tripId, setTripId] = useState("");',
  'const [tripId, setTripId] = useState("");\n  const [meetingPoint, setMeetingPoint] = useState("");'
);

// 2. Parse meeting points for selected trip
const parseScript = `
  let tripMps: any[] = [];
  if (selectedTrip?.meeting_points) {
    try {
      const arr = typeof selectedTrip.meeting_points === 'string' ? JSON.parse(selectedTrip.meeting_points) : selectedTrip.meeting_points;
      tripMps = Array.isArray(arr) ? arr : [];
    } catch (e) {}
  }
  const hasMps = tripMps.length > 0;
  const selectedMpObj = tripMps.find((mp: any) => mp.name === meetingPoint);
  const mpPrice = selectedMpObj?.price ? Number(selectedMpObj.price) : 0;
`;
content = content.replace('const basePrice = selectedTrip', parseScript + '\n  const basePrice = selectedTrip');

// 3. Update totalAmount
content = content.replace('const totalAmount = basePrice * pax;', 'const totalAmount = (basePrice + mpPrice) * pax;');

// 4. Update the formData logic
content = content.replace('meeting_point: formData.get("meeting_point"),', 'meeting_point: meetingPoint || formData.get("meeting_point"),');

// 5. Update UI for Meeting Point
const oldUi = /<div className="space-y-2 md:col-span-2">\s*<Label htmlFor="meeting_point">Meeting Point \(Opsional\)<\/Label>\s*<Input id="meeting_point" name="meeting_point" placeholder="Misal: Terminal Maja" \/>\s*<\/div>/;
const newUi = `<div className="space-y-2 md:col-span-2">
            <Label htmlFor="meeting_point">Meeting Point {hasMps ? "(Wajib karena trip ini punya pilihan)" : "(Opsional)"}</Label>
            {hasMps ? (
              <select
                id="meeting_point"
                name="meeting_point"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
              >
                <option value="">-- Pilih Meeting Point --</option>
                {tripMps.map((mp: any, idx: number) => (
                  <option key={idx} value={mp.name}>{mp.name} (+ Rp {Number(mp.price).toLocaleString('id-ID')})</option>
                ))}
              </select>
            ) : (
              <Input 
                id="meeting_point" 
                name="meeting_point" 
                placeholder="Misal: Terminal Maja" 
                value={meetingPoint}
                onChange={(e) => setMeetingPoint(e.target.value)}
              />
            )}
          </div>`;
content = content.replace(oldUi, newUi);

// 6. Reset meetingPoint when trip changes
content = content.replace('onChange={(e) => setTripId(e.target.value)}', 'onChange={(e) => { setTripId(e.target.value); setMeetingPoint(""); }}');

// 7. Update Total Tagihan display
const oldTotal = /Rp \{basePrice\.toLocaleString\('id-ID'\)\} x \{pax\} Orang/;
const newTotal = `Rp {(basePrice + mpPrice).toLocaleString('id-ID')} x {pax} Orang`;
content = content.replace(oldTotal, newTotal);

fs.writeFileSync('src/app/admin/bookings/create/create-booking-client.tsx', content);
