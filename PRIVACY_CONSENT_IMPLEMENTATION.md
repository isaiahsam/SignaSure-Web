# Privacy Consent Dialog Implementation

## Why This is Important

**Legal Protection**: Users must give **informed consent** before their data is sent to Google's servers. This protects you from liability.

**Best Practice**: Show a one-time consent dialog before the first document analysis that clearly explains:
1. Data will be sent to Google
2. Google may use it to train AI models
3. You cannot guarantee confidentiality

---

## Recommended Implementation

### Step 1: Add Consent Tracking

Update your user preferences/database to track consent:

```dart
// In your user preferences or database model
class UserPreferences {
  bool hasAcceptedPrivacyConsent = false;
  DateTime? privacyConsentDate;
}
```

### Step 2: Create Consent Dialog

Create `lib/widgets/privacy_consent_dialog.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class PrivacyConsentDialog extends StatefulWidget {
  final VoidCallback onAccept;
  final VoidCallback onDecline;

  const PrivacyConsentDialog({
    super.key,
    required this.onAccept,
    required this.onDecline,
  });

  @override
  State<PrivacyConsentDialog> createState() => _PrivacyConsentDialogState();
}

class _PrivacyConsentDialogState extends State<PrivacyConsentDialog> {
  bool _hasReadNotice = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Row(
        children: [
          Icon(Icons.privacy_tip, color: Colors.orange, size: 28),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'Privacy Notice',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Before analyzing your document, please understand how your data will be used:',
              style: TextStyle(fontWeight: FontWeight.w500, fontSize: 15),
            ),
            SizedBox(height: 16),

            _buildNoticeItem(
              icon: Icons.cloud_upload,
              color: Colors.blue,
              title: 'Data Sent to Google',
              description: 'Your document text will be sent to Google\'s Gemini AI servers for analysis.',
            ),

            _buildNoticeItem(
              icon: Icons.model_training,
              color: Colors.orange,
              title: 'Google May Use Your Data',
              description: 'Google may use your document text to improve their AI services and train machine learning models.',
            ),

            _buildNoticeItem(
              icon: Icons.lock_open,
              color: Colors.red,
              title: 'Not Confidential',
              description: 'Your document content is NOT private from Google. Do NOT upload highly confidential or sensitive documents.',
            ),

            SizedBox(height: 16),

            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '⚠️ Do NOT upload:',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.red.shade900,
                    ),
                  ),
                  SizedBox(height: 8),
                  _buildWarningItem('NDAs or confidential business contracts'),
                  _buildWarningItem('Documents with trade secrets'),
                  _buildWarningItem('Medical/health documents (HIPAA)'),
                  _buildWarningItem('Documents with SSN or financial account numbers'),
                ],
              ),
            ),

            SizedBox(height: 16),

            Row(
              children: [
                Checkbox(
                  value: _hasReadNotice,
                  onChanged: (value) {
                    setState(() {
                      _hasReadNotice = value ?? false;
                    });
                  },
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() {
                        _hasReadNotice = !_hasReadNotice;
                      });
                    },
                    child: Text(
                      'I understand and accept these terms',
                      style: TextStyle(fontSize: 14),
                    ),
                  ),
                ),
              ],
            ),

            SizedBox(height: 8),

            TextButton(
              onPressed: () {
                // Open privacy policy
                launchUrl(Uri.parse('YOUR_PRIVACY_POLICY_URL'));
              },
              child: Text('Read Full Privacy Policy →'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: widget.onDecline,
          child: Text('Cancel', style: TextStyle(color: Colors.grey)),
        ),
        ElevatedButton(
          onPressed: _hasReadNotice ? widget.onAccept : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.blue,
            disabledBackgroundColor: Colors.grey.shade300,
          ),
          child: Text(
            'Accept & Continue',
            style: TextStyle(color: Colors.white),
          ),
        ),
      ],
    );
  }

  Widget _buildNoticeItem({
    required IconData icon,
    required Color color,
    required String title,
    required String description,
  }) {
    return Padding(
      padding: EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                ),
                SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(fontSize: 13, color: Colors.grey.shade700),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWarningItem(String text) {
    return Padding(
      padding: EdgeInsets.only(left: 8, bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('• ', style: TextStyle(color: Colors.red.shade900)),
          Expanded(
            child: Text(
              text,
              style: TextStyle(fontSize: 12, color: Colors.red.shade900),
            ),
          ),
        ],
      ),
    );
  }
}
```

