# Email Configuration Guide

## 🔐 Secure Email Configuration Options

### Option 1: Gmail with App Password (Development)

**Pros:**
- ✅ Free
- ✅ Easy setup
- ✅ Reliable
- ✅ Good for testing

**Cons:**
- ❌ Limited to 500 emails/day
- ❌ May be marked as spam
- ❌ Not recommended for production

**Setup:**
1. Enable 2FA: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use 16-character password (not your regular password)

**Configuration:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=E-commerce App <noreply@yourdomain.com>
```

---

### Option 2: SendGrid (Production) ⭐ RECOMMENDED

**Pros:**
- ✅ Free tier: 100 emails/day
- ✅ High deliverability
- ✅ Detailed analytics
- ✅ Email validation
- ✅ Professional appearance

**Cons:**
- ❌ Requires verification
- ❌ Need to configure SPF/DKIM

**Setup:**
1. Sign up: https://sendgrid.com
2. Verify email/domain
3. Create API key
4. Install: `npm install @sendgrid/mail`

**Configuration:**
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com
```

**Free Tier:** 100 emails/day forever

---

### Option 3: AWS SES (Scalable Production)

**Pros:**
- ✅ Very cheap ($0.10 per 1,000 emails)
- ✅ Highly scalable
- ✅ AWS integration
- ✅ Reliable

**Cons:**
- ❌ Sandbox mode initially (need to request production)
- ❌ More complex setup
- ❌ AWS account required

**Setup:**
1. Create AWS account
2. Set up SES in AWS Console
3. Verify domain/email
4. Create IAM credentials
5. Install: `npm install @aws-sdk/client-ses`

**Configuration:**
```env
EMAIL_SERVICE=aws-ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
EMAIL_FROM=noreply@yourdomain.com
```

**Pricing:** $0.10 per 1,000 emails

---

### Option 4: Mailgun

**Pros:**
- ✅ Free tier: 5,000 emails/month
- ✅ Good deliverability
- ✅ Email validation
- ✅ Easy to use

**Cons:**
- ❌ Requires credit card
- ❌ Domain verification needed

**Setup:**
1. Sign up: https://mailgun.com
2. Add domain
3. Verify with DNS records
4. Get API key
5. Install: `npm install mailgun-js`

**Configuration:**
```env
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your_api_key
MAILGUN_DOMAIN=mg.yourdomain.com
EMAIL_FROM=noreply@yourdomain.com
```

**Free Tier:** 5,000 emails/month for 3 months

---

### Option 5: Microsoft Outlook/Office 365

**Pros:**
- ✅ Good for business use
- ✅ Professional appearance
- ✅ Reliable

**Cons:**
- ❌ Requires Office 365 subscription
- ❌ More restrictive

**Configuration:**
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your.email@outlook.com
EMAIL_PASSWORD=your_password
EMAIL_FROM=E-commerce App <noreply@yourdomain.com>
```

---

## 🛡️ Security Best Practices

### 1. Never Hardcode Credentials
❌ **Bad:**
```javascript
const pass = 'mypassword123';
```

✅ **Good:**
```javascript
const pass = process.env.EMAIL_PASSWORD;
```

### 2. Use Environment Variables
- Store in `.env` file
- Add `.env` to `.gitignore`
- Never commit credentials to git

### 3. Use App-Specific Passwords
- Never use your main email password
- Generate unique passwords for each application
- Revoke access if compromised

### 4. Enable 2-Factor Authentication
- Adds extra security layer
- Required for Gmail App Passwords
- Protects your account

### 5. Use TLS/SSL
- Always use encrypted connections
- Port 465 (SSL) or 587 (TLS)
- Never use port 25 (unencrypted)

### 6. Validate Email Addresses
```javascript
const validator = require('validator');

if (!validator.isEmail(email)) {
  throw new Error('Invalid email address');
}
```

### 7. Rate Limiting
- Limit password reset requests
- Prevent abuse
- Use rate-limiting middleware

### 8. Monitor Email Deliverability
- Check bounce rates
- Monitor spam complaints
- Use email service analytics

---

## 📊 Comparison Table

| Service | Free Tier | Price After | Best For | Setup Difficulty |
|---------|-----------|-------------|----------|------------------|
| Gmail | 500/day | N/A | Development | ⭐ Easy |
| SendGrid | 100/day | $19.95/mo | Production | ⭐⭐ Medium |
| AWS SES | 62,000/mo* | $0.10/1k | Enterprise | ⭐⭐⭐ Hard |
| Mailgun | 5,000/mo** | $35/mo | Production | ⭐⭐ Medium |
| Outlook | N/A | Subscription | Business | ⭐ Easy |

\* First 62,000 emails free with EC2  
\** Free for 3 months

---

## 🚀 Recommended Approach

### For Development/Testing:
**Use Gmail with App Password**
- Quick to set up
- No cost
- Good for learning

### For Production:
**Use SendGrid or AWS SES**
- High deliverability
- Professional features
- Better monitoring
- Scalable

---

## 🔧 Implementation Example

### Using SendGrid (Recommended)

**1. Install package:**
```bash
npm install @sendgrid/mail
```

**2. Update `.env`:**
```env
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.your_api_key
EMAIL_FROM=noreply@yourdomain.com
```

**3. Create improved email utility:**
See `backend/utils/sendEmail.improved.js` for implementation

**4. Test the configuration:**
```bash
curl -X POST http://localhost:5000/api/auth/forgotpassword \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 🔍 Troubleshooting

### "Authentication failed"
- Check username/password
- Verify App Password is correct
- Ensure 2FA is enabled (for Gmail)

### "Connection refused"
- Check EMAIL_HOST and EMAIL_PORT
- Verify firewall settings
- Try different port (587 vs 465)

### "Mail sent but not received"
- Check spam folder
- Verify sender domain
- Set up SPF/DKIM records

### "Rate limit exceeded"
- Implement cooldown period
- Use professional service (SendGrid/SES)
- Add rate limiting middleware

---

## 📝 Next Steps

1. **Choose your email service** based on needs
2. **Set up proper .env configuration**
3. **Test email sending** with forgot password
4. **Monitor deliverability** in production
5. **Set up domain verification** (for production)

---

## 🎯 Quick Start Commands

**Gmail Setup:**
```bash
# No additional packages needed
# Just configure .env with App Password
```

**SendGrid Setup:**
```bash
cd backend
npm install @sendgrid/mail
# Configure .env with SENDGRID_API_KEY
# Replace sendEmail.js with improved version
```

**AWS SES Setup:**
```bash
cd backend
npm install @aws-sdk/client-ses
# Configure .env with AWS credentials
# Update sendEmail.js for AWS SES
```

---

## 💡 Pro Tips

1. **Use a custom domain** for better deliverability
2. **Warm up your IP** gradually in production
3. **Monitor bounce rates** and unsubscribes
4. **Use email templates** for consistency
5. **Test emails** before going to production
6. **Set up SPF/DKIM/DMARC** records
7. **Keep credentials secure** and rotate regularly
8. **Use different emails** for dev/staging/production
