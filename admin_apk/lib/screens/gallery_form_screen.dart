import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

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

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isLoading = true);
    try {
      String category = _mediaType == 'video' ? 'Video' : _categoryController.text.trim();
      if (category.isEmpty) category = 'Umum';

      await Supabase.instance.client.from('gallery').insert({
        'image_url': _urlController.text,
        'category': category,
      });
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Media ditambahkan ke Galeri')));
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
    } finally {
      setState(() => _isLoading = false);
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
                const Text('Foto URL'),
                const SizedBox(width: 16),
                // ignore: deprecated_member_use
                Radio<String>(
                  value: 'video',
                  // ignore: deprecated_member_use
                  groupValue: _mediaType,
                  // ignore: deprecated_member_use
                  onChanged: (v) => setState(() { _mediaType = v!; _categoryController.text = 'Video'; }),
                ),
                const Text('YouTube URL'),
              ],
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _urlController,
              decoration: InputDecoration(
                labelText: _mediaType == 'video' ? 'Link YouTube' : 'URL Gambar Foto',
                border: const OutlineInputBorder()
              ),
              keyboardType: TextInputType.url,
              validator: (v) => v!.isEmpty ? 'Wajib diisi' : null,
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