### Step 3: Show Dialog Before First Analysis

In your document analysis screen (e.g., `document_detail_screen.dart`), add:

```dart
Future<void> _analyzeDocument() async {
  // Check if user has accepted privacy consent
  final prefs = await SharedPreferences.getInstance();
  final hasConsented = prefs.getBool('privacy_consent_accepted') ?? false;

  if (!hasConsented) {
    // Show consent dialog
    final accepted = await showDialog<bool>(
      context: context,
      barrierDismissible: false, // User must make a choice
      builder: (context) => PrivacyConsentDialog(
        onAccept: () => Navigator.of(context).pop(true),
        onDecline: () => Navigator.of(context).pop(false),
      ),
    );

    if (accepted != true) {
      // User declined - show message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Analysis cancelled. Your document was not sent.'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // Save consent
    await prefs.setBool('privacy_consent_accepted', true);
    await prefs.setString(
      'privacy_consent_date',
      DateTime.now().toIso8601String(),
    );
  }

  // Proceed with analysis
  _performAnalysis();
}
```

### Step 4: Add Reset Option in Settings

Let users review and revoke consent in settings:

```dart
// In settings screen
ListTile(
  leading: Icon(Icons.privacy_tip),
  title: Text('Privacy & Data Usage'),
  subtitle: Text('Review how your data is used'),
  onTap: () {
    showDialog(
      context: context,
      builder: (context) => PrivacyConsentDialog(
        onAccept: () {
          // Save consent again
          Navigator.of(context).pop();
        },
        onDecline: () {
          // Clear consent
          SharedPreferences.getInstance().then((prefs) {
            prefs.setBool('privacy_consent_accepted', false);
          });
          Navigator.of(context).pop();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Consent revoked. Analysis features disabled.'),
            ),
          );
        },
      ),
    );
  },
),
```

---

## What This Accomplishes

✅ **Informed Consent**: Users explicitly acknowledge the privacy implications
✅ **Legal Protection**: You have documented proof users understood the risks
✅ **Transparency**: Clear, upfront disclosure builds trust
✅ **Compliance**: Meets GDPR/CCPA requirements for data processing consent
✅ **User Control**: Users can review and revoke consent anytime

---

## Additional Recommendation: Add Warning in Analysis Screen

Before the "Analyze" button, add a subtle reminder:

```dart
Container(
  padding: EdgeInsets.all(12),
  margin: EdgeInsets.only(bottom: 16),
  decoration: BoxDecoration(
    color: Colors.orange.shade50,
    borderRadius: BorderRadius.circular(8),
    border: Border.all(color: Colors.orange.shade200),
  ),
  child: Row(
    children: [
      Icon(Icons.info_outline, color: Colors.orange.shade700, size: 20),
      SizedBox(width: 8),
      Expanded(
        child: Text(
          'Document text will be sent to Google\'s AI for analysis',
          style: TextStyle(fontSize: 12, color: Colors.orange.shade900),
        ),
      ),
    ],
  ),
),
```

---

## Summary

With these updates:

1. **Terms & Privacy Policy**: Now clearly disclose Google's data usage ✅
2. **Consent Dialog**: Users explicitly accept before first use ✅
3. **In-App Warnings**: Continuous reminders about data handling ✅
4. **User Control**: Can review/revoke consent anytime ✅

**This provides strong legal protection while maintaining user trust.**
