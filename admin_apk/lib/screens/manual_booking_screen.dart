import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ManualBookingScreen extends StatefulWidget {
  const ManualBookingScreen({super.key});

  @override
  State<ManualBookingScreen> createState() => _ManualBookingScreenState();
}

class _ManualBookingScreenState extends State<ManualBookingScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _waController = TextEditingController();
  final _addressController = TextEditingController();
  final _paxController = TextEditingController(text: '1');
  
  String? _gender = 'Laki-laki';
  String? _tripType = 'Open Trip';
  String? _selectedTripId;
  String? _selectedMeetingPoint;
  
  List<dynamic> _trips = [];
  List<dynamic> _meetingPoints = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    final t = await Supabase.instance.client.from('trips').select('*, destinations(title)').eq('status', 'Aktif');
    final m = await Supabase.instance.client.from('meeting_points').select();
    setState(() {
      _trips = t;
      _meetingPoints = m;
    });
  }

  String _generateBookingCode() {
    return 'MANUAL-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _selectedTripId == null || _selectedMeetingPoint == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Isi semua data')));
      return;
    }
    
    setState(() => _isLoading = true);
    try {
      final trip = _trips.firstWhere((element) => element['id'].toString() == _selectedTripId);
      final price = trip['price'] ?? 0;
      final pax = int.tryParse(_paxController.text) ?? 1;
      final totalAmount = price * pax;

      await Supabase.instance.client.from('bookings').insert({
        'booking_code': _generateBookingCode(),
        'trip_id': _selectedTripId,
        'full_name': _nameController.text,
        'whatsapp': _waController.text,
        'gender': _gender,
        'address': _addressController.text,
        'trip_type': _tripType,
        'meeting_point': _selectedMeetingPoint,
        'pax': pax,
        'total_amount': totalAmount,
        'payment_status': 'Belum Bayar',
        'status': 'Terverifikasi', // Admin adds it manually, assume it's verified
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Booking berhasil ditambahkan')));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tambah Pesanan Manual')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Nama Lengkap', border: OutlineInputBorder()),
              validator: (v) => v!.isEmpty ? 'Wajib diisi' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _waController,
              decoration: const InputDecoration(labelText: 'WhatsApp', border: OutlineInputBorder()),
              keyboardType: TextInputType.phone,
              validator: (v) => v!.isEmpty ? 'Wajib diisi' : null,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Jenis Kelamin', border: OutlineInputBorder()),
              value: _gender,
              items: ['Laki-laki', 'Perempuan'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: (v) => setState(() => _gender = v),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _addressController,
              decoration: const InputDecoration(labelText: 'Alamat / Domisili', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Pilih Jadwal Trip', border: OutlineInputBorder()),
              value: _selectedTripId,
              items: _trips.map((t) {
                var destData = t['destinations'];
                if (destData is List && destData.isNotEmpty) destData = destData[0];
                final title = destData?['title'] ?? 'Trip';
                return DropdownMenuItem<String>(
                  value: t['id'].toString(),
                  child: Text('$title (${t['date_start']})'),
                );
              }).toList(),
              onChanged: (v) => setState(() => _selectedTripId = v),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Meeting Point', border: OutlineInputBorder()),
              value: _selectedMeetingPoint,
              items: _meetingPoints.map((m) => DropdownMenuItem<String>(
                value: m['name'],
                child: Text(m['name']),
              )).toList(),
              onChanged: (v) => setState(() => _selectedMeetingPoint = v),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _paxController,
              decoration: const InputDecoration(labelText: 'Jumlah Peserta (Pax)', border: OutlineInputBorder()),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(16)),
              child: _isLoading 
                ? const CircularProgressIndicator(color: Colors.white) 
                : const Text('Simpan Pesanan', style: TextStyle(fontSize: 16)),
            )
          ],
        ),
      ),
    );
  }
}
