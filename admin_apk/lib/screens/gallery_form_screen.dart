import 'dart:io';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:image_picker/image_picker.dart';

class GalleryFormScreen extends StatefulWidget {
  const GalleryFormScreen({super.key});

  @override
  State<GalleryFormScreen> createState() => _GalleryFormScreenState();
}

class _GalleryFormScreenState extends State<GalleryFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _urlController = TextEditingController();
  final _categoryController = TextEditingController();
  
  bool _isLoading = false;
  String _mediaType = 'foto'; // foto atau video
  File? _selectedImage;

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery, imageQuality: 70);
    if (pickedFile != null) {
      setState(() {
        _selectedImage = File(pickedFile.path);
        _urlController.text = 'Akan diupload...';
      });
    }
  }

  Future<String?> _uploadImage(File file) async {
    try {
      final ext = file.path.split('.').last;
      final fileName = 'gallery-${DateTime.now().millisecondsSinceEpoch}.$ext';
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
      String finalUrl = _urlController.text;
      if (_mediaType == 'foto' && _selectedImage != null) {
        final uploadedUrl = await _uploadImage(_selectedImage!);
        if (uploadedUrl != null) finalUrl = uploadedUrl;
      }

      String category = _mediaType == 'video' ? 'Video' : _categoryController.text.trim();
      if (category.isEmpty) category = 'Umum';

      await Supabase.instance.client.from('gallery').insert({
        'image_url': finalUrl,
        'category': category,
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Media ditambahkan ke Galeri')));
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
    _urlController.dispose();
    _categoryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tambah Media Galeri')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text('Pilih Jenis Media:', style: TextStyle(fontWeight: FontWeight.bold)),
            Row(
              children: [
                // ignore: deprecated_member_use
                Radio<String>(
                  value: 'foto',
                  // ignore: deprecated_member_use
                  groupValue: _mediaType,
                  // ignore: deprecated_member_use
                  onChanged: (v) => setState(() { _mediaType = v!; _categoryController.clear(); }),
                ),
                const Text('Foto'),
                const SizedBox(width: 16),
                // ignore: deprecated_member_use
                Radio<String>(
                  value: 'video',
                  // ignore: deprecated_member_use
                  groupValue: _mediaType,
                  // ignore: deprecated_member_use
                  onChanged: (v) => setState(() { _mediaType = v!; _categoryController.text = 'Video'; _selectedImage = null; _urlController.clear(); }),
                ),
                const Text('YouTube Video'),
              ],
            ),
            const SizedBox(height: 16),
            if (_mediaType == 'foto')
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _urlController,
                      decoration: const InputDecoration(labelText: 'URL Gambar', border: OutlineInputBorder()),
                      readOnly: _selectedImage != null,
                      validator: (v) => v!.isEmpty ? 'Wajib diisi' : null,
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.photo_library, color: Colors.teal, size: 32),
                    onPressed: _pickImage,
                    tooltip: 'Pilih dari Galeri',
                  )
                ],
              )
            else
              TextFormField(
                controller: _urlController,
                decoration: const InputDecoration(
                  labelText: 'Link YouTube',
                  border: OutlineInputBorder()
                ),
                keyboardType: TextInputType.url,
                validator: (v) => v!.isEmpty ? 'Wajib diisi' : null,
              ),
            if (_selectedImage != null)
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Image.file(_selectedImage!, height: 150, fit: BoxFit.cover),
              ),
            const SizedBox(height: 16),
            if (_mediaType == 'foto')
              TextFormField(
                controller: _categoryController,
                decoration: const InputDecoration(
                  labelText: 'Kategori (contoh: Ciremai, Prau)', 
                  border: OutlineInputBorder(),
                  helperText: 'Kosongkan jika kategori Umum'
                ),
              ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              style: ElevatedButton.styleFrom(padding: const EdgeInsets.all(16)),
              child: _isLoading 
                ? const CircularProgressIndicator(color: Colors.white) 
                : const Text('Simpan Media', style: TextStyle(fontSize: 16)),
            )
          ],
        ),
      ),
    );
  }
}
