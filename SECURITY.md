# 🔐 Security Guide - King Kebab Application

## Critical Security Fixes Applied

### 1. ✅ Fixed CRITICAL Vulnerability: Unprotected Admin Creation Endpoint

**Issue**: `/api/auth/create-admin` was accessible to anyone without authentication.

**Fix Applied**:

- Now requires either:
  - Master key in `X-Master-Key` header (set `MASTER_ADMIN_KEY` in `.env`)
  - OR existing admin authentication token
- Added password hashing (was missing!)
- Added security audit logging

### 2. ✅ Removed Frontend Bot Token Exposure

**Issue**: `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` was exposed in frontend code.

**Fix Applied**:

- Removed bot token from frontend
- All Telegram operations now go through backend
- Frontend can only test connection via authenticated backend endpoint

### 3. ✅ Moved Hardcoded Admin Chat IDs to Environment Variables

**Issue**: Admin chat IDs were hardcoded in source code.

**Fix Applied**:

- Moved to `TELEGRAM_ADMIN_CHAT_IDS` environment variable
- Format: `6808924520,158467590` (comma-separated)

### 4. ✅ Added Security Audit Logging

**Fix Applied**:

- All sensitive operations are now logged with:
  - Username
  - IP Address
  - Timestamp
  - User-Agent
- Logs include: admin creation, bot status checks, bot protection checks

### 5. ✅ Added Rate Limiting to Sensitive Endpoints

**Fix Applied**:

- General rate limit: 100 requests per 15 minutes
- Strict rate limit: 10 requests per 15 minutes for:
  - `/api/auth/create-admin`
  - `/api/telegram/*`
  - `/api/users/*`

### 6. ✅ Added Bot Protection Endpoint

**Fix Applied**:

- New endpoint: `GET /api/telegram/protect` (admin only)
- Allows admins to check bot status and detect unauthorized changes
- Logs all protection checks

## Required Environment Variables

Add these to your `.env` file:

```env
# Existing variables
TELEGRAM_BOT_TOKEN=your_bot_token_here
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=your_mongodb_uri_here

# NEW - Required for security
MASTER_ADMIN_KEY=your_secure_master_key_here
TELEGRAM_ADMIN_CHAT_IDS=6808924520,158467590
```

## Immediate Actions Required

### 1. 🔴 URGENT: Change Your Telegram Bot Token

If someone changed your bot's image/name, they have your bot token:

1. Go to [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/revoke` command
3. Get a new bot token
4. Update `TELEGRAM_BOT_TOKEN` in your `.env` file
5. Restart your backend server

### 2. 🔴 URGENT: Review All Admin Users

Check your database for unauthorized admin users:

```javascript
// Run in MongoDB
db.users.find({ isAdmin: true })
```

Remove any suspicious admin accounts.

### 3. 🔴 URGENT: Set Master Admin Key

Add to your `.env`:

```env
MASTER_ADMIN_KEY=generate_a_very_secure_random_string_here
```

### 4. 🔴 URGENT: Update Admin Chat IDs

Move to environment variable:

```env
TELEGRAM_ADMIN_CHAT_IDS=6808924520,158467590
```

### 5. Review Server Logs

Check your server logs for:

- Unauthorized admin creation attempts
- Suspicious bot access
- Failed authentication attempts

## Security Best Practices

### ✅ Implemented

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Admin-only endpoints protected
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ CORS configuration
- ✅ Audit logging

### 🔄 Recommended Next Steps

1. **Enable HTTPS** in production
2. **Add IP whitelisting** for admin endpoints
3. **Implement 2FA** for admin accounts
4. **Add database encryption** for sensitive data
5. **Set up monitoring/alerts** for security events
6. **Regular security audits** of user accounts
7. **Backup and recovery** procedures

## Monitoring Bot Security

Use the new protection endpoint to monitor your bot:

```bash
# Check bot status (requires admin auth)
GET /api/telegram/protect
Authorization: Bearer <admin_token>
```

This will show:

- Bot username
- Bot ID
- Current bot settings
- Any unauthorized changes

## Reporting Security Issues

If you discover any security vulnerabilities:

1. Do NOT create a public issue
2. Contact the development team immediately
3. Include details of the vulnerability
4. Wait for confirmation before disclosing

## Security Checklist

- [x] Fixed unprotected admin creation endpoint
- [x] Removed frontend bot token exposure
- [x] Moved hardcoded values to environment variables
- [x] Added audit logging
- [x] Added rate limiting
- [x] Added bot protection endpoint
- [ ] Changed Telegram bot token (URGENT)
- [ ] Set MASTER_ADMIN_KEY (URGENT)
- [ ] Reviewed all admin users
- [ ] Updated environment variables
- [ ] Enabled HTTPS in production
- [ ] Set up security monitoring

---

**Last Updated**: $(date)
**Version**: 1.0.0
