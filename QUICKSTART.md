# Quick Start Guide

## Setup & Installation

### 1. Install Dependencies

Run the setup script (Linux/Mac):
```bash
chmod +x setup.sh
./setup.sh
```

Or manually:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

Copy and edit the backend `.env` file:
```bash
cd backend
cp .env.example .env
nano .env  # or use your preferred editor
```

**Important:** Update these variables in `.env`:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string

**Email Configuration (Gmail SMTP):**

1. **Enable 2FA**: https://myaccount.google.com/security
2. **Get App Password**: https://myaccount.google.com/apppasswords
3. **Update .env:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
EMAIL_FROM=E-commerce App <your.email@gmail.com>
```

📖 See [backend/GMAIL_SETUP.md](backend/GMAIL_SETUP.md) for detailed instructions

### 3. Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**Or use MongoDB Atlas** (cloud) and update `MONGODB_URI` accordingly.

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:3000

### 5. Test the Application

1. Open http://localhost:3000
2. Register a new account
3. Login with your credentials
4. Access the dashboard

## Default Test User

After registration, you can create a test user:
- Name: Test User
- Email: test@example.com
- Password: test123

## API Testing

You can test the API directly:

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## Troubleshooting

### MongoDB Connection Error
- Verify MongoDB is running: `mongod`
- Check connection string in `.env`

### Port Already in Use
- Backend: Change `PORT` in backend `.env`
- Frontend: Change port in `frontend/vite.config.js`

### Email Not Working
- Use Gmail App Password (not regular password)
- Enable 2-Factor Authentication
- Generate App Password from Google Account settings

## Mobile Testing

To test on mobile device:
1. Find your local IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
2. Update frontend `vite.config.js`:
   ```js
   server: {
     host: '0.0.0.0',
     port: 3000
   }
   ```
3. Access from mobile: `http://YOUR_IP:3000`

## Production Deployment

For production:
1. Set `NODE_ENV=production` in backend `.env`
2. Update `JWT_SECRET` to a secure value
3. Configure proper CORS origins
4. Use environment variables (not .env file)
5. Enable HTTPS
6. Build frontend: `cd frontend && npm run build`

## Tech Stack

- **Frontend:** React 18, Vite, Ant Design, React Router
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT
- **Authentication:** JWT tokens, bcrypt password hashing
- **Email:** Nodemailer for password reset

## Features

✅ User Registration
✅ User Login
✅ User Logout
✅ Forgot Password
✅ Reset Password
✅ Protected Routes
✅ Mobile-First Design
✅ JWT Authentication
✅ Form Validation

## Next Development Steps

Extend the app with:
- Product catalog
- Shopping cart
- Checkout process
- Order management
- Admin panel
- Payment integration
