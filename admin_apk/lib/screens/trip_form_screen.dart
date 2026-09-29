import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:supabase_flutter/supabase_flutter.dart';

class TripFormScreen extends StatefulWidget {
  final Map<String, dynamic>? trip;
  const TripFormScreen({super.key, this.trip});

  @override
  State<TripFormScreen> createState() => _TripFormScreenState();
}

class _TripFormScreenState extends State<TripFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _dateStartController = TextEditingController();
  final _dateEndController = TextEditingController();
    final _quotaController = TextEditingController();
  final _priceController = TextEditingController(text: '0');
  String _status = 'Terbuka';
  String _tripType = 'Open Trip';
  
  String? _selectedDestinationId;
  List<dynamic> _destinations = [];
  bool _isLoading = false;
  List<Map<String, dynamic>> _meetingPoints = [];

  @override
  void initState() {
    super.initState();
    _fetchDestinations();
    if (widget.trip != null) {
      _selectedDestinationId = widget.trip!['destination_id']?.toString();
      _dateStartController.text = widget.trip!['date_start'] ?? '';
      _dateEndController.text = widget.trip!['date_end'] ?? '';
      _quotaController.text = (widget.trip!['quota'] ?? '').toString();
      _priceController.text = (widget.trip!['price'] ?? 0).toString();
      _status = widget.trip!['status'] ?? 'Terbuka';
      _tripType = widget.trip!['trip_type'] ?? 'Open Trip';
      if (widget.trip!['meeting_points'] != null) {
        try {
          final List<dynamic> mps = widget.trip!['meeting_points'] is String ? jsonDecode(widget.trip!['meeting_points']) : widget.trip!['meeting_points'];
          _meetingPoints = mps.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        } catch(e) { debugPrint('Error parsing meeting points: $e'); }
      }
    }
  }

  Future<void> _fetchDestinations() async {
    final data = await Supabase.instance.client.from('destinations').select('id, title');
    setState(() => _destinations = data);
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || _selectedDestinationId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Isi semua form & pilih destinasi')));
      return;
    }
    
    setState(() => _isLoading = true);
    try {
      final quota = int.tryParse(_quotaController.text) ?? 0;
      
      final data = {
        'destination_id': _selectedDestinationId,
        'date_start': _dateStartController.text,
        'date_end': _dateEndController.text,
        'quota': quota,
        'status': _status,
        'trip_type': _tripType,
        'price': int.tryParse(_priceController.text) ?? 0,
        'meeting_points': _meetingPoints.where((mp) => (mp['name']?.toString() ?? '').trim().isNotEmpty).toList(),
      };

      if (widget.trip != null) {
        await Supabase.instance.client.from('trips').update(data).eq('id', widget.trip!['id']);
      } else {
        await Supabase.instance.client.from('trips').insert(data);
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(widget.trip != null ? 'Jadwal diperbarui' : 'Jadwal ditambahkan')));
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _selectDate(TextEditingController controller) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime(DateTime.now().year + 5),
    );
    if (picked != null) {
      // Format YYYY-MM-DD
      controller.text = picked.toIso8601String().split('T')[0];
    }
  }

  @override
  void dispose() {
    _dateStartController.dispose();
    _dateEndController.dispose();
    _quotaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.trip != null ? 'Edit Jadwal Trip' : 'Tambah Jadwal Trip')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Pilih Destinasi', border: OutlineInputBorder()),
              // ignore: deprecated_member_use
              initialValue: _selectedDestinationId,
              items: _destinations.map((d) => DropdownMenuItem<String>(
                initialValue: d['id'].toString(),
                child: Text(d['title']),
              )).toList(),
              onChanged: (val) => setState(() => _selectedDestinationId = val),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _dateStartController,
                    decoration: const InputDecoration(labelText: 'Tgl Mulai', border: OutlineInputBorder(), suffixIcon: Icon(Icons.calendar_today)),
                    readOnly: true,
                    onTap: () => _selectDate(_dateStartController),
                    validator: (v) => v!.isEmpty ? 'Wajib' : null,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: TextFormField(
                    controller: _dateEndController,
                    decoration: const InputDecoration(labelText: 'Tgl Selesai', border: OutlineInputBorder(), suffixIcon: Icon(Icons.calendar_today)),
                    readOnly: true,
                    onTap: () => _selectDate(_dateEndController),
                    validator: (v) => v!.isEmpty ? 'Wajib' : null,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Jenis Trip', border: OutlineInputBorder()),
              initialValue: _tripType,
              items: ['Open Trip', 'Private Trip'].map((e) => DropdownMenuItem(initialValue: e, child: Text(e))).toList(),
              onChanged: (val) => setState(() => _tripType = val!),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _priceController,
              decoration: const InputDecoration(labelText: 'Harga Dasar (Rp)', border: OutlineInputBorder()),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Status Jadwal', border: OutlineInputBorder()),
              initialValue: _status,
              items: ['Terbuka', 'Penuh', 'Selesai'].map((e) => DropdownMenuItem(initialValue: e, child: Text(e))).toList(),
              onChanged: (val) => setState(() => _status = val!),
            ),

            const SizedBox(height: 16),
            TextFormField(
              controller: _quotaController,
              decoration: const InputDecoration(labelText: 'Kuota Maksimal', border: OutlineInputBorder()),
              keyboardType: TextInputType.number,
              validator: (v) => v!.isEmpty ? 'Wajib' : null,
            ),
            const SizedBox(height: 16),
            const Text('Meeting Points (Harga per Kota)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            ..._meetingPoints.asMap().entries.map((entry) {
              int idx = entry.key;
              Map<String, dynamic> mp = entry.value;
              return Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: TextFormField(
                        initialValue: mp['name'],
                        decoration: const InputDecoration(labelText: 'Kota (mis: Jakarta)', border: OutlineInputBorder()),
                        onChanged: (val) => mp['name'] = val,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      flex: 2,
                      child: TextFormField(
                        initialValue: (mp['price'] ?? 0).toString(),
                        decoration: const InputDecoration(labelText: 'Harga (Rp)', border: OutlineInputBorder()),
                        keyboardType: TextInputType.number,
                        onChanged: (val) => mp['price'] = int.tryParse(val) ?? 0,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () {
                        setState(() {
                          _meetingPoints.removeAt(idx);
                        });
                      },
                    )
                  ],
                ),
              );
            }),
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () {
                  setState(() {
                    _meetingPoints.add({'name': '', 'price': 0});
                  });
                },
                icon: const Icon(Icons.add),
                label: const Text('Tambah Meeting Point'),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(16)),
              child: _isLoading 
                ? const CircularProgressIndicator(color: Colors.white) 
                : const Text('Simpan Jadwal', style: TextStyle(fontSize: 16)),
            )
          ],
        ),
      ),
    );
  }
}




