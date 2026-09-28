const fs = require('fs');
let content = fs.readFileSync('admin_apk/lib/screens/trip_form_screen.dart', 'utf-8');

// 1. Add state variable
content = content.replace(
  'bool _isLoading = false;', 
  'bool _isLoading = false;\n  List<Map<String, dynamic>> _meetingPoints = [];'
);

// 2. Initialize from widget.trip
const initStr = `_quotaController.text = (widget.trip!['quota'] ?? '').toString();`;
const initRepl = `_quotaController.text = (widget.trip!['quota'] ?? '').toString();
      if (widget.trip!['meeting_points'] != null) {
        try {
          final List<dynamic> mps = widget.trip!['meeting_points'] is String ? jsonDecode(widget.trip!['meeting_points']) : widget.trip!['meeting_points'];
          _meetingPoints = mps.map((e) => Map<String, dynamic>.from(e as Map)).toList();
        } catch(e) {}
      }`;
content = content.replace(initStr, initRepl);

// 3. Update data object in _submit
const submitStr = `'status': widget.trip != null ? widget.trip!['status'] : 'Terbuka',`;
const submitRepl = `'status': widget.trip != null ? widget.trip!['status'] : 'Terbuka',
        'meeting_points': _meetingPoints.where((mp) => (mp['name']?.toString() ?? '').trim().isNotEmpty).toList(),`;
content = content.replace(submitStr, submitRepl);

// 4. Update UI
const uiStr = `            const SizedBox(height: 24),
            ElevatedButton(`;
const uiRepl = `            const SizedBox(height: 16),
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
            }).toList(),
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
            ElevatedButton(`;
content = content.replace(uiStr, uiRepl);

// Add import 'dart:convert'; if not present
if (!content.includes("import 'dart:convert';")) {
  content = content.replace("import 'package:flutter/material.dart';", "import 'package:flutter/material.dart';\nimport 'dart:convert';");
}

fs.writeFileSync('admin_apk/lib/screens/trip_form_screen.dart', content);
