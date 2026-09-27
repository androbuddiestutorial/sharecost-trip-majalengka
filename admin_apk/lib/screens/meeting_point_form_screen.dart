import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class MeetingPointFormScreen extends StatefulWidget {
  final Map<String, dynamic>? meetingPoint;
  const MeetingPointFormScreen({super.key, this.meetingPoint});

  @override
  State<MeetingPointFormScreen> createState() => _MeetingPointFormScreenState();
}

class _MeetingPointFormScreenState extends State<MeetingPointFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _priceController = TextEditingController(text: '0');
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.meetingPoint != null) {
      _nameController.text = widget.meetingPoint!['name'] ?? '';
      _priceController.text = (widget.meetingPoint!['price'] ?? 0).toString();
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isLoading = true);
    try {
      final price = int.tryParse(_priceController.text) ?? 0;
      final data = {
        'name': _nameController.text,
        'price': price,
      };

      if (widget.meetingPoint != null) {
        await Supabase.instance.client.from('meeting_points').update(data).eq('id', widget.meetingPoint!['id']);
      } else {
        await Supabase.instance.client.from('meeting_points').insert(data);
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(widget.meetingPoint != null ? 'Meeting Point diperbarui' : 'Meeting Point ditambahkan')));
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.meetingPoint != null ? 'Edit Meeting Point' : 'Tambah Meeting Point')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _nameController,
              decoration: const InputDecoration(labelText: 'Nama Kota / Lokasi', border: OutlineInputBorder()),
              validator: (v) => v!.isEmpty ? 'Wajib diisi' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _priceController,
              decoration: const InputDecoration(labelText: 'Harga / Biaya Tambahan (Rp)', border: OutlineInputBorder(), prefixText: 'Rp '),
              keyboardType: TextInputType.number,
              validator: (v) => v!.isEmpty ? 'Wajib diisi' : null,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(16)),
              child: _isLoading 
                ? const CircularProgressIndicator(color: Colors.white) 
                : const Text('Simpan', style: TextStyle(fontSize: 16)),
            )
          ],
        ),
      ),
    );
  }
}
