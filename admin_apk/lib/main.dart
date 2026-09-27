import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'screens/login_screen.dart';
import 'screens/main_navigation.dart';
import 'screens/booking_detail_screen.dart';

final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  } catch (e) {
    debugPrint('Firebase init failed: $e');
  }

  try {
    await Supabase.initialize(
      url: 'https://wlpwrgcnhacsxgyjcvqr.supabase.co',
      anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscHdyZ2NuaGFjc3hneWpjdnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzMjQzOTIsImV4cCI6MjEwNTkwMDM5Mn0.2sB0SLHghPJFhMa907usH4Wh4dYF9sZwC7JXIKhrZ2Y',
    );
  } catch (e) {
    debugPrint('Supabase init failed: $e');
  }

  runApp(const AdminApp());
}

class AdminApp extends StatelessWidget {
  const AdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Sharecosttrip Admin',
      navigatorKey: navigatorKey,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: const AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});

  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  bool _isLoading = true;
  bool _isAuthenticated = false;

  @override
  void initState() {
    super.initState();
    _checkAuth();
    _setupPushNotifications();
  }

  Future<void> _setupPushNotifications() async {
    FirebaseMessaging messaging = FirebaseMessaging.instance;
    await messaging.requestPermission();
    await messaging.subscribeToTopic('admin_alerts');
    
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      if (message.notification != null && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${message.notification?.title}: ${message.notification?.body}'),
            backgroundColor: Colors.teal,
            duration: const Duration(seconds: 5),
            action: message.data['booking_id'] != null ? SnackBarAction(
              label: 'Lihat',
              textColor: Colors.white,
              onPressed: () => _navigateToBooking(message.data['booking_id']),
            ) : null,
          ),
        );
      }
    });

    // Handle background messages tapped by user
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      if (message.data['booking_id'] != null) {
        _navigateToBooking(message.data['booking_id']);
      }
    });

    // Handle message when app was completely terminated
    final initialMessage = await messaging.getInitialMessage();
    if (initialMessage != null && initialMessage.data['booking_id'] != null) {
      // Delay to ensure the app is fully mounted before navigating
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _navigateToBooking(initialMessage.data['booking_id']);
      });
    }
  }

  Future<void> _navigateToBooking(dynamic bookingIdStr) async {
    // We only have the ID, so we need to fetch the full booking data first
    try {
      final int bookingId = int.parse(bookingIdStr.toString());
      final data = await Supabase.instance.client
          .from('bookings')
          .select('*, trips(date_start, destinations(title))')
          .eq('id', bookingId)
          .single();
          
      if (navigatorKey.currentState != null) {
        navigatorKey.currentState!.push(
          MaterialPageRoute(
            builder: (context) => BookingDetailScreen(booking: data),
          ),
        );
      }
    } catch (e) {
      debugPrint('Error navigating to booking: $e');
    }
  }

  Future<void> _checkAuth() async {
    final session = Supabase.instance.client.auth.currentSession;
    setState(() {
      _isAuthenticated = session != null;
      _isLoading = false;
    });

    // Listen to auth state changes
    Supabase.instance.client.auth.onAuthStateChange.listen((data) {
      final AuthChangeEvent event = data.event;
      if (event == AuthChangeEvent.signedIn) {
        setState(() => _isAuthenticated = true);
      } else if (event == AuthChangeEvent.signedOut) {
        setState(() => _isAuthenticated = false);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return _isAuthenticated ? const MainNavigation() : const LoginScreen();
  }
}
