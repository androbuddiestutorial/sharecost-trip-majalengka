import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'trip_form_screen.dart';

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
      setState(() => _isLoading = false);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
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
                
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  child: ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: Colors.teal,
                      child: Icon(Icons.event, color: Colors.white),
                    ),
                    title: Text(destTitle, style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('${trip['date_start']} - ${trip['date_end']}\nKuota: ${trip['quota']} | Sisa: ${trip['sisa_kuota'] ?? trip['quota']}'),
                    isThreeLine: true,
                    trailing: IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () => _deleteTrip(trip['id']),
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
