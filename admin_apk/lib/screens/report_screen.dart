import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ReportScreen extends StatefulWidget {
  const ReportScreen({super.key});

  @override
  State<ReportScreen> createState() => _ReportScreenState();
}

class _ReportScreenState extends State<ReportScreen> {
  bool _isLoading = true;
  int _totalPeserta = 0;
  num _totalPendapatan = 0;
  int _totalTrip = 0;

  @override
  void initState() {
    super.initState();
    _fetchReport();
  }

  Future<void> _fetchReport() async {
    setState(() => _isLoading = true);
    try {
      final payments = await Supabase.instance.client
          .from('payments')
          .select('amount')
          .eq('status', 'Terverifikasi');
          
      num income = 0;
      for (var p in payments) {
        income += p['amount'] ?? 0;
      }
      
      final bookings = await Supabase.instance.client
          .from('bookings')
          .select('pax')
          .inFilter('status', ['Terverifikasi', 'Lunas', 'DP']);
          
      int pax = 0;
      for (var b in bookings) {
        pax += (b['pax'] ?? 1) as int;
      }

      final trips = await Supabase.instance.client.from('trips').select('id');

      setState(() {
        _totalPendapatan = income;
        _totalPeserta = pax;
        _totalTrip = trips.length;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Laporan Pendapatan'),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Card(
                  color: Colors.teal.shade50,
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      children: [
                        const Icon(Icons.account_balance_wallet, size: 48, color: Colors.teal),
                        const SizedBox(height: 16),
                        const Text('Total Pendapatan Terverifikasi', style: TextStyle(fontSize: 16)),
                        Text(
                          'Rp ${_totalPendapatan.toString().replaceAll(RegExp(r'\\B(?=(\\d{3})+(?!\\d))'), '.')}', 
                          style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.teal)
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              const Icon(Icons.people, size: 32, color: Colors.blue),
                              const SizedBox(height: 8),
                              const Text('Total Peserta'),
                              Text('$_totalPeserta', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: Card(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              const Icon(Icons.event, size: 32, color: Colors.orange),
                              const SizedBox(height: 8),
                              const Text('Total Trip'),
                              Text('$_totalTrip', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const Spacer(),
                const Text('Catatan: Fitur Export ke PDF/Excel (Cetak) sedang dalam pengembangan. Silakan screenshot layar ini untuk laporan sementara.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
              ],
            ),
          ),
    );
  }
}
