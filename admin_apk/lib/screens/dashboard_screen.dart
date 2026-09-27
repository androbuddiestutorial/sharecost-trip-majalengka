import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'booking_detail_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<dynamic> _bookings = [];
  bool _isLoading = true;
  
  // Stats
  int _totalRevenue = 0;
  int _totalPesanan = 0;
  int _totalPeserta = 0;

  @override
  void initState() {
    super.initState();
    _fetchBookings();
    _fetchStats();
    _setupRealtime();
  }

  Future<void> _fetchStats() async {
    try {
      final payments = await Supabase.instance.client
          .from('payments')
          .select('amount')
          .eq('status', 'Terverifikasi');
          
      int rev = 0;
      for (var p in payments) {
        rev += (p['amount'] as num).toInt();
      }
      
      if (mounted) {
        setState(() => _totalRevenue = rev);
      }
    } catch (e) {
      // Handle silently
    }
  }

  Future<void> _fetchBookings() async {
    setState(() => _isLoading = true);
    try {
      final data = await Supabase.instance.client
          .from('bookings')
          .select('*, trips(date_start, destinations(title))')
          .order('created_at', ascending: false);
          
      int totalPeserta = 0;
      for(var b in data) {
        totalPeserta += (b['pax'] as num?)?.toInt() ?? 1;
      }
          
      setState(() {
        _bookings = data;
        _totalPesanan = data.length;
        _totalPeserta = totalPeserta;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal memuat data: $e')));
        setState(() => _isLoading = false);
      }
    }
  }

  void _setupRealtime() {
    Supabase.instance.client.channel('public:bookings')
      .onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: 'bookings',
        callback: (payload) {
          _fetchBookings();
          _fetchStats();
        },
      )
      .subscribe();
      
    Supabase.instance.client.channel('public:payments')
      .onPostgresChanges(
        event: PostgresChangeEvent.all,
        schema: 'public',
        table: 'payments',
        callback: (payload) {
          _fetchStats();
        },
      )
      .subscribe();
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            CircleAvatar(backgroundColor: color.withOpacity(0.2), child: Icon(icon, color: color)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // Stat section
          Container(
            padding: const EdgeInsets.all(8),
            color: Colors.grey.shade50,
            child: GridView.count(
              shrinkWrap: true,
              crossAxisCount: 2,
              childAspectRatio: 2.5,
              physics: const NeverScrollableScrollPhysics(),
              children: [
                _buildStatCard('Pendapatan', 'Rp ${_totalRevenue.toString()}', Icons.monetization_on, Colors.green),
                _buildStatCard('Total Pesanan', '$_totalPesanan', Icons.shopping_cart, Colors.blue),
                _buildStatCard('Total Peserta', '$_totalPeserta', Icons.people, Colors.orange),
              ],
            ),
          ),
          const Divider(height: 1),
          // List section
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator())
              : _bookings.isEmpty
                ? const Center(child: Text('Belum ada pendaftaran.'))
                : RefreshIndicator(
                    onRefresh: () async {
                      await _fetchBookings();
                      await _fetchStats();
                    },
                    child: ListView.builder(
                      itemCount: _bookings.length,
                      itemBuilder: (context, index) {
                        final booking = _bookings[index];
                        final status = booking['status'] as String? ?? 'Menunggu Verifikasi';
                        
                        Color statusColor = Colors.grey;
                        if (status == 'Menunggu Verifikasi') statusColor = Colors.orange;
                        if (status == 'Lunas' || status == 'Terverifikasi') statusColor = Colors.green;
                        if (status == 'Dibatalkan') statusColor = Colors.red;

                        var tripData = booking['trips'];
                        if (tripData is List && tripData.isNotEmpty) tripData = tripData[0];
                        var destData = tripData?['destinations'];
                        if (destData is List && destData.isNotEmpty) destData = destData[0];
                        
                        final tripTitle = destData?['title'] ?? 'Trip';

                        return Card(
                          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor: statusColor.withOpacity(0.2),
                              child: Icon(Icons.person, color: statusColor),
                            ),
                            title: Text(booking['full_name'] ?? 'Tanpa Nama', style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('$tripTitle - ${booking['whatsapp'] ?? ''}'),
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
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => BookingDetailScreen(booking: booking),
                                ),
                              ).then((_) {
                                _fetchBookings();
                                _fetchStats();
                              });
                            },
                          ),
                        );
                      },
                    ),
                  ),
          )
        ],
      ),
    );
  }
}
