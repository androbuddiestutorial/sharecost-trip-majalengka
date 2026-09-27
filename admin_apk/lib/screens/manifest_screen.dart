import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class ManifestScreen extends StatefulWidget {
  const ManifestScreen({super.key});

  @override
  State<ManifestScreen> createState() => _ManifestScreenState();
}

class _ManifestScreenState extends State<ManifestScreen> {
  List<dynamic> _trips = [];
  String? _selectedTripId;
  List<dynamic> _participants = [];
  bool _isLoadingTrips = true;
  bool _isLoadingParticipants = false;

  @override
  void initState() {
    super.initState();
    _fetchTrips();
  }

  Future<void> _fetchTrips() async {
    try {
      final data = await Supabase.instance.client
          .from('trips')
          .select('*, destinations(title)')
          .order('date_start', ascending: false);
      setState(() {
        _trips = data;
        _isLoadingTrips = false;
        if (data.isNotEmpty) {
          _selectedTripId = data.first['id'].toString();
          _fetchParticipants(_selectedTripId!);
        }
      });
    } catch (e) {
      setState(() => _isLoadingTrips = false);
    }
  }

  Future<void> _fetchParticipants(String tripId) async {
    setState(() => _isLoadingParticipants = true);
    try {
      // Fetch bookings for this trip that are Terverifikasi or Lunas
      final data = await Supabase.instance.client
          .from('bookings')
          .select('*, booking_members(*)')
          .eq('trip_id', tripId)
          .inFilter('status', ['Terverifikasi', 'Lunas'])
          .order('created_at', ascending: true);
          
      List<dynamic> flattened = [];
      for (var booking in data) {
        // Main booker
        flattened.add({
          'name': booking['full_name'],
          'whatsapp': booking['whatsapp'],
          'gender': booking['gender'],
          'status': booking['status'],
          'is_main': true,
        });
        
        // Additional members
        var members = booking['booking_members'];
        if (members is List) {
          for (var m in members) {
            flattened.add({
              'name': m['full_name'],
              'whatsapp': m['whatsapp'] ?? booking['whatsapp'],
              'gender': m['gender'],
              'status': booking['status'],
              'is_main': false,
            });
          }
        }
      }
      
      setState(() {
        _participants = flattened;
        _isLoadingParticipants = false;
      });
    } catch (e) {
      setState(() => _isLoadingParticipants = false);
    }
  }

  Future<void> _callWa(String? phone) async {
    if (phone == null || phone.isEmpty) return;
    String cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62${cleanPhone.substring(1)}';
    
    final url = Uri.parse('whatsapp://send?phone=$cleanPhone');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.teal.shade50,
            child: _isLoadingTrips 
              ? const Center(child: CircularProgressIndicator())
              : DropdownButtonFormField<String>(
                  decoration: const InputDecoration(
                    labelText: 'Pilih Jadwal Trip',
                    border: OutlineInputBorder(borderSide: BorderSide.none),
                    filled: true,
                    fillColor: Colors.white,
                  ),
                  value: _selectedTripId,
                  isExpanded: true,
                  items: _trips.map((t) {
                    var destData = t['destinations'];
                    if (destData is List && destData.isNotEmpty) destData = destData[0];
                    final title = destData?['title'] ?? 'Trip';
                    return DropdownMenuItem<String>(
                      value: t['id'].toString(),
                      child: Text('$title (${t['date_start']})'),
                    );
                  }).toList(),
                  onChanged: (val) {
                    setState(() => _selectedTripId = val);
                    if (val != null) _fetchParticipants(val);
                  },
                ),
          ),
          Expanded(
            child: _isLoadingParticipants 
              ? const Center(child: CircularProgressIndicator())
              : _participants.isEmpty
                ? const Center(child: Text('Belum ada peserta yang terverifikasi/lunas.'))
                : ListView.builder(
                    itemCount: _participants.length,
                    itemBuilder: (context, index) {
                      final p = _participants[index];
                      return ListTile(
                        leading: CircleAvatar(
                          backgroundColor: p['is_main'] ? Colors.teal : Colors.teal.shade200,
                          child: Text((index + 1).toString(), style: const TextStyle(color: Colors.white)),
                        ),
                        title: Text(p['name'] ?? '-', style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('${p['gender']} | ${p['status']}'),
                        trailing: IconButton(
                          icon: const Icon(Icons.chat, color: Colors.green),
                          onPressed: () => _callWa(p['whatsapp']),
                        ),
                      );
                    },
                  ),
          )
        ],
      ),
    );
  }
}
