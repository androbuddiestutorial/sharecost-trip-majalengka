export const metadata = {
  title: "Kebijakan Privasi - Sharecosttrip Majalengka",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-20 max-w-3xl">
      <div className="mb-12 border-b pb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Kebijakan Privasi</h1>
        <p className="text-muted-foreground">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-6 text-muted-foreground leading-relaxed">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">1. Pengumpulan Informasi</h2>
          <p>
            Saat Anda mendaftar trip melalui platform kami, kami mengumpulkan informasi pribadi yang Anda berikan secara sukarela, termasuk namun tidak terbatas pada:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Nama lengkap dan tanggal lahir</li>
            <li>Nomor WhatsApp dan alamat Email</li>
            <li>Alamat domisili</li>
            <li>Kontak darurat (nama dan nomor telepon)</li>
            <li>Informasi riwayat kesehatan khusus</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">2. Penggunaan Informasi</h2>
          <p>Informasi yang kami kumpulkan digunakan semata-mata untuk keperluan operasional pendakian, antara lain:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Pendaftaran Surat Izin Masuk Kawasan Konservasi (SIMAKSI) kepada pihak Taman Nasional.</li>
            <li>Menghubungi Anda terkait jadwal, pembayaran, dan informasi teknis trip.</li>
            <li>Penanganan kondisi darurat atau medis saat berada di lapangan (gunung).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">3. Keamanan Data</h2>
          <p>
            Kami berkomitmen untuk melindungi data pribadi Anda. Seluruh data peserta disimpan secara rahasia dan aman dalam database kami. Kami tidak akan memperjualbelikan, menyewakan, atau membagikan data pribadi Anda kepada pihak ketiga mana pun di luar keperluan pendaftaran resmi Taman Nasional.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">4. Dokumentasi Media</h2>
          <p>
            Foto dan video yang diambil selama trip berlangsung adalah hak milik Sharecosttrip Majalengka. Kami berhak menggunakan materi tersebut untuk keperluan promosi dan galeri di platform kami, kecuali Anda menyatakan keberatan secara tertulis sebelumnya.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">5. Kontak Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini atau ingin meminta penghapusan data Anda dari sistem kami setelah trip selesai, Anda dapat menghubungi kami melalui WhatsApp Admin.
          </p>
        </section>
      </div>
    </div>
  );
}
