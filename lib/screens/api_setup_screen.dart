import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:http/http.dart' as http;
import '../providers/api_key_provider.dart';
import '../providers/theme_provider.dart';

class ApiSetupScreen extends StatefulWidget {
  final bool isOnboarding;

  const ApiSetupScreen({super.key, this.isOnboarding = false});

  @override
  State<ApiSetupScreen> createState() => _ApiSetupScreenState();
}

class _ApiSetupScreenState extends State<ApiSetupScreen> {
  final TextEditingController _geminiKeyController = TextEditingController();
  bool _isObscured = true;
  bool _isTesting = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    final apiKeyProvider = context.read<ApiKeyProvider>();
    if (apiKeyProvider.geminiApiKey.isNotEmpty) {
      _geminiKeyController.text = apiKeyProvider.geminiApiKey;
    }
  }

  @override
  void dispose() {
    _geminiKeyController.dispose();
    super.dispose();
  }

  Future<void> _testApiKey() async {
    setState(() {
      _isTesting = true;
      _errorMessage = null;
    });

    final apiKeyProvider = context.read<ApiKeyProvider>();
    final apiKey = _geminiKeyController.text.trim();

    // Basic format validation
    if (!apiKeyProvider.validateApiKeyFormat(apiKey)) {
      setState(() {
        _errorMessage = 'Invalid API key format. Gemini API keys should start with "AIza" and be 39 characters long.';
        _isTesting = false;
      });
      return;
    }

    // Test the API key by making a simple request
    try {
      final response = await http.get(
        Uri.parse(
          'https://generativelanguage.googleapis.com/v1beta/models?key=$apiKey'
        ),
      );

      setState(() => _isTesting = false);

      if (response.statusCode == 200) {
        // API key is valid
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('API key is valid!'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else if (response.statusCode == 400) {
        setState(() {
          _errorMessage = 'Invalid API key. Please check and try again.';
        });
      } else {
        setState(() {
          _errorMessage = 'Error testing API key: ${response.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        _isTesting = false;
        _errorMessage = 'Network error: $e';
      });
    }
  }

  Future<void> _saveApiKey() async {
    final apiKeyProvider = context.read<ApiKeyProvider>();
    final apiKey = _geminiKeyController.text.trim();

    if (apiKey.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter an API key';
      });
      return;
    }

    if (!apiKeyProvider.validateApiKeyFormat(apiKey)) {
      setState(() {
        _errorMessage = 'Invalid API key format';
      });
      return;
    }

    final success = await apiKeyProvider.setGeminiApiKey(apiKey);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('API key saved successfully!'),
          backgroundColor: Colors.green,
        ),
      );

      if (widget.isOnboarding) {
        Navigator.of(context).pushReplacementNamed('/home');
      } else {
        Navigator.of(context).pop();
      }
    }
  }

  Future<void> _openGeminiConsole() async {
    final url = Uri.parse('https://aistudio.google.com/app/apikey');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    final isDark = themeProvider.isDarkMode;

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF1A1A1A) : Colors.white,
      appBar: widget.isOnboarding
          ? null
          : AppBar(
              title: const Text('API Key Setup'),
              backgroundColor: Theme.of(context).primaryColor,
              foregroundColor: Colors.white,
            ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (widget.isOnboarding) ...[
                const SizedBox(height: 20),
                Text(
                  'Welcome to SignaSure!',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    color: isDark ? Colors.white : Colors.black,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'To get started, you\'ll need a Google Gemini API key',
                  style: TextStyle(
                    fontSize: 16,
                    color: isDark ? Colors.grey[400] : Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 32),
              ],

              // Info Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.blue[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.blue[200]!),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.info_outline, color: Colors.blue[700]),
                        const SizedBox(width: 8),
                        Text(
                          'Why do I need an API key?',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue[900],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'SignaSure uses Google\'s Gemini AI to analyze your documents. By using your own API key, you have full control over your data and usage. Google offers a generous free tier!',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.blue[900],
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // Instructions
              Text(
                'How to get your API key:',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black,
                ),
              ),
              const SizedBox(height: 16),

              _buildStep(
                '1',
                'Click the button below to open Google AI Studio',
                isDark,
              ),
              const SizedBox(height: 12),
              _buildStep(
                '2',
                'Sign in with your Google account',
                isDark,
              ),
              const SizedBox(height: 12),
              _buildStep(
                '3',
                'Click "Get API Key" or "Create API Key"',
                isDark,
              ),
              const SizedBox(height: 12),
              _buildStep(
                '4',
                'Copy the API key and paste it below',
                isDark,
              ),

              const SizedBox(height: 24),

              // Open Google AI Studio button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _openGeminiConsole,
                  icon: const Icon(Icons.open_in_new),
                  label: const Text('Get API Key from Google AI Studio'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 32),

              // API Key Input
              Text(
                'Enter your Gemini API Key:',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : Colors.black,
                ),
              ),
              const SizedBox(height: 12),

              TextField(
                controller: _geminiKeyController,
                obscureText: _isObscured,
                decoration: InputDecoration(
                  hintText: 'AIza...',
                  prefixIcon: const Icon(Icons.vpn_key),
                  suffixIcon: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: Icon(
                          _isObscured ? Icons.visibility : Icons.visibility_off,
                        ),
                        onPressed: () {
                          setState(() => _isObscured = !_isObscured);
                        },
                      ),
                      IconButton(
                        icon: const Icon(Icons.paste),
                        onPressed: () async {
                          final data = await Clipboard.getData('text/plain');
                          if (data?.text != null) {
                            _geminiKeyController.text = data!.text!;
                          }
                        },
                      ),
                    ],
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  errorText: _errorMessage,
                ),
              ),

              const SizedBox(height: 16),

              // Test API Key button
              SizedBox(
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: _isTesting ? null : _testApiKey,
                  icon: _isTesting
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.check_circle_outline),
                  label: Text(_isTesting ? 'Testing...' : 'Test API Key'),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Save button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _saveApiKey,
                  icon: const Icon(Icons.save),
                  label: Text(widget.isOnboarding ? 'Continue' : 'Save'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).primaryColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Privacy note
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green[50],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green[200]!),
                ),
                child: Row(
                  children: [
                    Icon(Icons.lock_outline, color: Colors.green[700]),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Your API key is stored securely on your device and is never shared with us.',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.green[900],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStep(String number, String text, bool isDark) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: Theme.of(context).primaryColor,
            shape: BoxShape.circle,
          ),
          child: Center(
            child: Text(
              number,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              text,
              style: TextStyle(
                fontSize: 14,
                color: isDark ? Colors.grey[300] : Colors.grey[700],
              ),
            ),
          ),
        ),
      ],
    );
  }
}
