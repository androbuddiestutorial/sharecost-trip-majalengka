import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'trip_form_screen.dart';
import 'trip_participants_screen.dart';

class TripsScreen extends StatefulWidget {
  const TripsScreen({super.key});

  @override
  State<TripsScreen> createState() => _TripsScreenState();
}

class _TripsScreenState extends State<TripsScreen> {
  List<dynamic> _trips = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTrips();
  }

  Future<void> _fetchTrips() async {
    setState(() => _isLoading = true);
    try {
      final data = await Supabase.instance.client
          .from('trips')
          .select('*, destinations(title)')
          .order('date_start', ascending: false);
      setState(() {
        _trips = data;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
      }
    }
  }

  Future<void> _deleteTrip(String id) async {
    try {
      await Supabase.instance.client.from('trips').delete().eq('id', id);
      _fetchTrips();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Jadwal Trip Dihapus')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal hapus: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      body: _trips.isEmpty 
        ? const Center(child: Text('Belum ada jadwal trip.'))
        : RefreshIndicator(
            onRefresh: _fetchTrips,
            child: ListView.builder(
              itemCount: _trips.length,
              itemBuilder: (context, index) {
                final trip = _trips[index];
                var destData = trip['destinations'];
                if (destData is List && destData.isNotEmpty) destData = destData[0];
                
                final destTitle = destData?['title'] ?? 'Destinasi Unknown';
                
                // Cek H-2 Alarm
                Widget? alarmWidget;
                if (trip['date_start'] != null) {
                  try {
                    DateTime startDate = DateTime.parse(trip['date_start']);
                    DateTime now = DateTime.now();
                    // Set time to midnight for accurate day comparison
                    DateTime startMidnight = DateTime(startDate.year, startDate.month, startDate.day);
                    DateTime nowMidnight = DateTime(now.year, now.month, now.day);
                    
                    int diff = startMidnight.difference(nowMidnight).inDays;
                    if (diff >= 0 && diff <= 2) {
                      alarmWidget = Container(
                        margin: const EdgeInsets.only(top: 4),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.red.shade100,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.warning_amber_rounded, color: Colors.red, size: 16),
                            const SizedBox(width: 4),
                            Text(diff == 0 ? 'Hari H!' : 'H-$diff Persiapan!', style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 12)),
                          ],
                        ),
                      );
                    }
                  } catch (e) {
                    // Ignore date parse errors
                  }
                }
                
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  child: ListTile(
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (context) => TripParticipantsScreen(trip: trip)));
                    },
                    leading: const CircleAvatar(
                      backgroundColor: Colors.teal,
                      child: Icon(Icons.event, color: Colors.white),
                    ),
                    title: Text(destTitle, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('${trip['date_start']} - ${trip['date_end']}\nKuota: ${trip['quota']} | Sisa: ${trip['sisa_kuota'] ?? trip['quota']}'),
                        if (alarmWidget != null) alarmWidget,
                      ],
                    ),
                    isThreeLine: true,
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit, color: Colors.blue),
                          onPressed: () async {
                            final result = await Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => TripFormScreen(trip: trip)),
                            );
                            if (result == true) _fetchTrips();
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (c) => AlertDialog(
                                title: const Text('Hapus Jadwal?'),
                                actions: [
                                  TextButton(onPressed: () => Navigator.pop(c), child: const Text('Batal')),
                                  TextButton(onPressed: () { Navigator.pop(c); _deleteTrip(trip['id'].toString()); }, child: const Text('Hapus')),
                                ],
                              )
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const TripFormScreen()),
          );
          if (result == true) {
            _fetchTrips();
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
