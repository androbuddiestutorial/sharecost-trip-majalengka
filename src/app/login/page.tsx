"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mountain } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulating authentication delay
    setTimeout(() => {
      router.push("/admin");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-muted/40 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Mountain className="h-8 w-8 text-primary" />
        <span className="font-bold text-2xl tracking-tight text-primary">SHARECOSTTRIP</span>
      </Link>

      <Card className="w-full max-w-md shadow-lg">
        <form onSubmit={handleLogin}>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>
              Login mock untuk mengakses Admin Dashboard (Phase 6).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@example.com" required defaultValue="admin@example.com" />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded border border-blue-200">
              Note: Database & Auth (Phase 2 & 5) are deferred. Clicking login will immediately redirect you to the Admin Dashboard.
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
