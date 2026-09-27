import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class TripFormScreen extends StatefulWidget {
  const TripFormScreen({super.key});

  @override
  State<TripFormScreen> createState() => _TripFormScreenState();
}

class _TripFormScreenState extends State<TripFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _dateStartController = TextEditingController();
  final _dateEndController = TextEditingController();
  final _priceController = TextEditingController();
  final _quotaController = TextEditingController();
  
  String? _selectedDestinationId;
  List<dynamic> _destinations = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchDestinations();
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
      final price = int.tryParse(_priceController.text) ?? 0;
      final quota = int.tryParse(_quotaController.text) ?? 0;
      
      await Supabase.instance.client.from('trips').insert({
        'destination_id': _selectedDestinationId,
        'date_start': _dateStartController.text,
        'date_end': _dateEndController.text,
        'price': price,
        'quota': quota,
        'status': 'Aktif',
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Jadwal Trip ditambahkan')));
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _selectDate(TextEditingController controller) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now(),
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
    _priceController.dispose();
    _quotaController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tambah Jadwal Trip')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Pilih Destinasi', border: OutlineInputBorder()),
              initialValue: _selectedDestinationId,
              items: _destinations.map((d) => DropdownMenuItem<String>(
                value: d['id'].toString(),
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
            TextFormField(
              controller: _priceController,
              decoration: const InputDecoration(labelText: 'Harga (Rp)', border: OutlineInputBorder(), prefixText: 'Rp '),
              keyboardType: TextInputType.number,
              validator: (v) => v!.isEmpty ? 'Wajib' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _quotaController,
              decoration: const InputDecoration(labelText: 'Kuota Maksimal', border: OutlineInputBorder()),
              keyboardType: TextInputType.number,
              validator: (v) => v!.isEmpty ? 'Wajib' : null,
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
