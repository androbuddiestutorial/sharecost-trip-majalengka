import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class PaymentsScreen extends StatefulWidget {
  const PaymentsScreen({super.key});

  @override
  State<PaymentsScreen> createState() => _PaymentsScreenState();
}

class _PaymentsScreenState extends State<PaymentsScreen> {
  bool _isLoading = true;
  List<dynamic> _groupedBookings = [];

  @override
  void initState() {
    super.initState();
    _fetchPayments();
  }

  Future<void> _fetchPayments() async {
    setState(() => _isLoading = true);
    try {
      final response = await Supabase.instance.client
          .from('bookings')
          .select('*, payments(*), trips(*)')
          .order('created_at', ascending: false);
          
      // Filter bookings that have payments
      final List<dynamic> bookingsWithPayments = response.where((b) {
        final payments = b['payments'] as List?;
        return payments != null && payments.isNotEmpty;
      }).toList();

      if (mounted) {
        setState(() {
          _groupedBookings = bookingsWithPayments;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching payments: $e');
      if (mounted) {
        setState(() => _isLoading = false);
      }
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

  Future<void> _verifyPayment(int paymentId, Map<String, dynamic> booking) async {
    try {
      // 1. Update status payment manual di tabel payments
      await Supabase.instance.client
          .from('payments')
          .update({'status': 'Terverifikasi'})
          .eq('id', paymentId);
          
      // 2. Sync Booking Status logic (seperti di actions.ts)
      final bookingId = booking['id'];
      
      final List<dynamic> allPayments = await Supabase.instance.client
          .from('payments')
          .select('amount')
          .eq('booking_id', bookingId)
          .eq('status', 'Terverifikasi');
          
      double totalPaid = 0;
      for (var p in allPayments) {
        totalPaid += (p['amount'] ?? 0) as num;
      }
      
      final bData = await Supabase.instance.client
          .from('bookings')
          .select('total_amount')
          .eq('id', bookingId)
          .single();
          
      double totalAmount = (bData['total_amount'] ?? 0) as num;
      
      String newPaymentStatus = "Belum Bayar";
      String newStatus = "Menunggu Verifikasi";

      if (totalPaid > 0) {
        if (totalPaid >= totalAmount && totalAmount > 0) {
          newPaymentStatus = "Lunas";
          newStatus = "Lunas";
        } else {
          newPaymentStatus = "DP";
          newStatus = "Terverifikasi";
        }
      }
      
      await Supabase.instance.client
          .from('bookings')
          .update({'payment_status': newPaymentStatus, 'status': newStatus})
          .eq('id', bookingId);
      
      _fetchPayments();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pembayaran berhasil diverifikasi!')));
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manajemen Pembayaran'),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _groupedBookings.isEmpty
          ? const Center(child: Text('Belum ada data pembayaran.'))
          : RefreshIndicator(
              onRefresh: _fetchPayments,
              child: ListView.builder(
                itemCount: _groupedBookings.length,
                itemBuilder: (context, index) {
                  final booking = _groupedBookings[index];
                  final payments = booking['payments'] as List;
                  final code = booking['booking_code'];
                  final name = booking['full_name'];
                  final paymentStatus = booking['payment_status'];
                  
                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    child: ExpansionTile(
                      title: Text('$code - $name', style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('Status: $paymentStatus'),
                      leading: Icon(
                        paymentStatus == 'Lunas' ? Icons.check_circle : Icons.hourglass_bottom,
                        color: paymentStatus == 'Lunas' ? Colors.green : Colors.orange
                      ),
                      children: payments.map<Widget>((pay) {
                        final payStatus = pay['status'];
                        final proofUrl = pay['proof_url'] as String?;
                        final type = pay['payment_type'] ?? 'Transfer';
                        final method = pay['payment_method'] ?? 'Manual';
                        
                        return ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 0),
                          title: Text('Rp ${pay['amount']}', style: const TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text('$type ($method)\nStatus: $payStatus'),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (proofUrl != null && proofUrl.isNotEmpty)
                                IconButton(
                                  icon: const Icon(Icons.image, color: Colors.blue),
                                  onPressed: () => _showProofImage(proofUrl),
                                ),
                              if (payStatus == 'Menunggu Verifikasi' || payStatus == 'Pending')
                                IconButton(
                                  icon: const Icon(Icons.check_circle, color: Colors.green),
                                  tooltip: 'Verifikasi Pembayaran',
                                  onPressed: () {
                                    showDialog(
                                      context: context,
                                      builder: (c) => AlertDialog(
                                        title: const Text('Verifikasi Pembayaran?'),
                                        content: const Text('Apakah Anda yakin dana sudah masuk?'),
                                        actions: [
                                          TextButton(onPressed: () => Navigator.pop(c), child: const Text('Batal')),
                                          TextButton(
                                            onPressed: () {
                                              Navigator.pop(c);
                                              _verifyPayment(pay['id'], booking);
                                            }, 
                                            child: const Text('Verifikasi')
                                          ),
                                        ],
                                      )
                                    );
                                  },
                                ),
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  );
                },
              ),
            ),
    );
  }
}
