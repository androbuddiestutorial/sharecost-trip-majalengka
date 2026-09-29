import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';

class ParticipantDetailScreen extends StatefulWidget {
  final Map<String, dynamic> participant;
  final String tripTitle;
  
  const ParticipantDetailScreen({
    super.key,
    required this.participant,
    required this.tripTitle,
  });

  @override
  State<ParticipantDetailScreen> createState() => _ParticipantDetailScreenState();
}

class _ParticipantDetailScreenState extends State<ParticipantDetailScreen> {
  Map<String, dynamic>? _emergencyContact;
  Map<String, dynamic>? _healthDecl;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchExtraDetails();
  }

  Future<void> _fetchExtraDetails() async {
    try {
      final bookingId = widget.participant['booking']['id'];
      final ecData = await Supabase.instance.client
          .from('emergency_contacts')
          .select()
          .eq('booking_id', bookingId)
          .maybeSingle();
      
      final hdData = await Supabase.instance.client
          .from('health_information')
          .select()
          .eq('booking_id', bookingId)
          .maybeSingle();
          
      if (mounted) {
        setState(() {
          _emergencyContact = ecData;
          _healthDecl = hdData;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _sendWA(String phone, String message) async {
    String cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.startsWith('0')) cleanPhone = '62${cleanPhone.substring(1)}';
    
    final url = Uri.parse('https://wa.me/$cleanPhone?text=${Uri.encodeComponent(message)}');
    try {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('WhatsApp gagal dibuka')));
    }
  }

  Widget _buildRow(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 120, child: Text(label, style: const TextStyle(color: Colors.grey))),
          const Text(': '),
          Expanded(child: Text(value?.toString() ?? '-', style: const TextStyle(fontWeight: FontWeight.bold))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.participant;
    final b = p['booking'];
    
    return Scaffold(
      appBar: AppBar(title: const Text('Detail Peserta')),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Informasi Peserta', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Theme.of(context).colorScheme.primary)),
                      const Divider(),
                      _buildRow('Nama', p['name']),
                      _buildRow('Tipe', p['is_main'] ? 'Pendaftar Utama' : 'Anggota Tambahan'),
                      _buildRow('Kode Booking', b['booking_code']),
                      _buildRow('Jenis Kelamin', p['gender']),
                      _buildRow('WhatsApp', p['whatsapp']),
                      _buildRow('Alamat', p['address'] ?? b['address']),
                      _buildRow('Status', p['status']),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        onPressed: () {
                          final pName = p['name'] ?? 'Kak';
                          final title = widget.tripTitle;
                          final msg = 'Halo Kak $pName,\n\nIni dari admin Sharecost Trip Majalengka.\nTerkait pendaftaran untuk jadwal *$title*, apakah ada yang bisa kami bantu?';
                          _sendWA(p['whatsapp'] ?? '', msg);
                        },
                        icon: const Icon(Icons.chat),
                        label: const Text('Hubungi Peserta (WA)'),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                      )
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Kontak Darurat', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Theme.of(context).colorScheme.primary)),
                      const Divider(),
                      if (_emergencyContact != null) ...[
                        _buildRow('Nama', _emergencyContact!['full_name']),
                        _buildRow('Hubungan', _emergencyContact!['relationship']),
                        _buildRow('WhatsApp', _emergencyContact!['whatsapp']),
                        const SizedBox(height: 12),
                        ElevatedButton.icon(
                          onPressed: () {
                            final ecName = _emergencyContact!['full_name'] ?? 'Bapak/Ibu';
                            final bookerName = b['full_name'] ?? 'Peserta';
                            final title = widget.tripTitle;
                            final msg = 'Halo $ecName,\n\nKami dari Sharecost Trip Majalengka. Kami menghubungi Anda sebagai kontak darurat dari *$bookerName* yang sedang mengikuti jadwal trip *$title*.\n\nKami ingin menginformasikan bahwa...';
                            _sendWA(_emergencyContact!['whatsapp'] ?? '', msg);
                          },
                          icon: const Icon(Icons.warning),
                          label: const Text('Hubungi Darurat (WA)'),
                          style: ElevatedButton.styleFrom(backgroundColor: Colors.orange, foregroundColor: Colors.white),
                        )
                      ] else ...[
                        const Text('Tidak ada data kontak darurat.', style: TextStyle(color: Colors.grey)),
                      ]
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Kondisi Kesehatan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Theme.of(context).colorScheme.primary)),
                      const Divider(),
                      if (_healthDecl != null) ...[
                        _buildRow('Punya Penyakit', _healthDecl!['has_condition'] ? 'Ya' : 'Tidak'),
                        if (_healthDecl!['has_condition'])
                          _buildRow('Penjelasan', _healthDecl!['description']),
                      ] else ...[
                        const Text('Tidak ada data kesehatan.', style: TextStyle(color: Colors.grey)),
                      ]
                    ],
                  ),
                ),
              ),
            ],
          ),
    );
  }
}
