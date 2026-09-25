import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Galeri Trip - Sharecosttrip Majalengka",
  description: "Dokumentasi perjalanan dan keseruan open trip gunung bersama Sharecosttrip Majalengka.",
};

const DUMMY_GALLERY = [
  { id: 1, title: "Puncak Ciremai", category: "Gunung Ciremai", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800&auto=format&fit=crop" },
  { id: 2, title: "Sabana Merbabu", category: "Gunung Merbabu", img: "https://images.unsplash.com/photo-1522362375878-a734685794dc?q=80&w=800&auto=format&fit=crop" },
  { id: 3, title: "Sunrise Prau", category: "Gunung Prau", img: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?q=80&w=800&auto=format&fit=crop" },
  { id: 4, title: "Ranu Kumbolo", category: "Gunung Semeru", img: "https://images.unsplash.com/photo-1516601267868-be96d669dbbd?q=80&w=800&auto=format&fit=crop" },
  { id: 5, title: "Basecamp Sindoro", category: "Gunung Sindoro", img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop" },
  { id: 6, title: "Summit Attack", category: "Gunung Sumbing", img: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=800&auto=format&fit=crop" },
];

export default function GalleryPage() {
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
          {DUMMY_GALLERY.map((item) => (
            <div key={item.id} className="group relative rounded-xl overflow-hidden shadow-sm aspect-[4/3] bg-muted">
              <Image 
                src={item.img} 
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
