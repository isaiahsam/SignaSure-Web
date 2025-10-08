# Google Gemini AI Setup Guide

SignaSure uses **Google Gemini AI** for FREE document analysis! 🎉

## Why Gemini?

✅ **Completely FREE** - 1500 requests/day (no credit card required!)
✅ **High Quality** - Gemini 1.5 Flash rivals GPT-4
✅ **Fast** - Average response time < 2 seconds
✅ **Reliable** - Backed by Google's infrastructure
✅ **Production-Ready** - Perfect for Play Store apps

## Quick Setup (5 minutes)

### Step 1: Get Your Free API Key

1. Go to **[Google AI Studio](https://makersuite.google.com/app/apikey)**
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Click **"Create API key in new project"** (or select existing project)
5. **Copy the API key** (starts with `AIza...`)

### Step 2: Add API Key to Your App

1. Open the `.env` file in the project root
2. Replace `your_gemini_api_key_here` with your actual key:

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

3. Save the file

### Step 3: Install Dependencies

```bash
flutter pub get
```

### Step 4: Run the App!

```bash
flutter run
```

That's it! Your app now has real AI analysis! 🚀

## How It Works

1. **User scans/uploads document** → OCR extracts text
2. **Text sent to Gemini AI** → Analysis in ~2 seconds
3. **Results displayed** → Flags, clauses, risk score, recommendations

## Free Tier Limits

| Feature | Limit |
|---------|-------|
| **Requests per minute** | 15 |
| **Requests per day** | 1,500 |
| **Max input tokens** | 32,000 |
| **Max output tokens** | 8,192 |
| **Cost** | **$0** |

**That's enough for:**
- 1,500 document analyses per day
- 45,000 documents per month
- **Completely FREE!**

## What Happens When You Exceed Limits?

If you exceed free tier:
- API returns an error
- App shows "Analysis failed" message
- Users can try again later (quota resets daily)

**For production**, consider:
1. Implementing retry logic
2. Caching common analyses
3. Upgrading to paid tier (if needed)

## Paid Tier Pricing (Optional)

When you outgrow free tier:

| Model | Input (1M tokens) | Output (1M tokens) |
|-------|-------------------|-------------------|
| Gemini 1.5 Flash | $0.075 | $0.30 |
| Gemini 1.5 Pro | $1.25 | $5.00 |

**Example cost** (using Gemini 1.5 Flash):
- Average document: ~2,000 input tokens + ~1,500 output tokens
- Cost per analysis: **$0.0006** (less than a cent!)
- 10,000 analyses: **~$6**

**Still 50% cheaper than GPT-4o-mini!**

## Monitoring Usage

Track your API usage:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** → **Dashboard**
4. View **Generative Language API** usage

## Security Best Practices

### ✅ DO:
- Keep API key in `.env` file
- Ensure `.env` is in `.gitignore`
- Monitor usage regularly
- Set usage alerts in Google Cloud Console
- Use ProGuard in production builds

### ❌ DON'T:
- Commit `.env` to version control
- Share API key publicly
- Hardcode API key in source code
- Ignore usage spikes (could indicate abuse)

## Troubleshooting

### "AI analysis failed" error

**Possible causes:**
1. **API key not set** → Check `.env` file
2. **Invalid API key** → Verify key is correct
3. **Quota exceeded** → Wait for quota reset (daily)
4. **Network issue** → Check internet connection
5. **API disabled** → Enable Generative Language API in Cloud Console

**How to fix:**
```bash
# 1. Verify .env file exists and has correct key
cat .env

# 2. Reinstall dependencies
flutter pub get

# 3. Rebuild app
flutter clean
flutter run
```

### "Quota exceeded" error

**Solutions:**
1. **Wait 24 hours** - Quota resets daily
2. **Upgrade to paid tier** - Enable billing in Google Cloud
3. **Implement caching** - Cache common analyses
4. **Rate limiting** - Limit analyses per user

### Empty or incorrect analysis

**Possible causes:**
1. **Poor OCR quality** → Use better quality images
2. **Document too long** → Split into pages
3. **Unsupported language** → Currently optimized for English

**How to fix:**
- Ensure good lighting when scanning
- Hold camera steady
- Use high-resolution images
- Crop out non-document areas

## Switching Models

Want to use Gemini Pro instead of Flash?

1. Open `lib/services/ai_analysis_service.dart`
2. Change line 31:
```dart
model: 'gemini-1.5-pro',  // was: gemini-1.5-flash
```
3. Save and rebuild

**When to use Pro:**
- Need highest accuracy
- Analyzing complex legal documents
- Budget allows ($1.25/1M tokens)

**When to use Flash:**
- Good balance of speed/quality
- Budget-conscious
- Most use cases (recommended)

## Testing in Development

### Use Mock Data (Free)
For testing without API calls:

```dart
// In image_review_screen.dart or upload_screen.dart
final analysis = await AIAnalysisService.getMockAnalysis();
```

This bypasses the API and returns fake but realistic data.

### Switch Back to Real AI
```dart
final analysis = await AIAnalysisService.analyzeDocument(text, type);
```

## Production Deployment

### Option 1: Direct API (Current Setup)
**Pros:**
- Simple to implement
- No backend needed
- Free tier is generous

**Cons:**
- API key embedded in app (can be extracted)
- Limited control over usage

**Best for:** MVP, small apps, personal projects

### Option 2: Backend Server (Recommended for Scale)
**Pros:**
- API key stays secure on server
- Better usage control
- Can implement custom caching
- User authentication/authorization

**Cons:**
- Requires backend development
- Additional hosting costs

**Best for:** Production apps with 1000+ users

**Architecture:**
```
User → App → Your Backend → Gemini API
                ↑
          (API key stays here)
```

### When to Migrate to Backend?
- You get 1000+ active users
- You want to monetize (subscriptions, etc.)
- You need better security
- You want custom business logic

## Rate Limiting & Abuse Prevention

Protect your API key from abuse:

1. **Set quotas** in Google Cloud Console
2. **Monitor usage** daily
3. **Implement client-side limits:**
```dart
// Limit to 10 analyses per user per day
SharedPreferences prefs = await SharedPreferences.getInstance();
int count = prefs.getInt('daily_analyses') ?? 0;
if (count >= 10) {
  showDialog(/* Daily limit reached */);
  return;
}
```

## Alternative: User Provides API Key

For maximum security, let users bring their own key:

**Pros:**
- Zero cost to you
- Each user pays for their usage
- No abuse risk

**Cons:**
- Friction for users
- Requires technical knowledge

**Implementation:**
- Add API key input in settings
- Store in secure local storage
- Use user's key for requests

## Support & Resources

- **Gemini AI Docs**: https://ai.google.dev/docs
- **API Reference**: https://ai.google.dev/api/rest
- **Pricing**: https://ai.google.dev/pricing
- **Community**: https://developers.google.com/community

## FAQ

**Q: Is Gemini AI really free?**
A: Yes! 1,500 requests/day with no credit card required.

**Q: How long does the free tier last?**
A: Forever! It's not a trial - it's a permanent free tier.

**Q: What happens if I go over 1,500/day?**
A: API returns an error. You can either wait 24 hours or upgrade to paid.

**Q: Can I use multiple API keys?**
A: Yes, but it's against Google's ToS to abuse the free tier.

**Q: Is my data private?**
A: Google may temporarily store data for processing but doesn't use it for training (see Google's privacy policy).

**Q: Can I use this in production?**
A: Yes! The free tier is production-ready.

---

**Ready to build?** Get your free API key and start analyzing! 🎯
