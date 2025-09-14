# Authentication Redirect System

This document explains the comprehensive authentication and redirect system implemented using Next.js middleware to handle unauthorized access and preserve user intent.

## Overview

The system uses Next.js middleware to automatically detect unauthorized access and handle redirects after login, ensuring users are sent back to their intended destination and any pending API requests are retried.

## Key Features

### 1. **Detect Unauthorized Access**
- **API Requests**: Axios interceptor catches 401 responses and stores the request for retry
- **Page Navigation**: Next.js middleware intercepts protected routes and redirects to login with URL parameters

### 2. **Preserve User Intent**
- **Page Navigation**: Middleware passes redirect URL as query parameter to login page
- **API Requests**: Stores full request details (URL, method, body, headers) in sessionStorage for retry

### 3. **Redirect to Login**
- Middleware automatically redirects to `/login?redirect=/intended-path` when accessing protected routes
- Axios interceptor redirects to `/login` for API-triggered authentication failures

### 4. **On Successful Login**
- Login action reads redirect parameter from URL and navigates user back
- Automatically retries all pending API requests with new access token
- Falls back to home page if no redirect URL is provided

### 5. **Edge Cases**
- **Refresh Token Fails**: Clears all stored data and redirects to login
- **Request Timeout**: Clears stored requests after 10 minutes
- **Request Fails Again**: Shows appropriate error without crashing the app

## Implementation Details

### Files Created/Modified

1. **`/middleware.js`** - Next.js middleware for route-level authentication
2. **`/lib/redirectUtils.js`** - Core utilities for managing redirects and pending requests
3. **`/contexts/AuthContext.jsx`** - React context for managing authentication state
4. **`/hooks/useAuthActions.js`** - Custom hook for auth-related actions
5. **`/hooks/useApiActions.js`** - Custom hook for API actions requiring auth
6. **`/lib/axiosInstance.js`** - Updated with redirect and retry logic
7. **`/components/pageComponents/loginAction.jsx`** - Updated to handle URL redirect parameters

### Usage Examples

#### 1. Protected Routes (Automatic via Middleware)
Routes are automatically protected by adding them to the middleware config:
```javascript
// middleware.js
const protectedRoutes = [
    "/profile",
    "/cart", 
    "/wishlist",
    "/orders",
    "/checkout",
    "/make-combo"
];
```

#### 2. Protecting API Actions
```jsx
import { useApiActions } from '@/hooks/useApiActions';

const MyComponent = () => {
    const { withAuth } = useApiActions();
    
    const handleProtectedApiCall = withAuth(async (data) => {
        // This will redirect to login if user is not authenticated
        // After login, this function will be called automatically
        const response = await fetch('/api/some-endpoint', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        return response.json();
    });
    
    return (
        <button onClick={() => handleProtectedApiCall('some data')}>
            Protected API Call
        </button>
    );
};
```

#### 3. Using Cart Actions
```jsx
import CartActionWrapper from '@/components/cart/CartActionWrapper';

const ProductCard = () => {
    return (
        <CartActionWrapper>
            {({ handleAddToCart, handleAddComboToCart }) => (
                <button onClick={() => handleAddToCart({ productID: '123', quantity: 1 })}>
                    Add to Cart
                </button>
            )}
        </CartActionWrapper>
    );
};
```

## Flow Diagram

```
User Action (Page/API)
    ↓
Middleware/Interceptor Check
    ↓
Not Authenticated?
    ↓ YES
Store Intent (URL Parameter/Request)
    ↓
Redirect to Login with URL Parameter
    ↓
User Logs In
    ↓
Read Redirect Parameter from URL
    ↓
Execute Intent (Navigate/Retry Request)
    ↓
Complete User Journey
```

## Configuration

### Protected Routes
Add routes to the middleware configuration in `middleware.js`:
```javascript
const protectedRoutes = [
    "/profile",
    "/cart", 
    "/wishlist",
    "/orders",
    "/checkout",
    "/make-combo"
];
```

### Request Timeout
Modify the timeout in `redirectUtils.js`:
```javascript
const REQUEST_TIMEOUT = 10 * 60 * 1000; // 10 minutes
```

### Skip Retry Patterns
Add patterns to skip in `redirectUtils.js`:
```javascript
const skipPatterns = [
    '/auth/login',
    '/auth/refresh-token',
    '/user/login',
    // ... other patterns
];
```

## Error Handling

The system handles various error scenarios:

1. **Network Errors**: Gracefully handles network failures during retry
2. **Invalid Tokens**: Clears all data and redirects to login
3. **Expired Requests**: Automatically cleans up old stored data
4. **Failed Retries**: Logs errors but doesn't crash the application

## Security Considerations

1. **Session Storage**: Uses sessionStorage (cleared on tab close) for temporary data
2. **Request Filtering**: Only retries safe requests (excludes auth endpoints)
3. **Timeout Protection**: Prevents indefinite storage of sensitive data
4. **Token Validation**: Always validates tokens before retrying requests

## Testing

To test the system:

1. **Page Protection**: Try accessing `/profile` without being logged in
2. **API Protection**: Try adding to cart without being logged in
3. **Redirect Flow**: Complete login and verify you're redirected back
4. **Request Retry**: Check console logs for retry attempts after login

## Troubleshooting

### Common Issues

1. **Infinite Redirect Loop**: Check if login page is marked as protected
2. **Requests Not Retrying**: Verify request patterns aren't in skip list
3. **Data Not Persisting**: Check if sessionStorage is available
4. **Context Errors**: Ensure AuthProvider wraps the app

### Debug Logs

Enable debug logging by checking console for:
- `[storeRedirectUrl]` - URL storage
- `[storePendingRequest]` - Request storage
- `[AuthContext]` - Context operations
- `[ProtectedRoute]` - Route protection
