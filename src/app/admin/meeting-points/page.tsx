import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { CreateMeetingPointButton, EditMeetingPointButton, DeleteMeetingPointButton } from "./meeting-points-client";

export const metadata = {
  title: "Kelola Meeting Point - Sharecosttrip Majalengka",
};

export const revalidate = 0;

export default async function AdminMeetingPointsPage() {
  const { data: meetingPoints, error } = await supabase
    .from('meeting_points')
    .select('*')
    .order('created_at', { ascending: false });

  if (error && error.code !== "42P01") { // Ignore if table doesn't exist yet
    console.error("Error fetching meeting points:", error);
  }
  
  const safeMeetingPoints = meetingPoints || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Meeting Point</h2>
        <CreateMeetingPointButton />
      </div>

      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Kota / Lokasi</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeMeetingPoints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">Belum ada data meeting point.</TableCell>
              </TableRow>
            ) : safeMeetingPoints.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <EditMeetingPointButton item={item} />
                  <DeleteMeetingPointButton id={item.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
