const fs = require('fs');
let content = fs.readFileSync('admin_apk/lib/screens/manual_booking_screen.dart', 'utf-8');

// 1. Remove global fetch
const fetchRegex = /final m = await Supabase\.instance\.client\.from\('meeting_points'\)\.select\(\);\s*setState\(\(\) \{\s*_trips = t;\s*_meetingPoints = m;\s*\}\);/g;
content = content.replace(fetchRegex, 'setState(() { _trips = t; });');

// 2. Add _onTripSelected method
const onTripSelected = `
  void _onTripSelected(String? tripId) {
    setState(() {
      _selectedTripId = tripId;
      _selectedMeetingPoint = null;
      _meetingPoints = [];
      if (tripId != null) {
        final trip = _trips.firstWhere((t) => t['id'] == tripId, orElse: () => null);
        if (trip != null && trip['meeting_points'] != null) {
          try {
            final List<dynamic> mps = trip['meeting_points'] is String ? jsonDecode(trip['meeting_points']) : trip['meeting_points'];
            _meetingPoints = mps.map((e) => Map<String, dynamic>.from(e as Map)).toList();
          } catch(e) {}
        }
      }
    });
  }
`;
content = content.replace('Future<void> _fetchData() async {', onTripSelected + '\n  Future<void> _fetchData() async {');

// 3. Update trip dropdown onChanged
content = content.replace('onChanged: (val) => setState(() => _selectedTripId = val),', 'onChanged: _onTripSelected,');

// Add import 'dart:convert'; if not present
if (!content.includes("import 'dart:convert';")) {
  content = content.replace("import 'package:flutter/material.dart';", "import 'package:flutter/material.dart';\nimport 'dart:convert';");
}

fs.writeFileSync('admin_apk/lib/screens/manual_booking_screen.dart', content);
