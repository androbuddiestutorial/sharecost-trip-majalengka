import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class TripParticipantsScreen extends StatefulWidget {
  final Map<String, dynamic> trip;
  const TripParticipantsScreen({super.key, required this.trip});

  @override
  State<TripParticipantsScreen> createState() => _TripParticipantsScreenState();
}

class _TripParticipantsScreenState extends State<TripParticipantsScreen> {
  List<dynamic> _participants = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchParticipants();
  }

  Future<void> _fetchParticipants() async {
    setState(() => _isLoading = true);
    try {
      final data = await Supabase.instance.client
          .from('bookings')
          .select('*, booking_members(*)')
          .eq('trip_id', widget.trip['id'])
          .order('created_at', ascending: true);
          
      List<dynamic> flattened = [];
      for (var booking in data) {
        flattened.add({
          'name': booking['full_name'],
          'whatsapp': booking['whatsapp'],
          'gender': booking['gender'],
          'status': booking['status'],
          'is_main': true,
        });
        
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
    var destData = widget.trip['destinations'];
    if (destData is List && destData.isNotEmpty) destData = destData[0];
    final title = destData?['title'] ?? 'Trip';

    return Scaffold(
      appBar: AppBar(title: Text('Peserta $title')),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _participants.isEmpty
          ? const Center(child: Text('Belum ada peserta untuk jadwal ini.'))
          : RefreshIndicator(
              onRefresh: _fetchParticipants,
              child: ListView.builder(
                itemCount: _participants.length,
                itemBuilder: (context, index) {
                  final p = _participants[index];
                  Color statusColor = Colors.grey;
                  if (p['status'] == 'Lunas' || p['status'] == 'Terverifikasi') statusColor = Colors.green;
                  else if (p['status'] == 'DP') statusColor = Colors.orange;

                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: p['is_main'] ? Colors.teal : Colors.teal.shade200,
                        child: Text((index + 1).toString(), style: const TextStyle(color: Colors.white)),
                      ),
                      title: Text(p['name'] ?? '-', style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('${p['gender']}\nStatus: ${p['status']}'),
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
