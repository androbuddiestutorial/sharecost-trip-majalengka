import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'meeting_point_form_screen.dart';

class MeetingPointsScreen extends StatefulWidget {
  const MeetingPointsScreen({super.key});

  @override
  State<MeetingPointsScreen> createState() => _MeetingPointsScreenState();
}

class _MeetingPointsScreenState extends State<MeetingPointsScreen> {
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
          .from('meeting_points')
          .select()
          .order('created_at', ascending: false);
      setState(() {
        _items = data;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e')));
      }
    }
  }

  Future<void> _deleteItem(String id) async {
    try {
      await Supabase.instance.client.from('meeting_points').delete().eq('id', id);
      _fetchData();
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Meeting Point Dihapus')));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal hapus: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Meeting Points')),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _items.isEmpty 
          ? const Center(child: Text('Belum ada Meeting Point.'))
          : RefreshIndicator(
              onRefresh: _fetchData,
              child: ListView.builder(
                itemCount: _items.length,
                itemBuilder: (context, index) {
                  final item = _items[index];
                  return Card(
                    margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    child: ListTile(
                      leading: const CircleAvatar(
                        backgroundColor: Colors.teal,
                        child: Icon(Icons.location_on, color: Colors.white),
                      ),
                      title: Text(item['name'] ?? '-', style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('Tambahan: Rp ${item['price'] ?? 0}'),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.edit, color: Colors.blue),
                            onPressed: () async {
                              final result = await Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => MeetingPointFormScreen(meetingPoint: item)),
                              );
                              if (result == true) _fetchData();
                            },
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () {
                              showDialog(
                                context: context,
                                builder: (c) => AlertDialog(
                                  title: const Text('Hapus Meeting Point?'),
                                  actions: [
                                    TextButton(onPressed: () => Navigator.pop(c), child: const Text('Batal')),
                                    TextButton(onPressed: () { Navigator.pop(c); _deleteItem(item['id'].toString()); }, child: const Text('Hapus')),
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
            MaterialPageRoute(builder: (context) => const MeetingPointFormScreen()),
          );
          if (result == true) _fetchData();
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
