"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function PrintButton() {
  return (
    <Button onClick={() => window.print()} className="gap-2">
      <Download className="h-4 w-4" />
      Export PDF
    </Button>
  );
}
