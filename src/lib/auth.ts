"use server";

import { createClient } from "@/utils/supabase/server";

export async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error("Unauthorized: Anda harus login terlebih dahulu.");
  }
  
  const adminEmailsString = process.env.ADMIN_EMAILS || 'sharecosttripmajalengka@gmail.com';
  const adminEmails = adminEmailsString.split(',').map(e => e.trim().toLowerCase());
  
  if (!adminEmails.includes(user.email?.toLowerCase() || '')) {
    throw new Error("Forbidden: Anda tidak memiliki akses admin.");
  }
  
  return { user, supabase };
}
