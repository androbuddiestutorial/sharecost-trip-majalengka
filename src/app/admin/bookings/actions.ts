"use server";

import { assertAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(id: string, newStatus: string, newPaymentStatus?: string) {
  try {
    const { supabase } = await assertAdmin();
    
    let updatePayload: any = { status: newStatus };
    
    // Check if newPaymentStatus is explicitly provided
    if (newPaymentStatus) {
      updatePayload.payment_status = newPaymentStatus;
    } else {
      // Auto sync if not explicitly provided
      if (newStatus === "Lunas") {
        updatePayload.payment_status = "Lunas";
      } else if (newStatus === "DP Dibayar") {
        updatePayload.payment_status = "DP";
      }
    }

    const targetPaymentStatus = updatePayload.payment_status;

    // CALCULATE AND INSERT PAYMENTS
    if (targetPaymentStatus === "Lunas" || targetPaymentStatus === "DP") {
      const { data: booking } = await supabase.from("bookings").select("total_amount, payment_status").eq("id", id).single();
      
      if (booking) {
        const totalAmount = Number(booking.total_amount) || 0;
        
        // Find existing payments
        const { data: payments } = await supabase.from("payments").select("amount").eq("booking_id", id).eq("status", "Terverifikasi");
        const totalPaid = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

        if (targetPaymentStatus === "Lunas") {
          const remaining = totalAmount - totalPaid;
          if (remaining > 0) {
            await supabase.from("payments").insert({
              booking_id: id,
              amount: remaining,
              payment_method: "Manual (Admin Edit)",
              payment_type: "Lunas",
              payment_date: new Date().toISOString(),
              status: "Terverifikasi",
              proof_url: ""
            });
          }
        } else if (targetPaymentStatus === "DP") {
           // For DP, if totalPaid is 0, we insert 50%
           if (totalPaid === 0) {
             const dpAmount = Math.floor(totalAmount / 2);
             if (dpAmount > 0) {
               await supabase.from("payments").insert({
                  booking_id: id,
                  amount: dpAmount,
                  payment_method: "Manual (Admin Edit)",
                  payment_type: "DP",
                  payment_date: new Date().toISOString(),
                  status: "Terverifikasi",
                  proof_url: ""
               });
             }
           }
        }
      }
    }

    const { error } = await supabase.from("bookings").update(updatePayload).eq("id", id);

    if (error) {
      console.error("Error updating booking status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}

export async function deleteBooking(id: string) {
  try {
    const { supabase } = await assertAdmin();
    
    // Delete related records first
    await supabase.from('payments').delete().eq('booking_id', id);
    await supabase.from('booking_members').delete().eq('booking_id', id);
    await supabase.from('emergency_contacts').delete().eq('booking_id', id);
    await supabase.from('health_information').delete().eq('booking_id', id);
    
    const { error } = await supabase.from('bookings').delete().eq('id', id);

    if (error) {
      console.error('Error deleting booking:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/bookings');
    revalidatePath('/admin/peserta');
    revalidatePath('/admin/payments');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Unauthorized' };
  }
}

export async function processPelunasan(booking_id: string) {
  try {
    const { supabase } = await assertAdmin();
    
    const { data: booking } = await supabase.from("bookings").select("total_amount").eq("id", booking_id).single();
    if (!booking) return { success: false, error: "Booking tidak ditemukan." };
    
    const totalAmount = Number(booking.total_amount) || 0;

    const { data: payments } = await supabase.from("payments").select("amount").eq("booking_id", booking_id).eq("status", "Terverifikasi");
    const totalPaid = payments?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0;

    const remaining = totalAmount - totalPaid;
    
    if (remaining > 0) {
      const { error: insertError } = await supabase.from("payments").insert({
        booking_id: booking_id,
        amount: remaining,
        payment_method: "Manual / Cash",
        payment_type: "Lunas",
        payment_date: new Date().toISOString(),
        status: "Terverifikasi",
        proof_url: ""
      });

      if (insertError) return { success: false, error: insertError.message };
    }

    await supabase.from("bookings").update({ payment_status: "Lunas", status: "Lunas" }).eq("id", booking_id);

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/payments");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unauthorized" };
  }
}
