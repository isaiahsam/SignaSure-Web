import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class UserProvider extends ChangeNotifier {
  String _userName = 'User';
  String _phoneNumber = '';

  static const String _userNameKey = 'userName';
  static const String _phoneNumberKey = 'phoneNumber';

  String get userName => _userName;
  String get phoneNumber => _phoneNumber;

  UserProvider() {
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    _userName = prefs.getString(_userNameKey) ?? 'User';
    _phoneNumber = prefs.getString(_phoneNumberKey) ?? '';
    notifyListeners();
  }

  Future<void> updateUserName(String name) async {
    _userName = name.isEmpty ? 'User' : name;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_userNameKey, _userName);
    notifyListeners();
  }

  Future<void> updatePhoneNumber(String phone) async {
    _phoneNumber = phone;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_phoneNumberKey, _phoneNumber);
    notifyListeners();
  }
}
