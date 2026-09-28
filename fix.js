const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/booking/page.tsx', 'utf-8');

const sIdx = content.indexOf('<Label>Meeting Point</Label>');
const eIdx = content.indexOf('{errors.meetingPoint &&', sIdx);
const endDiv = content.indexOf('</div>', eIdx) + 6;
const divStart = content.lastIndexOf('<div className="space-y-2">', sIdx);

const oldMp = content.substring(divStart, endDiv);

const newMp = '{mpLocked ? (\n' +
'                    <div className="space-y-2">\n' +
'                      <Label>Meeting Point Pilihan</Label>\n' +
'                      <Input value={watchMeetingPoint || ""} readOnly className="bg-muted text-muted-foreground" />\n' +
'                      <input type="hidden" {...register("meetingPoint")} value={watchMeetingPoint || ""} />\n' +
'                    </div>\n' +
'                  ) : (\n' + oldMp + '\n                  )}';

content = content.substring(0, divStart) + newMp + content.substring(endDiv);
fs.writeFileSync('src/app/(public)/booking/page.tsx', content);
