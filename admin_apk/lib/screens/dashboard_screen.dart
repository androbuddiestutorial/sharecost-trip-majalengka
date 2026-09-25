import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<dynamic> _bookings = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchBookings();
    _setupRealtime();
  }

  Future<void> _fetchBookings() async {
    setState(() => _isLoading = true);
    try {
      final data = await Supabase.instance.client
          .from('bookings')
          .select('*, trip:trips(name)')
          .order('created_at', ascending: false)
          .limit(50);
          
      setState(() {
        _bookings = data;
        _isLoading = false;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat data: $e')),
      );
      setState(() => _isLoading = false);
    }
  }

  void _setupRealtime() {
    Supabase.instance.client.channel('public:bookings')
      .onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: 'bookings',
        callback: (payload) {
          // Refresh list on any change
          _fetchBookings();
        },
      )
      .subscribe();
  }

  Future<void> _logout() async {
    await Supabase.instance.client.auth.signOut();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin Dashboard'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _fetchBookings,
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _bookings.isEmpty
          ? const Center(child: Text('Belum ada pendaftaran.'))
          : RefreshIndicator(
              onRefresh: _fetchBookings,
              child: ListView.builder(
                itemCount: _bookings.length,
                itemBuilder: (context, index) {
                  final booking = _bookings[index];
                  final status = booking['status'] as String;
                  
                  Color statusColor = Colors.grey;
                  if (status == 'Menunggu Verifikasi') statusColor = Colors.orange;
                  if (status == 'Lunas' || status == 'DP Selesai') statusColor = Colors.green;
                  if (status == 'Dibatalkan') statusColor = Colors.red;

                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: statusColor.withOpacity(0.2),
                        child: Icon(Icons.person, color: statusColor),
                      ),
                      title: Text(booking['participant_name'] ?? 'Tanpa Nama', style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('${booking['trip']?['name'] ?? 'Trip'} - ${booking['whatsapp_number'] ?? ''}'),
                      trailing: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: statusColor,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          status,
                          style: const TextStyle(color: Colors.white, fontSize: 12),
                        ),
                      ),
                      onTap: () {
                        // Nanti diarahkan ke DetailScreen
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Tapped ${booking['booking_code']}')),
                        );
                      },
                    ),
                  );
                },
              ),
            ),
    );
  }
}
