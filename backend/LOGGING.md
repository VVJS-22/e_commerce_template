# Application Logging System

## Overview

The application uses **Winston** for comprehensive logging and **Morgan** for HTTP request logging. All logs are captured with timestamps, log levels, and contextual information.

## Log Levels

- **error**: Error events that might still allow the application to continue running
- **warn**: Warning events that indicate potential issues
- **info**: Informational messages that highlight application progress
- **http**: HTTP request/response logs
- **debug**: Detailed debugging information

## Log Files Location

All logs are stored in `backend/logs/`:

```
backend/logs/
├── combined.log      # All logs
├── error.log         # Error-level logs only
├── exceptions.log    # Unhandled exceptions
└── rejections.log    # Unhandled promise rejections
```

## Log Features

### 1. **Console Logging**
- Color-coded output for different log levels
- Timestamp included
- Stack traces for errors

### 2. **File Logging**
- Automatic log rotation (5MB max per file, keeps 5 files)
- JSON format for easy parsing
- Separate error log file

### 3. **HTTP Request Logging**
- All incoming requests logged
- Response times tracked
- Status codes captured

## Logged Activities

### Authentication Events
- ✅ Registration attempts (with email)
- ✅ Successful registrations
- ✅ Login attempts
- ✅ Failed login attempts (with reason)
- ✅ Password reset requests
- ✅ Password reset email sent
- ✅ User logout

### Security Events
- ✅ Unauthorized access attempts
- ✅ Invalid tokens
- ✅ Missing credentials

### System Events
- ✅ Server startup
- ✅ MongoDB connection status
- ✅ Database disconnections
- ✅ Unhandled errors
- ✅ HTTP requests (method, URL, status, response time)

## Viewing Logs

### Real-time Logs (Console)
The backend server outputs colored logs to the console:
```
2026-03-15 01:30:32 info: Server running in development mode on port 5000
2026-03-15 01:31:04 info: Registration attempt for email: test@example.com
2026-03-15 01:31:04 info: User registered successfully: test@example.com
```

### View All Logs
```bash
cd backend
cat logs/combined.log
```

### View Recent Logs
```bash
cd backend
tail -f logs/combined.log
```

### View Only Errors
```bash
cd backend
cat logs/error.log
```

### View Real-time Logs (Follow Mode)
```bash
cd backend
tail -f logs/combined.log
```

### Search Logs
```bash
# Search for specific email
grep "test@example.com" logs/combined.log

# Search for errors
grep '"level":"error"' logs/combined.log

# Search for today's logs
grep "$(date +%Y-%m-%d)" logs/combined.log
```

## Log Format

### JSON Format (File Logs)
```json
{
  "level": "info",
  "message": "User registered successfully: test@example.com",
  "timestamp": "2026-03-15 01:31:04"
}
```

### Console Format
```
2026-03-15 01:31:04 info: User registered successfully: test@example.com
```

### HTTP Request Format (Morgan)
```
GET / 200 15.234 ms - 48
POST /api/auth/register 201 234.567 ms - 299
```

## Usage in Code

The logger is already integrated throughout the application:

```javascript
const logger = require('../utils/logger');

// Info level
logger.info('User registered successfully: user@example.com');

// Warning level
logger.warn('Login failed - invalid password for: user@example.com');

// Error level with stack trace
logger.error(`Database error: ${error.message}`, { stack: error.stack });

// Debug level
logger.debug('Token verified successfully');
```

## Production Considerations

### 1. **Log Rotation**
Logs automatically rotate when they reach 5MB. Keeps last 5 files.

### 2. **Performance**
Asynchronous logging doesn't block application execution.

### 3. **Security**
- Passwords are NEVER logged
- Sensitive data is not included in logs
- Only email addresses are logged (not full user data)

### 4. **Storage**
- Monitor log directory size: `du -sh backend/logs`
- Clear old logs: `rm backend/logs/*.log.1`

### 5. **External Logging Services**
For production, consider integrating with:
- **Loggly**
- **Papertrail**
- **Elastic Stack (ELK)**
- **Datadog**
- **CloudWatch** (AWS)

To add external service:
```javascript
// In backend/utils/logger.js
logger.add(new winston.transports.Http({
  host: 'logs.example.com',
  port: 8080,
  path: '/logs'
}));
```

## Troubleshooting

### Logs Not Appearing
1. Check if logs directory exists: `ls backend/logs/`
2. Check file permissions: `ls -la backend/logs/`
3. Verify logger is imported: `const logger = require('../utils/logger')`

### Log Files Too Large
```bash
# Check log file sizes
du -h backend/logs/*.log

# Clear all logs (be careful!)
rm backend/logs/*.log

# The files will be recreated automatically
```

### View HTTP Requests Only
```bash
grep '"level":"http"' logs/combined.log
```

## Example Log Entries

### Successful Registration
```json
{"level":"info","message":"Registration attempt for email: john@example.com","timestamp":"2026-03-15 10:15:30"}
{"level":"info","message":"User registered successfully: john@example.com","timestamp":"2026-03-15 10:15:31"}
```

### Failed Login
```json
{"level":"info","message":"Login attempt for email: john@example.com","timestamp":"2026-03-15 10:20:15"}
{"level":"warn","message":"Login failed - invalid password for: john@example.com","timestamp":"2026-03-15 10:20:15"}
```

### Unauthorized Access
```json
{"level":"warn","message":"Unauthorized access attempt - no token provided","timestamp":"2026-03-15 10:25:00"}
```

### Server Error
```json
{"level":"error","message":"Database connection error: Connection timeout","timestamp":"2026-03-15 10:30:00","stack":"Error: Connection timeout\n    at..."}
```

## Benefits

✅ **Debugging**: Quickly identify issues and trace user actions
✅ **Security**: Track unauthorized access attempts
✅ **Performance**: Monitor response times and slow endpoints
✅ **Audit Trail**: Complete history of user activities
✅ **Compliance**: Meet audit and regulatory requirements
✅ **Monitoring**: Real-time application health insights

## Best Practices

1. **Log appropriate levels**: Use info for normal operations, warn for concerning events, error for failures
2. **Include context**: Add relevant data (user email, request ID, etc.)
3. **Don't log sensitive data**: Never log passwords, tokens, or PII
4. **Monitor log volume**: Set up alerts for excessive error rates
5. **Regular review**: Periodically review logs for patterns and issues
6. **Backup logs**: Consider archiving logs for compliance

## Dashboard (Optional Future Enhancement)

For visual log monitoring, consider:
- **Grafana** + **Loki** for log visualization
- **Kibana** for Elasticsearch logs
- **Winston Dashboard** for real-time monitoring
