import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shimmer/shimmer.dart';
import 'package:fl_chart/fl_chart.dart';
import 'booking_detail_screen.dart';
import 'manual_booking_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  List<dynamic> _bookings = [];
  List<dynamic> _filteredBookings = [];
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  
  bool _isLoading = true;
  
  // Stats
  int _totalRevenue = 0;
  int _totalPesanan = 0;
  int _totalPeserta = 0;
  
  // Chart data
  List<FlSpot> _chartData = [];

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

  void _filterBookings(String query) {
    setState(() {
      _searchQuery = query;
      if (query.isEmpty) {
        _filteredBookings = _bookings;
      } else {
        _filteredBookings = _bookings.where((b) {
          final name = (b['full_name'] ?? '').toString().toLowerCase();
          final wa = (b['whatsapp'] ?? '').toString().toLowerCase();
          final code = (b['booking_code'] ?? '').toString().toLowerCase();
          final q = query.toLowerCase();
          return name.contains(q) || wa.contains(q) || code.contains(q);
        }).toList();
      }
    });
  }

  void _processChartData(List<dynamic> data) {
    // Kelompokkan pendaftar berdasarkan hari dalam seminggu terakhir
    Map<int, int> counts = {};
    DateTime now = DateTime.now();
    
    // Initialize last 7 days with 0
    for (int i = 0; i < 7; i++) {
      counts[i] = 0;
    }
    
    for (var b in data) {
      if (b['created_at'] != null) {
        DateTime createdAt = DateTime.parse(b['created_at']).toLocal();
        int diffDays = now.difference(createdAt).inDays;
        if (diffDays >= 0 && diffDays < 7) {
          counts[6 - diffDays] = (counts[6 - diffDays] ?? 0) + 1;
        }
      }
    }
    
    List<FlSpot> spots = [];
    for (int i = 0; i < 7; i++) {
      spots.add(FlSpot(i.toDouble(), counts[i]!.toDouble()));
    }
    
    _chartData = spots;
  }

  Future<void> _fetchBookings() async {
    setState(() => _isLoading = true);
    try {
      final data = await Supabase.instance.client
          .from('bookings')
          .select('*, trips(date_start, destinations(title)), booking_members(*)')
          .order('created_at', ascending: false);
          
      int totalPeserta = 0;
      for(var b in data) {
        totalPeserta += (b['pax'] as num?)?.toInt() ?? 1;
      }
      
      _processChartData(data);
          
      setState(() {
        _bookings = data;
        _filteredBookings = data;
        _totalPesanan = data.length;
        _totalPeserta = totalPeserta;
        _isLoading = false;
      });
      
      if (_searchQuery.isNotEmpty) {
        _filterBookings(_searchQuery);
      }
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
            CircleAvatar(backgroundColor: color.withValues(alpha: 0.2), child: Icon(icon, color: color)),
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

  Widget _buildShimmerList() {
    return ListView.builder(
      itemCount: 5,
      itemBuilder: (context, index) {
        return Card(
          margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: ListTile(
            leading: Shimmer.fromColors(
              baseColor: Colors.grey.shade300,
              highlightColor: Colors.grey.shade100,
              child: const CircleAvatar(backgroundColor: Colors.white),
            ),
            title: Shimmer.fromColors(
              baseColor: Colors.grey.shade300,
              highlightColor: Colors.grey.shade100,
              child: Container(width: double.infinity, height: 16, color: Colors.white),
            ),
            subtitle: Shimmer.fromColors(
              baseColor: Colors.grey.shade300,
              highlightColor: Colors.grey.shade100,
              child: Container(width: 100, height: 12, color: Colors.white),
            ),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inbox_rounded, size: 80, color: Colors.grey.shade400),
          const SizedBox(height: 16),
          Text(
            _searchQuery.isNotEmpty ? 'Pesanan tidak ditemukan' : 'Wah, belum ada pesanan bulan ini',
            style: TextStyle(fontSize: 16, color: Colors.grey.shade600, fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }

  Widget _buildChart() {
    if (_chartData.isEmpty) return const SizedBox.shrink();
    
    return Container(
      height: 120,
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Tren Pendaftar (7 Hari Terakhir)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey)),
          const SizedBox(height: 8),
          Expanded(
            child: LineChart(
              LineChartData(
                gridData: const FlGridData(show: false),
                titlesData: const FlTitlesData(show: false),
                borderData: FlBorderData(show: false),
                minX: 0, maxX: 6,
                minY: 0,
                lineBarsData: [
                  LineChartBarData(
                    spots: _chartData,
                    isCurved: true,
                    color: Colors.blue,
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: true),
                    belowBarData: BarAreaData(show: true, color: Colors.blue.withValues(alpha: 0.2)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const ManualBookingScreen())).then((_) {
            _fetchBookings();
            _fetchStats();
          });
        },
        icon: const Icon(Icons.add),
        label: const Text('Pesanan Baru'),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
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
          
          if (!_isLoading) _buildChart(),
          
          const Divider(height: 1),
          // Search section
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            child: TextField(
              controller: _searchController,
              onChanged: _filterBookings,
              decoration: InputDecoration(
                hintText: 'Cari nama, WA, atau kode booking...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty 
                  ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchController.clear(); _filterBookings(''); })
                  : null,
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
              ),
            ),
          ),
  
          // List section
          Expanded(
            child: _isLoading 
              ? _buildShimmerList()
              : _filteredBookings.isEmpty
                ? _buildEmptyState()
                : RefreshIndicator(
                    onRefresh: () async {
                      await _fetchBookings();
                      await _fetchStats();
                    },
                    child: ListView.builder(
                      itemCount: _filteredBookings.length,
                      itemBuilder: (context, index) {
                        final booking = _filteredBookings[index];
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
                              backgroundColor: statusColor.withValues(alpha: 0.2),
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
