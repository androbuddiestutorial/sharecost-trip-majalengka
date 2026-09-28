const fs = require('fs');
let content = fs.readFileSync('src/app/(public)/booking/page.tsx', 'utf-8');

const targetStr = `            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Jenis Trip</Label>`;
                  
const replacementStr = `            {currentStep === 1 && (
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
                    
                    {watchJadwalTrip && (
                      <div className="mt-2 p-3 bg-white/50 rounded-lg text-sm border">
                        <p className="font-semibold text-primary mb-2">Fasilitas Termasuk:</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(() => {
                            const selectedTrip = trips.find(t => t.id === watchJadwalTrip);
                            if (!selectedTrip || !selectedTrip.includes) return null;
                            let features = [];
                            try {
                              features = typeof selectedTrip.includes === 'string' ? JSON.parse(selectedTrip.includes) : selectedTrip.includes;
                            } catch (e) {}
                            if (!Array.isArray(features)) return null;
                            return features.map((feat: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-green-500 font-bold mt-0.5">✓</span> <span>{feat}</span>
                              </li>
                            ));
                          })()}
                        </ul>
                      </div>
                    )}
                    
                    <div className="space-y-2 pt-2 border-t border-primary/10">
                      <Label>Jumlah Anggota yang Didaftarkan</Label>
                      <Controller
                        name="jumlahPeserta"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value || "1"}>
                            <SelectTrigger className="bg-white">
                              <SelectValue placeholder="Pilih jumlah" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <SelectItem key={n} value={n.toString()}>{n} Orang</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <p className="text-xs text-muted-foreground">Pilih 1 jika mendaftar sendiri.</p>
                      {errors.jumlahPeserta && <p className="text-sm text-destructive">{errors.jumlahPeserta.message}</p>}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>Jenis Trip</Label>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/app/(public)/booking/page.tsx', content);
