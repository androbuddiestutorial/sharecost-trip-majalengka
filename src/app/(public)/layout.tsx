import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="print:hidden">
        <Navbar />
      </div>
      <main className="flex-grow flex flex-col">{children}</main>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}
