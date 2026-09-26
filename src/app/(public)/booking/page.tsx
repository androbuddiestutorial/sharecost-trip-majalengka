"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  // Step 1: Data Pemesan
  namaLengkap: z.string().min(2, "Nama lengkap harus diisi"),
  alamatLengkap: z.string().min(5, "Alamat lengkap harus diisi"),
  jenisKelamin: z.enum(["Laki-laki", "Perempuan"], { message: "Pilih jenis kelamin" }),
  tanggalLahir: z.string().min(1, "Tanggal lahir harus diisi"),
  whatsapp: z.string().min(9, "Nomor WhatsApp tidak valid"),
  email: z.string().email("Email tidak valid"),

  // Step 2: Data Keberangkatan
  jenisTrip: z.enum(["Open Trip", "Regular Trip", "Private Trip"], { message: "Pilih jenis trip" }),
  destinasi: z.string().min(1, "Pilih destinasi"),
  jadwalTrip: z.string().min(1, "Pilih jadwal trip"),
  meetingPoint: z.string().min(1, "Pilih meeting point"),
  meetingPointLainnya: z.string().optional(),
  jumlahPeserta: z.string().min(1, "Pilih jumlah peserta"),
  anggota: z.array(z.object({
    namaLengkap: z.string().min(2, "Nama anggota harus diisi"),
    whatsapp: z.string().min(9, "Nomor WhatsApp anggota tidak valid"),
    alamat: z.string().min(5, "Alamat anggota harus diisi"),
  })).optional(),

  // Step 3: Kontak Darurat
  kontakDaruratNama: z.string().min(2, "Nama kontak darurat harus diisi"),
  kontakDaruratHubungan: z.string().min(2, "Hubungan dengan peserta harus diisi"),
  kontakDaruratWhatsapp: z.string().min(9, "Nomor WhatsApp tidak valid"),

  // Step 4: Kondisi & Kebutuhan
  adaKondisiKesehatan: z.enum(["Iya", "Tidak"], { message: "Pilih salah satu" }),
  penjelasanKondisiKesehatan: z.string().optional(),

  // Step 5: Informasi Tambahan
  sumberInformasi: z.enum(["TikTok", "Instagram", "Kerabat/Teman", "Lainnya"], { message: "Pilih sumber informasi" }),
  usernameMedsos: z.string().optional(),

  // Step 6: Persetujuan
  setujuDataBenar: z.boolean().refine((val) => val === true, "Anda harus menyetujui pernyataan ini"),
  setujuKetentuan: z.boolean().refine((val) => val === true, "Anda harus menyetujui pernyataan ini"),
  setujuKeselamatan: z.boolean().refine((val) => val === true, "Anda harus menyetujui pernyataan ini"),
  setujuPenggunaanData: z.boolean().refine((val) => val === true, "Anda harus menyetujui pernyataan ini"),
});

type FormValues = z.infer<typeof formSchema>;

const STEPS = [
  "Data Pemesan",
  "Keberangkatan",
  "Kontak Darurat",
  "Kondisi",
  "Info Tambahan",
  "Persetujuan"
];

