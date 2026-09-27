"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// Fungsi pembantu untuk convert link youtube biasa/shorts ke embed
export function getYoutubeEmbedUrl(url: string) {
  if (!url) return "";
  let videoId = "";
  
  if (url.includes("/shorts/")) {
    videoId = url.split("/shorts/")[1].split("?")[0];
  } else if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1].split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1].split("?")[0];
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

export function GalleryGrid({ items }: { items: any[] }) {
  const [selected, setSelected] = useState<any>(null);

  if (items.length === 0) {
    return <div className="col-span-full py-12 text-center text-muted-foreground">Belum ada media galeri untuk kategori ini.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => {
          const isVideo = item.category === "Video" || item.image_url.includes("youtube.com") || item.image_url.includes("youtu.be");
          
          return (
            <div 
              key={item.id} 
              className={`group relative rounded-xl overflow-hidden shadow-sm aspect-[4/3] bg-muted ${!isVideo ? 'cursor-pointer' : ''}`}
              onClick={() => !isVideo && setSelected(item)}
            >
              {isVideo ? (
                <iframe 
                  src={getYoutubeEmbedUrl(item.image_url)} 
                  className="w-full h-full object-cover"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <Image 
                    src={item.image_url} 
                    alt={item.title} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-white pointer-events-none">
                    <span className="text-xs font-medium uppercase tracking-wider mb-1 text-primary-foreground/80">{item.category}</span>
                    <h3 className="text-xl font-bold">{item.title}</h3>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none flex flex-col items-center justify-center">
          <DialogTitle className="sr-only">{selected?.title}</DialogTitle>
          {selected && (
            <div className="relative w-full flex justify-center group/modal">
              {/* Gunakan tag img standar untuk modal agar tidak terbatas rasio aspek fill */}
              <img 
                src={selected.image_url} 
                alt={selected.title} 
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-4 left-4 right-4 text-center opacity-0 group-hover/modal:opacity-100 transition-opacity duration-300">
                <span className="bg-black/75 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm shadow-lg">
                  {selected.title}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
