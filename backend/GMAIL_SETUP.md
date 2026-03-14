# 📧 Gmail SMTP Setup Guide (5 Minutes)

## ✅ Step-by-Step Setup

### Step 1: Enable 2-Factor Authentication (2 minutes)

1. **Visit Google Account Security:**
   ```
   https://myaccount.google.com/security
   ```

2. **Enable 2-Step Verification:**
   - Scroll to "2-Step Verification"
   - Click "Get Started"
   - Follow the prompts (verify phone number)
   - Complete setup

---

### Step 2: Generate App Password (2 minutes)

1. **Visit App Passwords:**
   ```
   https://myaccount.google.com/apppasswords
   ```
   (You must have 2FA enabled first)

2. **Create App Password:**
   - Select app: **Mail**
   - Select device: **Other (Custom name)**
   - Enter name: `MERN E-commerce App`
   - Click **Generate**

3. **Copy the 16-character password:**
   ```
   Example: abcd efgh ijkl mnop
   ```
   ⚠️ **Save this password now!** (You won't see it again)

---

### Step 3: Configure Your App (1 minute)

1. **Update `.env` file:**
   ```bash
   cd /home/jayesh-16632/ecom/backend
   nano .env
   ```

2. **Add configuration:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   EMAIL_FROM=E-commerce App <your.email@gmail.com>
   ```
   (Replace with your actual email and app password)

3. **Save and exit:** `Ctrl+X`, `Y`, `Enter`

---

### Step 4: Test It!

```bash
cd /home/jayesh-16632/ecom/backend
node test-email.js your.email@gmail.com
```

**Expected output:**
```
✅ SUCCESS! Test email sent successfully!
📬 Check your inbox at: your.email@gmail.com
```

---

## 📋 Complete .env Example

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecom
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development

# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=john.doe@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=E-commerce App <john.doe@gmail.com>
```

---

## 🔍 Verification Checklist

- [ ] 2FA enabled on Gmail account
- [ ] App Password generated
- [ ] `.env` file updated with credentials
- [ ] Test email sent successfully
- [ ] Email received in inbox

---

## 🚨 Troubleshooting

### Issue: "Invalid credentials"
**Solution:**
```
✓ Use App Password (NOT regular Gmail password)
✓ Ensure 2FA is enabled first
✓ Remove spaces from App Password in .env
✓ Make sure EMAIL_USER is your full Gmail address
```

### Issue: "Connection refused"
**Solution:**
```
✓ Use port 587 (recommended)
✓ Check if firewall is blocking port
✓ Try port 465 as alternative
```

### Issue: Email not received
**Solution:**
```
✓ Check spam/junk folder
✓ Verify EMAIL_FROM matches EMAIL_USER
✓ Wait a few minutes (can take 1-5 min)
✓ Check backend/logs/combined.log for errors
```

### Issue: "Less secure app access"
**Solution:**
```
✓ DON'T enable "Less secure apps"
✓ USE App Password instead
✓ App Passwords require 2FA to be enabled
```

---

## 💡 Tips

### Multiple Environments
```env
# Development
EMAIL_USER=dev.app@gmail.com

# Production
EMAIL_USER=noreply@gmail.com
```

### Use Descriptive "From" Name
```env
# Good
EMAIL_FROM=E-commerce App <noreply@gmail.com>

# Also Good
EMAIL_FROM=My Store <support@gmail.com>
```

### Security Best Practices
```bash
# Never commit .env file
echo ".env" >> .gitignore

# Use different Gmail accounts for dev/prod
Dev: dev.myapp@gmail.com
Prod: noreply.myapp@gmail.com
```

---

## 📊 Gmail Limits

| Type | Limit |
|------|-------|
| Emails per day | 500 |
| Recipients per email | 500 |
| Cost | **FREE** ✅ |

Perfect for:
- ✅ Development
- ✅ Small apps
- ✅ Personal projects
- ✅ Testing

---

## 🔄 Other SMTP Providers

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your@outlook.com
EMAIL_PASSWORD=your_password
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your@yahoo.com
EMAIL_PASSWORD=your_app_password
```

### Custom Domain (e.g., GoDaddy, Bluehost)
```env
EMAIL_HOST=smtp.yourhost.com
EMAIL_PORT=587
EMAIL_USER=you@yourdomain.com
EMAIL_PASSWORD=your_password
```

---

## ✅ Testing Commands

```bash
# Test email configuration
node test-email.js your@email.com

# Test forgot password
curl -X POST http://localhost:5000/api/auth/forgotpassword \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check logs
tail -f logs/combined.log | grep -i email

# View recent logs
tail -20 logs/combined.log
```

---

## 🎯 Quick Reference

**2FA Setup:** https://myaccount.google.com/security  
**App Password:** https://myaccount.google.com/apppasswords  
**Gmail Help:** https://support.google.com/mail

---

## 🔐 Security Notes

1. **Never share App Password**
2. **Don't commit .env to git**
3. **Use different passwords for dev/prod**
4. **Revoke App Password if compromised**
5. **Monitor account for suspicious activity**

---

**That's it! Your app is now configured with Gmail SMTP. 100% free, 500 emails/day! 🎉**
