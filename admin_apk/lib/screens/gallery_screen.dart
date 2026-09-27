import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'gallery_form_screen.dart';

class GalleryScreen extends StatefulWidget {
  const GalleryScreen({super.key});

  @override
  State<GalleryScreen> createState() => _GalleryScreenState();
}

class _GalleryScreenState extends State<GalleryScreen> {
  List<dynamic> _items = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final data = await Supabase.instance.client
          .from('gallery')
          .select()
          .order('created_at', ascending: false);
      setState(() {
        _items = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _deleteItem(int id) async {
    try {
      await Supabase.instance.client.from('gallery').delete().eq('id', id);
      _fetchData();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Dihapus')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal hapus: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      body: _items.isEmpty 
        ? const Center(child: Text('Galeri kosong.'))
        : RefreshIndicator(
            onRefresh: _fetchData,
            child: GridView.builder(
              padding: const EdgeInsets.all(8),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: _items.length,
              itemBuilder: (context, index) {
                final item = _items[index];
                final url = item['image_url'] as String? ?? '';
                final category = item['category'] as String? ?? '-';
                final isVideo = category.toLowerCase() == 'video' || url.contains('youtube.com') || url.contains('youtu.be');

                return Card(
                  clipBehavior: Clip.antiAlias,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      if (isVideo)
                        Container(color: Colors.black87, child: const Icon(Icons.play_circle_fill, color: Colors.white, size: 50))
                      else
                        Image.network(url, fit: BoxFit.cover, errorBuilder: (c, e, s) => const Icon(Icons.broken_image)),
                      
                      Positioned(
                        bottom: 0, left: 0, right: 0,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          color: Colors.black54,
                          child: Text(category, style: const TextStyle(color: Colors.white, fontSize: 12), textAlign: TextAlign.center),
                        ),
                      ),
                      Positioned(
                        top: 0, right: 0,
                        child: IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => _deleteItem(item['id']),
                        ),
                      )
                    ],
                  ),
                );
              },
            ),
          ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const GalleryFormScreen()),
          );
          if (result == true) {
            _fetchData();
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
