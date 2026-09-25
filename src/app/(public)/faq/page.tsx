export const metadata = {
  title: "FAQ - Sharecosttrip Majalengka",
};

const faqs = [
  {
    q: "Apa itu Sharecosttrip Majalengka?",
    a: "Sharecosttrip Majalengka adalah penyedia layanan open trip, private trip, dan regular trip untuk pendakian gunung yang aman, terorganisir, dan mengutamakan kenyamanan bersama dengan konsep berbagi biaya (sharecost) yang transparan."
  },
  {
    q: "Apakah pemula bisa ikut open trip ini?",
    a: "Tentu bisa! Kami memiliki beberapa destinasi yang sangat cocok untuk pemula. Guide kami yang ramah dan berpengalaman akan mendampingi dan mengajarkan dasar-dasar pendakian yang aman."
  },
  {
    q: "Fasilitas apa saja yang didapatkan?",
    a: "Fasilitas bervariasi tergantung paket. Untuk paket standar, fasilitas meliputi tiket masuk/simaksi, transportasi dari meeting point (opsional), tenda, alat masak, makan selama pendakian, guide, dan P3K standar."
  },
  {
    q: "Bagaimana sistem pembayarannya?",
    a: "Peserta dapat melakukan Down Payment (DP) terlebih dahulu untuk mengamankan kuota. Pelunasan dapat dilakukan maksimal H-3 sebelum keberangkatan melalui transfer bank atau E-Wallet."
  },
  {
    q: "Bagaimana jika saya batal ikut?",
    a: "Pembatalan maksimal H-7 bisa mendapatkan refund DP 50%. Pembatalan kurang dari H-7 maka DP dianggap hangus, namun Anda bisa mencari peserta pengganti (oper seat)."
  }
];

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 pt-32 pb-20 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground">
          Pertanyaan yang sering diajukan seputar pendakian bersama kami.
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <details key={index} className="group border rounded-lg bg-card p-6 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between font-medium text-lg text-foreground">
              {faq.q}
              <span className="transition group-open:rotate-180">
                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
              </span>
            </summary>
            <p className="text-muted-foreground mt-4 leading-relaxed group-open:animate-in group-open:fade-in group-open:slide-in-from-top-1">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
