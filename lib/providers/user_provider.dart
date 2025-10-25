import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UserProvider extends ChangeNotifier {
  String _userName = 'User';
  String _phoneNumber = '';
  String? _currentUserId;

  String get userName => _userName;
  String get phoneNumber => _phoneNumber;

  UserProvider();

  /// Load user data for a specific user ID
  Future<void> loadUserData(String userId) async {
    _currentUserId = userId;
    final prefs = await SharedPreferences.getInstance();
    _userName = prefs.getString('userName_$userId') ?? 'User';
    _phoneNumber = prefs.getString('phoneNumber_$userId') ?? '';
    notifyListeners();
  }

  /// Update username for current user
  Future<void> updateUserName(String name) async {
    if (_currentUserId == null) return;

    _userName = name.isEmpty ? 'User' : name;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('userName_$_currentUserId', _userName);
    notifyListeners();
  }

  /// Update phone number for current user
  Future<void> updatePhoneNumber(String phone) async {
    if (_currentUserId == null) return;

    _phoneNumber = phone;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('phoneNumber_$_currentUserId', _phoneNumber);
    notifyListeners();
  }

  /// Clear user data (for sign out)
  void clearUserData() {
    _userName = 'User';
    _phoneNumber = '';
    _currentUserId = null;
    notifyListeners();
  }
}
