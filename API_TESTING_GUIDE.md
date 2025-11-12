# API Testing Guide

This guide explains how to test the authentication API integration with the UI.

## Current Setup

The application is configured to work with a backend API at `http://localhost:3000/api` (configurable via `.env` file).

### Environment Configuration

- **API Base URL**: Set in `.env` file as `VITE_API_BASE_URL=http://localhost:3000/api`
- **Fallback**: If not set, defaults to `http://localhost:3000/api`

## Testing Options

### Option 1: With Backend Server

1. **Start your backend server** on `http://localhost:3000`
2. **Ensure these endpoints are available**:
   - `GET /api/health` - Health check endpoint
   - `POST /api/auth/login` - User login
   - `POST /api/auth/register` - User registration
   - `GET /api/auth/profile` - Get user profile
   - `POST /api/auth/logout` - User logout
   - `POST /api/auth/refresh` - Refresh token

3. **Test the integration**:
   - Visit `http://localhost:8081`
   - Check the API Status indicator (should show green "Connected")
   - Try logging in with real credentials
   - Test role switching and logout functionality

### Option 2: Development Mode (No Backend Required)

1. **Visit the application** at `http://localhost:8081`
2. **Click "Dev Mode"** button at the bottom of the login page
3. **Enable Mock Authentication** toggle
4. **Quick login options**:
   - 🔑 **Admin** - Full system access
   - 👨‍💼 **Farm Manager** - Management operations
   - 👷 **Worker** - Basic daily tasks

5. **Test UI features**:
   - Navigate through different pages
   - Test role-based access control
   - Verify permission-based UI elements
   - Test logout and role switching

## API Status Indicators

### Connection Status
- ✅ **Connected**: API is reachable and responding
- ❌ **Disconnected**: Cannot connect to API server
- ⏳ **Checking**: Testing connection...

### Error Handling
- Connection failures show helpful error messages
- Retry button available for failed connections
- Clear instructions for troubleshooting

## Expected API Response Formats

### Login Response
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "Admin" | "Farm Manager" | "Worker",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  },
  "token": "JWT token string"
}
```

### Error Response
```json
{
  "error": "Error message string"
}
```

## Testing Checklist

### Authentication Flow
- [ ] API connection status displays correctly
- [ ] Login with valid credentials works
- [ ] Login with invalid credentials shows error
- [ ] Registration creates new user
- [ ] Logout clears session
- [ ] Token refresh works automatically
- [ ] Protected routes redirect when not authenticated

### Role-Based Access
- [ ] Admin can access all pages
- [ ] Farm Manager has appropriate access
- [ ] Worker has limited access
- [ ] Role switching works correctly
- [ ] UI elements show/hide based on permissions

### Development Mode
- [ ] Mock login bypasses API calls
- [ ] All roles can be tested
- [ ] UI functions correctly without backend
- [ ] Role switching works in mock mode

### Error Handling
- [ ] Network errors show user-friendly messages
- [ ] API errors are properly displayed
- [ ] Retry mechanisms work
- [ ] Graceful degradation when API is unavailable

## Troubleshooting

### Common Issues

1. **"Cannot connect to server"**
   - Check if backend is running on correct port
   - Verify CORS configuration on backend
   - Check network connectivity

2. **"Login failed"**
   - Verify credentials are correct
   - Check backend authentication logic
   - Review API response format

3. **"Token refresh failed"**
   - Check token expiration settings
   - Verify refresh endpoint implementation
   - Review token storage mechanism

### Development Tips

- Use browser DevTools Network tab to inspect API calls
- Check console for detailed error messages
- Use Development Mode for UI testing without backend
- Monitor the terminal for compilation errors

## Next Steps

Once you have a working backend:

1. Update the `.env` file with your actual API URL
2. Test all authentication endpoints
3. Verify role-based access control
4. Test error scenarios
5. Deploy with proper environment configuration

The UI is fully prepared to work with your backend API and provides comprehensive testing tools for development.