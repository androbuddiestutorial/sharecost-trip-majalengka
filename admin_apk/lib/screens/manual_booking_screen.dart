import 'package:flutter/material.dart';
import 'dart:convert';
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
  final _emailController = TextEditingController();
  final _birthDateController = TextEditingController();
  final _addressController = TextEditingController();
  final _paxController = TextEditingController(text: '1');
  
  // Emergency Contact
  final _emergNameController = TextEditingController();
  final _emergRelController = TextEditingController();
  final _emergWaController = TextEditingController();
  
  // Health
  String _hasHealthCondition = 'Tidak';
  final _healthDescController = TextEditingController();

  // Payment Status
  String _paymentStatus = 'Belum Bayar';
  final _paymentAmountController = TextEditingController();

  // ignore: prefer_final_fields
  String? _gender = 'Laki-laki';
  final String _tripType = 'Open Trip';
  String? _selectedTripId;
  String? _selectedMeetingPoint;
  
  List<dynamic> _trips = [];
  List<dynamic> _meetingPoints = [];
  bool _isLoading = false;

  final List<TextEditingController> _memberNameControllers = [];
  final List<TextEditingController> _memberWaControllers = [];
  final List<TextEditingController> _memberAddressControllers = [];

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _waController.dispose();
    _emailController.dispose();
    _birthDateController.dispose();
    _addressController.dispose();
    _paxController.dispose();
    _emergNameController.dispose();
    _emergRelController.dispose();
    _emergWaController.dispose();
    _healthDescController.dispose();
    _paymentAmountController.dispose();
    for (var c in _memberNameControllers) { c.dispose(); }
    for (var c in _memberWaControllers) { c.dispose(); }
    for (var c in _memberAddressControllers) { c.dispose(); }
    super.dispose();
  }

  void _onTripSelected(String? tripId) {
    setState(() {
      _selectedTripId = tripId;
      _selectedMeetingPoint = null;
      _meetingPoints = [];
      if (tripId != null) {
        final trip = _trips.firstWhere((t) => t['id'].toString() == tripId, orElse: () => null);
        if (trip != null && trip['meeting_points'] != null) {
          try {
            final List<dynamic> mps = trip['meeting_points'] is String ? jsonDecode(trip['meeting_points']) : trip['meeting_points'];
            _meetingPoints = mps.map((e) => Map<String, dynamic>.from(e as Map)).toList();
          } catch(e) { debugPrint('Error parsing meeting points: $e'); }
        }
      }
    });
  }

  Future<void> _fetchData() async {
    final t = await Supabase.instance.client.from('trips').select('*, destinations(title)').eq('status', 'Terbuka');
    setState(() { _trips = t; });
  }

  String _generateBookingCode() {
    return 'MANUAL-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';
  }

  int _calculateTotal() {
    if (_selectedTripId == null) return 0;
    
    int mpPrice = 0;
    if (_selectedMeetingPoint != null) {
      final mp = _meetingPoints.firstWhere((e) => e['name'] == _selectedMeetingPoint, orElse: () => null);
      if (mp != null) {
        mpPrice = mp['price'] ?? 0;
      }
    } else {
      final trip = _trips.firstWhere((t) => t['id'].toString() == _selectedTripId, orElse: () => null);
      mpPrice = (trip != null && trip['price'] != null) ? trip['price'] : 350000;
    }
    
    final pax = int.tryParse(_paxController.text) ?? 1;
    return mpPrice * pax;
  }

  void _updateMembers(String val) {
    int pax = int.tryParse(val) ?? 1;
    int extra = pax > 1 ? pax - 1 : 0;
    
    setState(() {
      while (_memberNameControllers.length < extra) {
        _memberNameControllers.add(TextEditingController());
        _memberWaControllers.add(TextEditingController());
        _memberAddressControllers.add(TextEditingController());
      }
      while (_memberNameControllers.length > extra) {
        _memberNameControllers.removeLast().dispose();
        _memberWaControllers.removeLast().dispose();
        _memberAddressControllers.removeLast().dispose();
      }
    });
  }

  Future<void> _selectDate(TextEditingController controller) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      controller.text = picked.toIso8601String().split('T')[0];
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _selectedTripId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Isi semua data yang wajib')));
      return;
    }
    
    setState(() => _isLoading = true);
    try {
      final totalAmount = _calculateTotal();
      final pax = int.tryParse(_paxController.text) ?? 1;
      
      String initialStatus = "Menunggu Verifikasi";
      String initialPaymentStatus = "Belum Bayar";
      
      if (_paymentStatus == "Lunas") {
        initialStatus = "Lunas";
        initialPaymentStatus = "Lunas";
      } else if (_paymentStatus == "DP") {
        initialStatus = "Terverifikasi";
        initialPaymentStatus = "DP";
      }

      int mpPrice = 0;
      if (_selectedMeetingPoint != null) {
        final mp = _meetingPoints.firstWhere((e) => e['name'] == _selectedMeetingPoint, orElse: () => null);
        if (mp != null) { mpPrice = mp['price'] ?? 0; }
      }

      final inserted = await Supabase.instance.client.from('bookings').insert({
        'booking_code': _generateBookingCode(),
        'trip_id': _selectedTripId,
        'full_name': _nameController.text,
        'whatsapp': _waController.text,
        'email': _emailController.text.isNotEmpty ? _emailController.text : null,
        'birth_date': _birthDateController.text.isNotEmpty ? _birthDateController.text : null,
        'gender': _gender,
        'address': _addressController.text,
        'trip_type': _tripType,
        'meeting_point': _selectedMeetingPoint,
        'meeting_point_price': mpPrice,
        'pax': pax,
        'total_amount': totalAmount,
        'payment_status': initialPaymentStatus,
        'status': initialStatus, 
      }).select().single();

      final bookingId = inserted['id'];

      // Emergency Contact
      if (_emergNameController.text.isNotEmpty) {
        await Supabase.instance.client.from('emergency_contacts').insert({
          'booking_id': bookingId,
          'full_name': _emergNameController.text,
          'relationship': _emergRelController.text,
          'whatsapp': _emergWaController.text,
        });
      }

      // Health Declaration
      await Supabase.instance.client.from('health_declarations').insert({
        'booking_id': bookingId,
        'has_condition': _hasHealthCondition == 'Ya',
        'description': _hasHealthCondition == 'Ya' ? _healthDescController.text : '',
      });

      // Members
      if (_memberNameControllers.isNotEmpty) {
        List<Map<String, dynamic>> membersData = [];
        for (int i = 0; i < _memberNameControllers.length; i++) {
           membersData.add({
             'booking_id': bookingId,
             'full_name': _memberNameControllers[i].text,
             'whatsapp': _memberWaControllers[i].text,
             'address': _memberAddressControllers[i].text,
           });
        }
        await Supabase.instance.client.from('booking_members').insert(membersData);
      }

      // Payment
      if (_paymentStatus == 'Lunas' || _paymentStatus == 'DP') {
        int amountPaid = _paymentStatus == 'Lunas' ? totalAmount : (int.tryParse(_paymentAmountController.text) ?? 0);
        await Supabase.instance.client.from('payments').insert({
          'booking_id': bookingId,
          'amount': amountPaid,
          'payment_method': 'Manual (Admin)',
          'payment_type': 'Transfer',
          'status': 'Terverifikasi',
          'proof_url': ''
        });
      }
      
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
    int total = _calculateTotal();
    
    return Scaffold(
      appBar: AppBar(title: const Text('Tambah Pesanan Manual')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('1. Data Pemesan Utama', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
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
            TextFormField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _birthDateController,
              decoration: const InputDecoration(labelText: 'Tanggal Lahir', border: OutlineInputBorder(), suffixIcon: Icon(Icons.calendar_today)),
              readOnly: true,
              onTap: () => _selectDate(_birthDateController),
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
            
            const SizedBox(height: 24),
            const Text('2. Data Trip', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Pilih Jadwal Trip', border: OutlineInputBorder()),
              value: _selectedTripId,
              items: _trips.map((t) {
                var destData = t['destinations'];
                if (destData is List && destData.isNotEmpty) destData = destData[0];
                final title = destData?['title'] ?? 'Trip';
                return DropdownMenuItem<String>(
                  value: t['id'].toString(),
                  child: Text('$title (Rp ${t['price'] ?? 0})'),
                );
              }).toList(),
              onChanged: _onTripSelected,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Meeting Point (Opsional)', border: OutlineInputBorder()),
              value: _selectedMeetingPoint,
              items: _meetingPoints.map((m) {
                int mpPrice = m['price'] ?? 0;
                String label = m['name'];
                if (mpPrice > 0) label += ' (Rp $mpPrice)';
                return DropdownMenuItem<String>(
                  value: m['name'],
                  child: Text(label),
                );
              }).toList(),
              onChanged: (v) => setState(() => _selectedMeetingPoint = v),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _paxController,
              decoration: const InputDecoration(labelText: 'Jumlah Peserta (Pax)', border: OutlineInputBorder()),
              keyboardType: TextInputType.number,
              onChanged: _updateMembers,
              validator: (v) => v!.isEmpty || (int.tryParse(v) ?? 0) < 1 ? 'Minimal 1' : null,
            ),
            
            if (_memberNameControllers.isNotEmpty) ...[
              const SizedBox(height: 24),
              const Text('Data Anggota Tambahan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              ...List.generate(_memberNameControllers.length, (index) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(border: Border.all(color: Colors.grey.shade300), borderRadius: BorderRadius.circular(8)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Anggota ${index + 1}', style: const TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _memberNameControllers[index],
                          decoration: const InputDecoration(labelText: 'Nama Lengkap', border: OutlineInputBorder(), isDense: true),
                          validator: (v) => v!.isEmpty ? 'Wajib diisi' : null,
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _memberWaControllers[index],
                          decoration: const InputDecoration(labelText: 'No WhatsApp (Opsional)', border: OutlineInputBorder(), isDense: true),
                        ),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _memberAddressControllers[index],
                          decoration: const InputDecoration(labelText: 'Alamat (Opsional)', border: OutlineInputBorder(), isDense: true),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ],
            
            const SizedBox(height: 24),
            const Text('3. Kontak Darurat', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            TextFormField(
              controller: _emergNameController,
              decoration: const InputDecoration(labelText: 'Nama Kontak Darurat', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _emergRelController,
              decoration: const InputDecoration(labelText: 'Hubungan (Ibu, Suami, dll)', border: OutlineInputBorder()),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _emergWaController,
              decoration: const InputDecoration(labelText: 'WhatsApp Darurat', border: OutlineInputBorder()),
              keyboardType: TextInputType.phone,
            ),

            const SizedBox(height: 24),
            const Text('4. Kondisi Kesehatan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Punya riwayat penyakit/alergi?', border: OutlineInputBorder()),
              value: _hasHealthCondition,
              items: ['Ya', 'Tidak'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: (v) => setState(() => _hasHealthCondition = v!),
            ),
            if (_hasHealthCondition == 'Ya') ...[
              const SizedBox(height: 16),
              TextFormField(
                controller: _healthDescController,
                decoration: const InputDecoration(labelText: 'Penjelasan Kondisi', border: OutlineInputBorder()),
                maxLines: 2,
              ),
            ],

            const SizedBox(height: 24),
            const Text('5. Status Pembayaran', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Status Pembayaran Awal', border: OutlineInputBorder()),
              value: _paymentStatus,
              items: ['Belum Bayar', 'DP', 'Lunas'].map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
              onChanged: (v) => setState(() => _paymentStatus = v!),
            ),
            if (_paymentStatus == 'DP') ...[
              const SizedBox(height: 16),
              TextFormField(
                controller: _paymentAmountController,
                decoration: const InputDecoration(labelText: 'Nominal DP yang dibayar (Rp)', border: OutlineInputBorder(), prefixText: 'Rp '),
                keyboardType: TextInputType.number,
                validator: (v) => v!.isEmpty ? 'Wajib diisi jika DP' : null,
              ),
            ],

            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(8)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Total Tagihan:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text('Rp $total', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.blue)),
                ],
              ),
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