export default function BookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  
  const [destinations, setDestinations] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [meetingPoints, setMeetingPoints] = useState<any[]>([]);
  
  useEffect(() => {
    fetch('/api/destinations').then(res => res.json()).then(data => {
      if(data.success) setDestinations(data.data);
    });
    fetch('/api/trips').then(res => res.json()).then(data => {
      if(data.success) setTrips(data.data);
    });
    fetch('/api/meeting-points').then(res => res.json()).then(data => {
      if(data.success) setMeetingPoints(data.data);
    });
  }, []);

  const { register, control, handleSubmit, watch, trigger, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jenisKelamin: undefined,
      jenisTrip: undefined,
      jumlahPeserta: "1",
      adaKondisiKesehatan: undefined,
      sumberInformasi: undefined,
    },
    mode: "onChange",
  });

  const { fields: anggotaFields, append: appendAnggota, remove: removeAnggota } = useFieldArray({
    control,
    name: "anggota",
  });

  const watchJumlahPeserta = watch("jumlahPeserta");
  const watchMeetingPoint = watch("meetingPoint");
  const watchAdaKondisi = watch("adaKondisiKesehatan");

  // Handle dynamic member fields based on participant count
  const handlePesertaChange = (val: string) => {
    const count = parseInt(val, 10);
    const currentLength = anggotaFields.length;
    const neededLength = count > 1 ? count - 1 : 0;

    if (neededLength > currentLength) {
      for (let i = currentLength; i < neededLength; i++) {
        appendAnggota({ namaLengkap: "", whatsapp: "", alamat: "" });
      }
    } else if (neededLength < currentLength) {
      for (let i = currentLength - 1; i >= neededLength; i--) {
        removeAnggota(i);
      }
    }
  };

  const processNextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    
    switch (currentStep) {
      case 0:
        fieldsToValidate = ['namaLengkap', 'alamatLengkap', 'jenisKelamin', 'tanggalLahir', 'whatsapp', 'email'];
        break;
      case 1:
        fieldsToValidate = ['jenisTrip', 'destinasi', 'jadwalTrip', 'meetingPoint', 'jumlahPeserta'];
        if (watchMeetingPoint === "Lainnya") fieldsToValidate.push('meetingPointLainnya');
        if (parseInt(watchJumlahPeserta) > 1) fieldsToValidate.push('anggota');
        break;
      case 2:
        fieldsToValidate = ['kontakDaruratNama', 'kontakDaruratHubungan', 'kontakDaruratWhatsapp'];
        break;
      case 3:
        fieldsToValidate = ['adaKondisiKesehatan'];
        if (watchAdaKondisi === "Iya") fieldsToValidate.push('penjelasanKondisiKesehatan');
        break;
      case 4:
        fieldsToValidate = ['sumberInformasi'];
        break;
      default:
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const processPrevStep = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      
      if (result.success) {
        router.push("/booking/success");
      } else {
        alert("Terjadi kesalahan: " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim pendaftaran. Silakan coba lagi.");
    }
  };

  return (
    <div className="container mx-auto px-4 pt-32 pb-12 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-center">Pendaftaran Trip</h1>
        
        {/* Progress Bar */}
        <div className="mt-8 relative">
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-muted">
            <div 
              style={{ width: `${((currentStep) / (STEPS.length - 1)) * 100}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-300"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground px-1 hidden sm:flex">
            {STEPS.map((step, idx) => (
              <span key={step} className={cn(idx <= currentStep ? "text-primary font-medium" : "")}>
                {step}
              </span>
            ))}
          </div>
          <div className="text-center text-sm font-medium text-primary mt-2 sm:hidden">
            Langkah {currentStep + 1} dari {STEPS.length}: {STEPS[currentStep]}
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-xl">{STEPS[currentStep]}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            
            {/* STEP 1: Data Pemesan */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="namaLengkap">Nama Lengkap (Sesuai KTP)</Label>
                  <Input id="namaLengkap" {...register("namaLengkap")} />
                  {errors.namaLengkap && <p className="text-sm text-destructive">{errors.namaLengkap.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alamatLengkap">Alamat Lengkap</Label>
                  <Textarea id="alamatLengkap" {...register("alamatLengkap")} />
                  {errors.alamatLengkap && <p className="text-sm text-destructive">{errors.alamatLengkap.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Jenis Kelamin</Label>
                  <Controller
                    name="jenisKelamin"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup onValueChange={field.onChange} value={field.value || ""} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Laki-laki" id="r-lk" />
                          <Label htmlFor="r-lk">Laki-laki</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Perempuan" id="r-pr" />
                          <Label htmlFor="r-pr">Perempuan</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.jenisKelamin && <p className="text-sm text-destructive">{errors.jenisKelamin.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tanggalLahir">Tanggal Lahir</Label>
                  <Input type="date" id="tanggalLahir" {...register("tanggalLahir")} />
                  {errors.tanggalLahir && <p className="text-sm text-destructive">{errors.tanggalLahir.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">Nomor HP / WhatsApp</Label>
                    <Input id="whatsapp" type="tel" {...register("whatsapp")} placeholder="08xxxxxxxxxx" />
                    {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Data Keberangkatan */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Jenis Trip</Label>
                  <Controller
                    name="jenisTrip"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Jenis Trip" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open Trip">Open Trip</SelectItem>
                          <SelectItem value="Regular Trip">Regular Trip</SelectItem>
                          <SelectItem value="Private Trip">Private Trip</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.jenisTrip && <p className="text-sm text-destructive">{errors.jenisTrip.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Destinasi</Label>
                  <Controller
                    name="destinasi"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Destinasi" />
                        </SelectTrigger>
                        <SelectContent>
                          {destinations.map(d => (
                            <SelectItem key={d.id} value={d.title}>{d.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.destinasi && <p className="text-sm text-destructive">{errors.destinasi.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Jadwal Trip</Label>
                  <Controller
                    name="jadwalTrip"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Jadwal" />
                        </SelectTrigger>
                        <SelectContent>
                          {trips.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.date} - {t.destination}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.jadwalTrip && <p className="text-sm text-destructive">{errors.jadwalTrip.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Meeting Point</Label>
                  <Controller
                    name="meetingPoint"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Meeting Point" />
                        </SelectTrigger>
                        <SelectContent>
                          {meetingPoints.map(mp => (
                            <SelectItem key={mp.id} value={mp.name}>{mp.name}</SelectItem>
                          ))}
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.meetingPoint && <p className="text-sm text-destructive">{errors.meetingPoint.message}</p>}
                </div>

                {watchMeetingPoint === "Lainnya" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="meetingPointLainnya">Tulis Meeting Point</Label>
                    <Input id="meetingPointLainnya" {...register("meetingPointLainnya")} />
                    {errors.meetingPointLainnya && <p className="text-sm text-destructive">{errors.meetingPointLainnya.message}</p>}
                  </div>
                )}

                <div className="space-y-2 border-t pt-4 mt-4">
                  <Label>Jumlah Anggota yang Didaftarkan</Label>
                  <p className="text-xs text-muted-foreground mb-2">Pilih 1 orang jika mendaftar sendiri.</p>
                  <Controller
                    name="jumlahPeserta"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        onValueChange={(val) => {
                          field.onChange(val);
                          handlePesertaChange(val as string);
                        }} 
                        value={field.value || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Jumlah Orang" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(10)].map((_, i) => (
                            <SelectItem key={i+1} value={(i+1).toString()}>{i+1} Orang</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {anggotaFields.length > 0 && (
                  <div className="space-y-6 pt-4">
                    <h3 className="font-semibold text-lg border-b pb-2">Data Anggota Tambahan</h3>
                    {anggotaFields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-muted/20 border rounded-lg space-y-4 animate-in fade-in">
                        <h4 className="font-medium text-sm text-primary">Anggota {index + 1}</h4>
                        <div className="space-y-2">
                          <Label>Nama Lengkap</Label>
                          <Input {...register(`anggota.${index}.namaLengkap`)} />
                          {errors?.anggota?.[index]?.namaLengkap && <p className="text-sm text-destructive">{errors.anggota[index]?.namaLengkap?.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Nomor HP / WhatsApp</Label>
                          <Input type="tel" {...register(`anggota.${index}.whatsapp`)} />
                          {errors?.anggota?.[index]?.whatsapp && <p className="text-sm text-destructive">{errors.anggota[index]?.whatsapp?.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Alamat</Label>
                          <Input {...register(`anggota.${index}.alamat`)} />
                          {errors?.anggota?.[index]?.alamat && <p className="text-sm text-destructive">{errors.anggota[index]?.alamat?.message}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Kontak Darurat */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="kontakDaruratNama">Nama Kontak Darurat</Label>
                  <Input id="kontakDaruratNama" {...register("kontakDaruratNama")} />
                  {errors.kontakDaruratNama && <p className="text-sm text-destructive">{errors.kontakDaruratNama.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kontakDaruratHubungan">Hubungan dengan Peserta</Label>
                  <Input id="kontakDaruratHubungan" placeholder="Contoh: Orang Tua, Kakak, Pasangan" {...register("kontakDaruratHubungan")} />
                  {errors.kontakDaruratHubungan && <p className="text-sm text-destructive">{errors.kontakDaruratHubungan.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kontakDaruratWhatsapp">Nomor HP / WhatsApp</Label>
                  <Input id="kontakDaruratWhatsapp" type="tel" {...register("kontakDaruratWhatsapp")} />
                  {errors.kontakDaruratWhatsapp && <p className="text-sm text-destructive">{errors.kontakDaruratWhatsapp.message}</p>}
                </div>
              </div>
            )}

            {/* STEP 4: Kondisi & Kebutuhan */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Apakah Anda memiliki kondisi kesehatan yang perlu kami ketahui?</Label>
                  <Controller
                    name="adaKondisiKesehatan"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup onValueChange={field.onChange} value={field.value || ""} className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Iya" id="k-iya" />
                          <Label htmlFor="k-iya">Iya</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Tidak" id="k-tidak" />
                          <Label htmlFor="k-tidak">Tidak</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.adaKondisiKesehatan && <p className="text-sm text-destructive">{errors.adaKondisiKesehatan.message}</p>}
                </div>

                {watchAdaKondisi === "Iya" && (
                  <div className="space-y-2 mt-4 animate-in fade-in">
                    <Label htmlFor="penjelasanKondisiKesehatan">Jelaskan kondisi kesehatan tersebut</Label>
                    <Textarea id="penjelasanKondisiKesehatan" {...register("penjelasanKondisiKesehatan")} />
                    <p className="text-xs text-muted-foreground mt-1">
                      Informasi ini digunakan untuk membantu penyelenggara mempersiapkan perjalanan dan bukan sebagai pengganti pemeriksaan medis.
                    </p>
                    {errors.penjelasanKondisiKesehatan && <p className="text-sm text-destructive">{errors.penjelasanKondisiKesehatan.message}</p>}
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: Informasi Tambahan */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Dari mana Anda mengetahui informasi Open Trip ini?</Label>
                  <Controller
                    name="sumberInformasi"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup onValueChange={field.onChange} value={field.value || ""} className="flex flex-col gap-3 mt-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="TikTok" id="s-tiktok" />
                          <Label htmlFor="s-tiktok">TikTok</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Instagram" id="s-ig" />
                          <Label htmlFor="s-ig">Instagram</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Kerabat/Teman" id="s-teman" />
                          <Label htmlFor="s-teman">Kerabat/Teman</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Lainnya" id="s-lain" />
                          <Label htmlFor="s-lain">Lainnya</Label>
                        </div>
                      </RadioGroup>
                    )}
                  />
                  {errors.sumberInformasi && <p className="text-sm text-destructive">{errors.sumberInformasi.message}</p>}
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="usernameMedsos">Username TikTok/Instagram (Opsional)</Label>
                  <Input id="usernameMedsos" {...register("usernameMedsos")} />
                </div>
              </div>
            )}

            {/* STEP 6: Persetujuan */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm mb-6">
                  Silakan periksa kembali data Anda. Beri centang pada pernyataan di bawah ini untuk melanjutkan pendaftaran.
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <Controller
                      name="setujuDataBenar"
                      control={control}
                      render={({ field }) => (
                        <Checkbox checked={!!field.value} onCheckedChange={field.onChange} id="setujuDataBenar" />
                      )}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="setujuDataBenar" className="text-sm font-medium leading-tight">Saya menyatakan bahwa seluruh data yang saya isi adalah benar dan dapat dipertanggungjawabkan.</Label>
                      {errors.setujuDataBenar && <p className="text-xs text-destructive">{errors.setujuDataBenar.message}</p>}
                    </div>
                  </div>

                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <Controller
                      name="setujuKetentuan"
                      control={control}
                      render={({ field }) => (
                        <Checkbox checked={!!field.value} onCheckedChange={field.onChange} id="setujuKetentuan" />
                      )}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="setujuKetentuan" className="text-sm font-medium leading-tight">Saya bersedia mengikuti seluruh ketentuan dan peraturan Open Trip.</Label>
                      {errors.setujuKetentuan && <p className="text-xs text-destructive">{errors.setujuKetentuan.message}</p>}
                    </div>
                  </div>

                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <Controller
                      name="setujuKeselamatan"
                      control={control}
                      render={({ field }) => (
                        <Checkbox checked={!!field.value} onCheckedChange={field.onChange} id="setujuKeselamatan" />
                      )}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="setujuKeselamatan" className="text-sm font-medium leading-tight">Saya memahami bahwa keselamatan selama perjalanan merupakan tanggung jawab bersama dan saya wajib mengikuti arahan dari pihak penyelenggara.</Label>
                      {errors.setujuKeselamatan && <p className="text-xs text-destructive">{errors.setujuKeselamatan.message}</p>}
                    </div>
                  </div>

                  <div className="flex flex-row items-start space-x-3 space-y-0">
                    <Controller
                      name="setujuPenggunaanData"
                      control={control}
                      render={({ field }) => (
                        <Checkbox checked={!!field.value} onCheckedChange={field.onChange} id="setujuPenggunaanData" />
                      )}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor="setujuPenggunaanData" className="text-sm font-medium leading-tight">Saya menyetujui penggunaan data yang saya berikan untuk keperluan administrasi dan komunikasi terkait Open Trip.</Label>
                      {errors.setujuPenggunaanData && <p className="text-xs text-destructive">{errors.setujuPenggunaanData.message}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 bg-muted/10">
            {currentStep > 0 ? (
              <Button type="button" variant="outline" onClick={processPrevStep}>
                ← Back
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={() => router.push('/trip')}>
                Batal
              </Button>
            )}
            
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={processNextStep}>
                Next →
              </Button>
            ) : (
              <Button type="submit">
                Daftar / Kirim
              </Button>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
