import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import 'participant_detail_screen.dart';

class TripParticipantsScreen extends StatefulWidget {
  final Map<String, dynamic> trip;
  const TripParticipantsScreen({super.key, required this.trip});

  @override
  State<TripParticipantsScreen> createState() => _TripParticipantsScreenState();
}

class _TripParticipantsScreenState extends State<TripParticipantsScreen> {
  List<dynamic> _bookings = [];
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
      
      setState(() {
        _bookings = data;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _shareManifest() async {
    if (_bookings.isEmpty) return;
    
    var destData = widget.trip['destinations'];
    if (destData is List && destData.isNotEmpty) destData = destData[0];
    final title = destData?['title'] ?? 'Trip';
    
    String text = '*MANIFEST $title*\\n';
    text += 'Tanggal: \${widget.trip['date_start']} s/d \${widget.trip['date_end']}\\n\\n';
    text += 'Daftar Peserta:\\n';
    
    int index = 1;
    for (var b in _bookings) {
      text += '$index. \${b['full_name']} (\${b['whatsapp'] ?? '-'}) - \${b['status']}\\n';
      index++;
      var members = b['booking_members'];
      if (members is List) {
        for (var m in members) {
          text += '   - \${m['full_name']} (\${m['whatsapp'] ?? b['whatsapp'] ?? '-'})\\n';
        }
      }
    }
    
    final url = Uri.parse('https://wa.me/?text=\${Uri.encodeComponent(text)}');
    try {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('WhatsApp gagal dibuka')));
    }
  }
  
  Future<void> _callWa(String? phone, String name, String tripTitle) async {
    if (phone == null || phone.isEmpty) return;
    String cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62\${cleanPhone.substring(1)}';
    
    String msg = 'Halo Kak $name,\\n\\nIni dari admin Sharecost Trip Majalengka.\\nTerkait pendaftaran untuk jadwal *$tripTitle*, apakah ada yang bisa kami bantu?';
    
    final url = Uri.parse('https://wa.me/$cleanPhone?text=\${Uri.encodeComponent(msg)}');
    
    try {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('WhatsApp gagal dibuka')));
    }
  }

  void _openDetail(Map<String, dynamic> participantMap, String title) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ParticipantDetailScreen(
          participant: participantMap,
          tripTitle: title,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    var destData = widget.trip['destinations'];
    if (destData is List && destData.isNotEmpty) destData = destData[0];
    final title = destData?['title'] ?? 'Trip';

    return Scaffold(
      appBar: AppBar(
        title: Text('Peserta $title'),
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            tooltip: 'Bagikan Manifest',
            onPressed: _shareManifest,
          )
        ],
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _bookings.isEmpty
          ? const Center(child: Text('Belum ada peserta untuk jadwal ini.'))
          : RefreshIndicator(
              onRefresh: _fetchParticipants,
              child: ListView.builder(
                itemCount: _bookings.length,
                itemBuilder: (context, index) {
                  final booking = _bookings[index];
                  
                  Color statusColor = Colors.grey;
                  if (booking['status'] == 'Lunas' || booking['status'] == 'Terverifikasi') {
                    statusColor = Colors.green;
                  } else if (booking['status'] == 'DP') {
                    statusColor = Colors.orange;
                  }

                  var members = booking['booking_members'] as List<dynamic>? ?? [];
                  int totalPax = 1 + members.length;

                  // Pendaftar Utama mapping
                  final mainParticipantMap = {
                    'name': booking['full_name'],
                    'whatsapp': booking['whatsapp'],
                    'gender': booking['gender'],
                    'address': booking['address'],
                    'status': booking['status'],
                    'is_main': true,
                    'booking': booking,
                  };

                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    child: ExpansionTile(
                      leading: CircleAvatar(
                        backgroundColor: statusColor,
                        child: Text(totalPax.toString(), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                      ),
                      title: Text(booking['full_name'] ?? '-', style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('Status: \${booking['status']} | Kode: \${booking['booking_code']}'),
                      children: [
                        // List Item untuk Pendaftar Utama
                        ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 32, vertical: 0),
                          leading: const Icon(Icons.person, color: Colors.teal),
                          title: Text(booking['full_name'] ?? '-', style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: const Text('Pendaftar Utama'),
                          trailing: IconButton(
                            icon: const Icon(Icons.chat, color: Colors.green),
                            onPressed: () => _callWa(booking['whatsapp'], booking['full_name'] ?? 'Kak', title),
                          ),
                          onTap: () => _openDetail(mainParticipantMap, title),
                        ),
                        // List Item untuk Anggota Tambahan
                        ...members.map((m) {
                          final memberMap = {
                            'name': m['full_name'],
                            'whatsapp': m['whatsapp'] ?? booking['whatsapp'],
                            'gender': m['gender'],
                            'address': m['address'] ?? booking['address'],
                            'status': booking['status'],
                            'is_main': false,
                            'booking': booking,
                          };
                          
                          return ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 32, vertical: 0),
                            leading: const Icon(Icons.person_outline, color: Colors.blueGrey),
                            title: Text(m['full_name'] ?? '-', style: const TextStyle(fontWeight: FontWeight.w500)),
                            subtitle: Text(m['whatsapp'] ?? 'Tanpa WA (Ikut Utama)'),
                            trailing: IconButton(
                              icon: const Icon(Icons.chat, color: Colors.green),
                              onPressed: () => _callWa(m['whatsapp'] ?? booking['whatsapp'], m['full_name'] ?? 'Kak', title),
                            ),
                            onTap: () => _openDetail(memberMap, title),
                          );
                        }),
                      ],
                    ),
                  );
                },
              ),
            ),
    );
  }
}
