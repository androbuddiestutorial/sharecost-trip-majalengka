import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class BookingDetailScreen extends StatefulWidget {
  final Map<String, dynamic> booking;

  const BookingDetailScreen({super.key, required this.booking});

  @override
  State<BookingDetailScreen> createState() => _BookingDetailScreenState();
}

class _BookingDetailScreenState extends State<BookingDetailScreen> {
  late String _currentStatus;
  bool _isUpdating = false;

  @override
  void initState() {
    super.initState();
    _currentStatus = widget.booking['status'] ?? 'Menunggu Verifikasi';
  }

  Future<void> _updateStatus(String newStatus) async {
    setState(() => _isUpdating = true);
    try {
      await Supabase.instance.client
          .from('bookings')
          .update({'status': newStatus})
          .eq('id', widget.booking['id']);
      
      setState(() => _currentStatus = newStatus);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Status berhasil diupdate!')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal update: $e')));
      }
    } finally {
      setState(() => _isUpdating = false);
    }
  }

  Future<void> _openWhatsApp() async {
    final phone = widget.booking['whatsapp_number'] as String?;
    if (phone == null || phone.isEmpty) return;

    // Bersihkan nomor (ganti 0 dengan 62)
    String cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62${cleanPhone.substring(1)}';
    }

    final name = widget.booking['participant_name'] ?? 'Peserta';
    final code = widget.booking['booking_code'] ?? '-';
    
    final message = "Halo Kak $name,\n\nTerima kasih telah mendaftar di Sharecosttrip Majalengka!\n\nBooking Code: *$code*\nStatus saat ini: *$_currentStatus*\n\nSilakan balas pesan ini jika ada pertanyaan terkait keberangkatan atau pembayaran.";
    
    final url = Uri.parse('whatsapp://send?phone=$cleanPhone&text=${Uri.encodeComponent(message)}');
    
    try {
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      } else {
        throw 'Tidak dapat membuka WhatsApp.';
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('WhatsApp tidak terinstall atau error.')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final b = widget.booking;
    return Scaffold(
      appBar: AppBar(
        title: Text('Detail: ${b['booking_code'] ?? '-'}'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Informasi Pemesan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    const Divider(),
                    _buildRow('Nama', b['participant_name']),
                    _buildRow('WhatsApp', b['whatsapp_number']),
                    _buildRow('Email', b['email']),
                    _buildRow('Jenis Kelamin', b['gender']),
                    _buildRow('Alamat', b['address']),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Detail Trip', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    const Divider(),
                    _buildRow('Trip', b['trip']?['name'] ?? 'Trip Tidak Diketahui'),
                    _buildRow('Tipe Booking', b['booking_type']),
                    _buildRow('Meeting Point', b['meeting_point']),
                    _buildRow('Total Peserta', '${b['participants_count']} Orang'),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Status Pembayaran', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    const Divider(),
                    DropdownButtonFormField<String>(
                      value: _currentStatus,
                      decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Ubah Status'),
                      items: const [
                        DropdownMenuItem(value: 'Menunggu Verifikasi', child: Text('Menunggu Verifikasi')),
                        DropdownMenuItem(value: 'DP Selesai', child: Text('DP Selesai')),
                        DropdownMenuItem(value: 'Lunas', child: Text('Lunas')),
                        DropdownMenuItem(value: 'Dibatalkan', child: Text('Dibatalkan')),
                      ],
                      onChanged: _isUpdating ? null : (val) {
                        if (val != null) _updateStatus(val);
                      },
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 80), // Padding for FAB
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openWhatsApp,
        icon: const Icon(Icons.chat),
        label: const Text('Hubungi via WA'),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
    );
  }

  Widget _buildRow(String label, dynamic value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 120, child: Text(label, style: const TextStyle(color: Colors.grey))),
          Expanded(child: Text(value?.toString() ?? '-', style: const TextStyle(fontWeight: FontWeight.w500))),
        ],
      ),
    );
  }
}
