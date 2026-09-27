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
  List<dynamic> _payments = [];
  bool _isLoadingPayments = true;

  @override
  void initState() {
    super.initState();
    _currentStatus = widget.booking['status'] ?? 'Menunggu Verifikasi';
    _fetchPayments();
  }

  Future<void> _fetchPayments() async {
    setState(() => _isLoadingPayments = true);
    try {
      final data = await Supabase.instance.client
          .from('payments')
          .select()
          .eq('booking_id', widget.booking['id'])
          .order('created_at', ascending: false);
      setState(() {
        _payments = data;
        _isLoadingPayments = false;
      });
    } catch (e) {
      setState(() => _isLoadingPayments = false);
    }
  }

  Future<void> _verifyPayment(int paymentId, String status) async {
    try {
      await Supabase.instance.client
          .from('payments')
          .update({'status': status})
          .eq('id', paymentId);
      
      _fetchPayments();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Pembayaran diubah menjadi $status')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
    }
  }

  void _showProofImage(String url) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        child: Stack(
          children: [
            InteractiveViewer(
              child: Image.network(url, fit: BoxFit.contain),
            ),
            Positioned(
              top: 0, right: 0,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.black, size: 30),
                onPressed: () => Navigator.pop(context),
              ),
            )
          ],
        ),
      ),
    );
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
    final phone = widget.booking['whatsapp'] as String?;
    if (phone == null || phone.isEmpty) return;

    // Bersihkan nomor (ganti 0 dengan 62)
    String cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62${cleanPhone.substring(1)}';
    }

    final name = widget.booking['full_name'] ?? 'Peserta';
    final code = widget.booking['booking_code'] ?? '-';
    
    final message = "Halo Kak $name,\n\nTerima kasih telah mendaftar di Sharecosttrip Majalengka!\n\nBooking Code: *$code*\nStatus saat ini: *$_currentStatus*\n\nSilakan balas pesan ini jika ada pertanyaan terkait keberangkatan atau pembayaran.";
    
    final url = Uri.parse('https://wa.me/$cleanPhone?text=${Uri.encodeComponent(message)}');
    
    try {
      await launchUrl(url, mode: LaunchMode.externalApplication);
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
    
    // Safety check for relations
    var tripData = b['trips'];
    if (tripData is List && tripData.isNotEmpty) tripData = tripData[0];
    var destData = tripData?['destinations'];
    if (destData is List && destData.isNotEmpty) destData = destData[0];
    
    final tripTitle = destData?['title'] ?? 'Trip Tidak Diketahui';
    final tripDate = tripData?['date_start'] ?? '-';

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
                    _buildRow('Nama', b['full_name']),
                    _buildRow('WhatsApp', b['whatsapp']),
                    _buildRow('Email', b['email']),
                    _buildRow('Jenis Kelamin', b['gender']),
                    _buildRow('Tgl Lahir', b['birth_date']),
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
                    _buildRow('Trip', tripTitle),
                    _buildRow('Jadwal', tripDate),
                    _buildRow('Tipe Booking', b['trip_type']),
                    _buildRow('Meeting Point', b['meeting_point']),
                    _buildRow('Total Peserta', '${b['pax']} Orang'),
                    _buildRow('Total Tagihan', 'Rp ${b['total_amount'] ?? 0}'),
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
                    const Text('Status Pesanan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                    const Divider(),
                    _buildRow('Status', b['payment_status']),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: _currentStatus,
                      decoration: const InputDecoration(border: OutlineInputBorder(), labelText: 'Ubah Status Pesanan'),
                      items: const [
                        DropdownMenuItem(value: 'Menunggu Verifikasi', child: Text('Menunggu Verifikasi')),
                        DropdownMenuItem(value: 'Terverifikasi', child: Text('Terverifikasi (DP/Lunas)')),
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
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Riwayat Pembayaran', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        if (_isLoadingPayments) const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                      ],
                    ),
                    const Divider(),
                    if (!_isLoadingPayments && _payments.isEmpty)
                      const Text('Belum ada pembayaran.', style: TextStyle(color: Colors.grey)),
                    if (!_isLoadingPayments && _payments.isNotEmpty)
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _payments.length,
                        itemBuilder: (context, index) {
                          final pay = _payments[index];
                          final payStatus = pay['status'];
                          final proofUrl = pay['proof_url'] as String?;

                          return ListTile(
                            contentPadding: EdgeInsets.zero,
                            title: Text('Rp ${pay['amount']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                            subtitle: Text('${pay['payment_method']} | $payStatus'),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (proofUrl != null && proofUrl.isNotEmpty)
                                  IconButton(
                                    icon: const Icon(Icons.image, color: Colors.blue),
                                    onPressed: () => _showProofImage(proofUrl),
                                  ),
                                if (payStatus == 'Menunggu Verifikasi')
                                  IconButton(
                                    icon: const Icon(Icons.check_circle, color: Colors.green),
                                    onPressed: () => _verifyPayment(pay['id'], 'Terverifikasi'),
                                  ),
                              ],
                            ),
                          );
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
