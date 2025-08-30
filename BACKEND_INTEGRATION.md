# Backend Integration Guide

## Overview
This document outlines the changes made to integrate the Campor frontend with the local backend API.

## Backend URL
- **Local Backend**: `http://localhost:6160`
- **API Base URL**: Set via environment variable `VITE_API_BASE_URL` or defaults to localhost

## API Endpoints
The following authentication endpoints are now integrated:

### Authentication
- `POST /api/v1/auth/login` - User login (returns token only)
- `POST /api/v1/auth/register` - User registration (returns success message)
- `POST /api/v1/auth/email/verify` - Email verification (returns token + message)
- `POST /api/v1/auth/email/resend-verification` - Resend verification code (email only)
- `GET /api/v1/auth/me` - Get current user profile (requires token)
- `POST /api/v1/auth/password/forgot` - Forgot password (email only)
- `POST /api/v1/auth/password/reset` - Reset password (token + newPassword)

### User Management
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/v1/seller/onboarding` - Complete seller onboarding
- `GET /api/v1/seller/profile` - Get seller profile

## Key Changes Made

### 1. Updated Constants (`src/utils/constants.js`)
- Changed backend URL to localhost:6160
- Fixed API endpoints to include `/api/v1` prefix
- Added missing endpoints for password management and resend verification
- Maintained RUN email validation

### 2. Enhanced AuthService (`src/services/authService.js`)
- **Login**: Backend returns only token, then fetches user profile separately
- **Register**: Sends firstName, lastName, email, password as expected by backend
- **Verify**: Handles verification response with token
- **Resend Verification**: Added function to resend verification codes (email only)
- **Forgot Password**: Added function for password reset requests (email only)
- **Reset Password**: Added function to reset password with token
- Added proper error handling for different HTTP status codes
- Added request/response interceptors for token management

### 3. Improved AuthContext (`src/context/AuthContext.jsx`)
- Added automatic user profile fetching after login
- Enhanced error handling for unverified emails
- Automatic redirect to verification if email not verified
- Improved state management

### 4. Updated Components
- **Login**: Added "Forgot Password?" link
- **Register**: Real API integration with email storage for verification
- **Verify**: Enhanced with resend verification functionality (no password required)
- **ForgotPassword**: New component for password reset requests (email only)
- **ResetPassword**: New component for setting new password with reset token

### 5. Fixed Routing
- Added missing routes for ForgotPassword and ResetPassword
- Fixed import statements in App.jsx
- Proper navigation between auth components

## Data Flow

### Registration Flow
1. User submits registration form with firstName, lastName, email, password
2. Backend creates account and sends verification code to email
3. Email is stored in localStorage for verification
4. User is redirected to verification page
5. User enters 6-digit verification code
6. Upon successful verification, backend returns token
7. Frontend fetches user profile using token
8. User is logged in and redirected to marketplace

### Login Flow
1. User submits login credentials
2. Backend validates and returns token only
3. Frontend fetches user profile using token
4. Token and user data are stored in localStorage
5. User is redirected to marketplace

### Email Verification Flow
1. User receives 6-digit code via email
2. User enters code on verification page
3. Backend validates code and returns token
4. Frontend fetches user profile using token
5. User is automatically logged in

### Password Reset Flow
1. User clicks "Forgot Password?" on login page
2. User enters email only
3. Backend sends reset instructions to email
4. User clicks reset link in email (contains token)
5. User sets new password on reset page
6. User is redirected to login

## Error Handling
- **400**: Invalid registration data
- **401**: Unauthorized (invalid/expired token)
- **403**: Email not verified (redirects to verification)
- **409**: User already exists
- All errors show user-friendly messages
- Token expiration automatically redirects to login

## Testing
To test the integration:

1. **Start local backend**: Ensure backend is running on localhost:6160
2. **Registration**: Use a valid @run.edu.ng email
3. **Verification**: Check email for 6-digit code
4. **Login**: Use verified credentials
5. **Profile**: Check that user data is properly loaded
6. **Forgot Password**: Test password reset functionality
7. **Resend Verification**: Test resending verification codes

## Important Notes

### Backend API Structure
- **Login Response**: Only returns `{ token: "..." }`
- **Register Response**: Returns `{ message: "Registration successful..." }`
- **Verify Response**: Returns `{ message: "...", token: "..." }`
- **User Profile**: Fetched separately using `/me` endpoint

### Required Fields
- **Registration**: firstName, lastName, email, password
- **Login**: email, password
- **Verification**: email, code
- **Forgot Password**: email only
- **Reset Password**: token, newPassword
- **Resend Verification**: email only

### Email Validation
- Backend enforces @run.edu.ng email format
- Verification codes are sent automatically after registration
- Unverified emails cannot login (403 error)

## Next Steps
The following areas can be integrated next:
- Product management (CRUD operations)
- Cart and order management
- Seller dashboard functionality
- Payment integration

## Troubleshooting

### Common Issues
1. **400 Error**: Check that all required fields are provided
2. **403 Error**: Email not verified, check email for verification code
3. **409 Error**: User already exists with that email
4. **Connection Error**: Ensure backend is running on localhost:6160
5. **Login Redirect Issue**: Fixed by adding proper routes in App.jsx

### Debug Mode
Check browser console for detailed logging:
- 🔍 Registration/Login attempts
- ✅ Successful operations
- ❌ Error details with status codes

### Testing Tips
- Use valid @run.edu.ng emails for testing
- Check email spam folder for verification codes
- Monitor browser console for detailed API interactions
- Ensure local backend is running and accessible
- Test all auth flows: register → verify → login → forgot password → reset password
