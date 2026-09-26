import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <h2 className="text-2xl font-bold">Halaman Tidak Ditemukan</h2>
      <p className="text-muted-foreground">Halaman yang Anda cari tidak tersedia.</p>
      <Button render={<Link href="/admin" />}>Kembali ke Dashboard</Button>
    </div>
  );
}
