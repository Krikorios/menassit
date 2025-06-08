# MenAssist Production Deployment Guide

## Pre-deployment Checklist

### 1. Environment Setup
- [ ] Set NODE_ENV=production
- [ ] Configure DATABASE_URL with production PostgreSQL connection
- [ ] Set SESSION_SECRET to a secure random string
- [ ] Configure CORS_ORIGIN to your production domain

### 2. Required API Keys
The following API keys must be configured in your deployment environment:
- `ANTHROPIC_API_KEY` - For AI chat and joke generation
- `OPENAI_API_KEY` - Alternative AI provider (optional)

### 3. Database Migration
```bash
npm run db:push
```

### 4. Admin Account
- Email: admin@menassist.com
- Username: admin
- Password: password (change immediately after first login)

## Deployment Steps

### Option 1: Replit Deployments (Recommended)
1. Ensure all environment variables are set in Replit Secrets
2. Click the "Deploy" button in Replit
3. Configure custom domain if needed

### Option 2: Docker Deployment
```bash
# Build the image
docker build -t menassist .

# Run with environment variables
docker run -p 5000:5000 \
  -e DATABASE_URL="your_database_url" \
  -e SESSION_SECRET="your_session_secret" \
  -e ANTHROPIC_API_KEY="your_api_key" \
  menassist
```

### Option 3: Manual Deployment
```bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Start production server
npm run start
```

## Production Configuration

### Security Features
- HTTPS enforcement
- Session security with httpOnly and secure flags
- CORS protection
- Rate limiting
- Helmet security headers

### Performance Features
- Gzip compression
- Asset optimization
- Database connection pooling
- Request timeout handling

### Monitoring
- Health check endpoint: `/health`
- Application logs in JSON format
- Error tracking and reporting

## Environment Variables

### Required
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Secure random string for session encryption

### Optional
- `PORT` (default: 5000)
- `CORS_ORIGIN` (default: current domain)
- `LOG_LEVEL` (default: info)
- `CACHE_TTL` (default: 3600)

## Post-deployment Verification

1. Check health endpoint: `https://your-domain.com/health`
2. Login with admin credentials
3. Test voice features (requires HTTPS)
4. Verify AI functionality
5. Test task and financial features

## Troubleshooting

### Voice Features Not Working
- Ensure deployment is served over HTTPS
- Check browser permissions for microphone access
- Verify Web Speech API support in target browsers

### AI Features Not Working
- Verify API keys are correctly set
- Check API rate limits
- Review application logs for errors

### Database Connection Issues
- Verify DATABASE_URL format
- Check SSL configuration
- Ensure database accepts connections from deployment IP

## Security Recommendations

1. Change admin password immediately
2. Enable 2FA if available
3. Regularly update dependencies
4. Monitor access logs
5. Use secure session configuration
6. Implement proper backup strategy

## Scaling Considerations

- Database: Use connection pooling and read replicas
- Voice Processing: Consider external speech services for high traffic
- AI Services: Implement caching for frequent requests
- Static Assets: Use CDN for better performance