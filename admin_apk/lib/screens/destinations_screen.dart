import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'destination_form_screen.dart';

class DestinationsScreen extends StatefulWidget {
  const DestinationsScreen({super.key});

  @override
  State<DestinationsScreen> createState() => _DestinationsScreenState();
}

class _DestinationsScreenState extends State<DestinationsScreen> {
  List<dynamic> _destinations = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchDestinations();
  }

  Future<void> _fetchDestinations() async {
    setState(() => _isLoading = true);
    try {
      final data = await Supabase.instance.client
          .from('destinations')
          .select()
          .order('title', ascending: true);
      setState(() {
        _destinations = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
    }
  }

  Future<void> _deleteDestination(String id) async {
    try {
      await Supabase.instance.client.from('destinations').delete().eq('id', id);
      _fetchDestinations();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Destinasi Dihapus')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal hapus: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    
    return Scaffold(
      body: _destinations.isEmpty 
        ? const Center(child: Text('Belum ada destinasi.'))
        : RefreshIndicator(
            onRefresh: _fetchDestinations,
            child: ListView.builder(
              itemCount: _destinations.length,
              itemBuilder: (context, index) {
                final dest = _destinations[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundImage: dest['image_url'] != null ? NetworkImage(dest['image_url']) : null,
                      child: dest['image_url'] == null ? const Icon(Icons.landscape) : null,
                    ),
                    title: Text(dest['title'] ?? '-', style: const TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Text('Rp ${dest['price'] ?? 0}'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit, color: Colors.blue),
                          onPressed: () async {
                            final result = await Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => DestinationFormScreen(destination: dest)),
                            );
                            if (result == true) _fetchDestinations();
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () {
                            showDialog(
                              context: context,
                              builder: (c) => AlertDialog(
                                title: const Text('Hapus Destinasi?'),
                                actions: [
                                  TextButton(onPressed: () => Navigator.pop(c), child: const Text('Batal')),
                                  TextButton(onPressed: () { Navigator.pop(c); _deleteDestination(dest['id'].toString()); }, child: const Text('Hapus')),
                                ],
                              )
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const DestinationFormScreen()),
          );
          if (result == true) {
            _fetchDestinations();
          }
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
