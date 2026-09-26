"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h2 className="text-2xl font-bold text-destructive">Terjadi Kesalahan</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi.
      </p>
      <Button onClick={reset}>Coba Lagi</Button>
    </div>
  );
}
