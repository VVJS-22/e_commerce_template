# E-Commerce MERN Application

A full-stack e-commerce application built with MongoDB, Express.js, React, and Node.js (MERN stack) featuring a complete authentication system.

## Features

### Authentication Module
- ✅ User Registration with validation
- ✅ User Login with JWT tokens
- ✅ User Logout
- ✅ Forgot Password with email
- ✅ Reset Password functionality
- ✅ Protected routes
- ✅ Mobile-first responsive design with Ant Design

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Winston** - Application logging
- **Morgan** - HTTP request logging

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Ant Design** - UI component library
- **React Router** - Routing
- **Axios** - HTTP client

## Project Structure

```
ecom/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── authController.js
│   ├── logs/
│   │   ├── combined.log
│   │   ├── error.log
│   │   ├── exceptions.log
│   │   └── rejections.log
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── utils/
│   │   ├── logger.js
│   │   └── sendEmail.js
│   ├── .env.example
│   ├── LOGGING.md
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── services/
│   │   │   └── authService.js
│   │   ├── styles/
│   │   │   ├── auth.css
│   │   │   ├── dashboard.css
│   │   │   └── global.css
│   │   ├── utils/
│   │   │   └── axios.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ecom
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file from example
   cp .env.example .env
   
   # Edit .env file with your configuration
   # - Set MONGODB_URI to your MongoDB connection string
   # - Set JWT_SECRET to a secure random string
   # - Configure email settings for forgot password feature
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start MongoDB**

   **Option A: Using Docker (Recommended)**
   ```bash
   sudo docker run -d --name ecom-mongodb -p 27017:27017 -e MONGO_INITDB_DATABASE=ecom mongo:7
   ```

   **Option B: Local MongoDB**
   ```bash
   mongod
   ```

   **Option C: MongoDB Atlas (Cloud)**
   - Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Update `MONGODB_URI` in backend/.env with connection string

2. **Start Backend Server**
   ```bash
   cd backend
   npm start
   # Server runs on http://localhost:5000
   ```

3. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   # App runs on http://localhost:3000
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/auth/logout` | Logout user | Yes |
| POST | `/api/auth/forgotpassword` | Request password reset | No |
| PUT | `/api/auth/resetpassword/:token` | Reset password | No |

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecom
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@ecom.com
```

## Mobile-First Design

The application is built with a mobile-first approach:
- Responsive layouts that work on all screen sizes
- Touch-friendly buttons and inputs
- Optimized for mobile performance
- Progressive enhancement for larger screens

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px

## Features in Detail

### User Registration
- Name, email, and password validation
- Password confirmation
- Duplicate email check
- Automatic login after registration

### User Login
- Email and password authentication
- Remember me option
- JWT token generation
- Automatic redirect to dashboard

### Forgot Password
- Email-based password reset
- Secure token generation (10-minute expiry)
- Email notification

### Reset Password
- Token validation
- New password confirmation
- Automatic login after reset

### Protected Routes
- JWT token verification
- Automatic redirect to login for unauthorized access
- Token stored in localStorage

### Dashboard
- User profile information
- Quick stats display
- Account action shortcuts
- Logout functionality

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Password reset token expiration
- Input validation
- CORS configuration
- HTTP-only cookies support

## Logging & Monitoring

The application includes a comprehensive logging system using **Winston** and **Morgan**:

### Logged Activities
- ✅ All authentication events (register, login, logout)
- ✅ Failed login attempts with reasons
- ✅ Unauthorized access attempts
- ✅ Password reset requests
- ✅ HTTP requests (method, URL, status, response time)
- ✅ Database connection status
- ✅ Application errors with stack traces

### Log Files
Located in `backend/logs/`:
- `combined.log` - All application logs
- `error.log` - Error-level logs only
- `exceptions.log` - Unhandled exceptions
- `rejections.log` - Unhandled promise rejections

### View Logs
```bash
# View all logs
cat backend/logs/combined.log

# View recent logs
tail -f backend/logs/combined.log

# View only errors
cat backend/logs/error.log

# Search logs
grep "user@example.com" backend/logs/combined.log
```

📖 **Detailed documentation**: See [backend/LOGGING.md](backend/LOGGING.md)

## Future Enhancements

- [ ] Email verification on registration
- [ ] Social authentication (Google, Facebook)
- [ ] Two-factor authentication
- [ ] User profile editing
- [ ] Product catalog
- [ ] Shopping cart
- [ ] Order management
- [ ] Payment integration
- [ ] Admin panel

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity

### Email Not Sending
- Verify EMAIL_* variables in .env
- For Gmail, use App Password instead of regular password
- Enable "Less secure app access" or use OAuth2

### Port Already in Use
- Change PORT in backend .env file
- Change port in frontend vite.config.js

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email your-email@example.com or create an issue in the repository.
