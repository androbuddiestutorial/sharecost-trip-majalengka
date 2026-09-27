import 'dart:io';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:image_picker/image_picker.dart';

class DestinationFormScreen extends StatefulWidget {
  final Map<String, dynamic>? destination;
  const DestinationFormScreen({super.key, this.destination});

  @override
  State<DestinationFormScreen> createState() => _DestinationFormScreenState();
}

class _DestinationFormScreenState extends State<DestinationFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  final _priceController = TextEditingController();
  final _imageUrlController = TextEditingController();
  
  bool _isLoading = false;
  File? _selectedImage;

  @override
  void initState() {
    super.initState();
    if (widget.destination != null) {
      _titleController.text = widget.destination!['title'] ?? '';
      _descController.text = widget.destination!['description'] ?? '';
      _priceController.text = (widget.destination!['price'] ?? '').toString();
      _imageUrlController.text = widget.destination!['image_url'] ?? '';
    }
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery, imageQuality: 70);
    if (pickedFile != null) {
      setState(() {
        _selectedImage = File(pickedFile.path);
        _imageUrlController.text = 'Akan diupload...';
      });
    }
  }

  Future<String?> _uploadImage(File file) async {
    try {
      final ext = file.path.split('.').last;
      final fileName = 'destinasi-${DateTime.now().millisecondsSinceEpoch}.$ext';
      await Supabase.instance.client.storage.from('gallery').upload(fileName, file);
      return Supabase.instance.client.storage.from('gallery').getPublicUrl(fileName);
    } catch (e) {
      debugPrint('Upload error: $e');
      return null;
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isLoading = true);
    try {
      String? finalImageUrl = _imageUrlController.text;
      if (_selectedImage != null) {
        final uploadedUrl = await _uploadImage(_selectedImage!);
        if (uploadedUrl != null) finalImageUrl = uploadedUrl;
      }

      final price = int.tryParse(_priceController.text) ?? 0;
      final data = {
        'title': _titleController.text,
        'description': _descController.text,
        'price': price,
        'image_url': finalImageUrl.isNotEmpty ? finalImageUrl : null,
      };

      if (widget.destination != null) {
        await Supabase.instance.client.from('destinations').update(data).eq('id', widget.destination!['id']);
      } else {
        await Supabase.instance.client.from('destinations').insert(data);
      }
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(widget.destination != null ? 'Destinasi diperbarui' : 'Destinasi ditambahkan')));
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
    _titleController.dispose();
    _descController.dispose();
    _priceController.dispose();
    _imageUrlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.destination != null ? 'Edit Destinasi' : 'Tambah Destinasi')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: 'Nama Destinasi', border: OutlineInputBorder()),
              validator: (v) => v!.isEmpty ? 'Wajib diisi' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _descController,
              decoration: const InputDecoration(labelText: 'Deskripsi', border: OutlineInputBorder()),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _priceController,
              decoration: const InputDecoration(labelText: 'Harga (Rp)', border: OutlineInputBorder(), prefixText: 'Rp '),
              keyboardType: TextInputType.number,
              validator: (v) => v!.isEmpty ? 'Wajib diisi' : null,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _imageUrlController,
                    decoration: const InputDecoration(labelText: 'URL Gambar', border: OutlineInputBorder()),
                    readOnly: _selectedImage != null,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  icon: const Icon(Icons.photo_library, color: Colors.teal, size: 32),
                  onPressed: _pickImage,
                  tooltip: 'Pilih dari Galeri',
                )
              ],
            ),
            if (_selectedImage != null)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Image.file(_selectedImage!, height: 150, fit: BoxFit.cover),
              ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(16)),
              child: _isLoading 
                ? const CircularProgressIndicator(color: Colors.white) 
                : const Text('Simpan Destinasi', style: TextStyle(fontSize: 16)),
            )
          ],
        ),
      ),
    );
  }
}
