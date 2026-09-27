import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class ManifestScreen extends StatefulWidget {
  const ManifestScreen({super.key});

  @override
  State<ManifestScreen> createState() => _ManifestScreenState();
}

class _ManifestScreenState extends State<ManifestScreen> {
  List<dynamic> _participants = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchManifest();
  }

  Future<void> _fetchManifest() async {
    setState(() => _isLoading = true);
    try {
      final data = await Supabase.instance.client
          .from('bookings')
          .select('*, trips(date_start, destinations(title)), booking_members(*)')
          .inFilter('status', ['Terverifikasi', 'Lunas'])
          .order('created_at', ascending: false);
          
      List<dynamic> flattened = [];
      for (var booking in data) {
        var tripData = booking['trips'];
        if (tripData is List && tripData.isNotEmpty) tripData = tripData[0];
        var destData = tripData?['destinations'];
        if (destData is List && destData.isNotEmpty) destData = destData[0];
        
        final tripTitle = destData?['title'] ?? 'Trip';
        final tripDate = tripData?['date_start'] ?? '-';

        // Main booker
        flattened.add({
          'name': booking['full_name'],
          'whatsapp': booking['whatsapp'],
          'gender': booking['gender'],
          'status': booking['status'],
          'trip_title': tripTitle,
          'trip_date': tripDate,
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
              'trip_title': tripTitle,
              'trip_date': tripDate,
              'is_main': false,
            });
          }
        }
      }
      
      setState(() {
        _participants = flattened;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _callWa(String? phone) async {
    if (phone == null || phone.isEmpty) return;
    String cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62${cleanPhone.substring(1)}';
    
    final url = Uri.parse('https://wa.me/$cleanPhone');
    
    try {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('WhatsApp gagal dibuka')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Manifest Peserta')),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _participants.isEmpty
          ? const Center(child: Text('Belum ada peserta yang terverifikasi/lunas.'))
          : RefreshIndicator(
              onRefresh: _fetchManifest,
              child: ListView.builder(
                itemCount: _participants.length,
                itemBuilder: (context, index) {
                  final p = _participants[index];
                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: p['is_main'] ? Colors.teal : Colors.teal.shade200,
                        child: Icon(p['is_main'] ? Icons.person : Icons.group, color: Colors.white),
                      ),
                      title: Text(p['name'] ?? '-', style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('${p['trip_title']} (${p['trip_date']})\n${p['status']}'),
                      isThreeLine: true,
                      trailing: IconButton(
                        icon: const Icon(Icons.chat, color: Colors.green),
                        onPressed: () => _callWa(p['whatsapp']),
                      ),
                    ),
                  );
                },
              ),
            ),
    );
  }
}
