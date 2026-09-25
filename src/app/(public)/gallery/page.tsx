import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";

export const metadata = {
  title: "Galeri Trip - Sharecosttrip Majalengka",
  description: "Dokumentasi perjalanan dan keseruan open trip gunung bersama Sharecosttrip Majalengka.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const { data: gallery } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
  const safeGallery = gallery || [];

  return (
    <div className="bg-muted/30 pb-20">
      <div className="bg-primary text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Galeri Perjalanan</h1>
          <p className="text-lg md:text-xl opacity-90">
            Jejak langkah, canda tawa, dan pemandangan luar biasa dari setiap trip yang telah kami jalani bersama.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          <Badge className="px-4 py-1.5 text-sm cursor-pointer" variant="default">Semua</Badge>
          <Badge className="px-4 py-1.5 text-sm cursor-pointer hover:bg-primary/20" variant="secondary">Ciremai</Badge>
          <Badge className="px-4 py-1.5 text-sm cursor-pointer hover:bg-primary/20" variant="secondary">Merbabu</Badge>
          <Badge className="px-4 py-1.5 text-sm cursor-pointer hover:bg-primary/20" variant="secondary">Prau</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {safeGallery.length === 0 ? (
             <div className="col-span-full py-12 text-center text-muted-foreground">Belum ada foto galeri.</div>
          ) : safeGallery.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden shadow-sm aspect-[4/3] bg-muted">
              <Image 
                src={item.image_url} 
                alt={item.title} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white">
                <span className="text-xs font-medium uppercase tracking-wider mb-1 text-primary-foreground/80">{item.category}</span>
                <h3 className="text-xl font-bold">{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
