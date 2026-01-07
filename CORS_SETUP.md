# CORS Configuration Guide

## ⚠️ IMPORTANT: This is a BACKEND Configuration Issue

**The CORS error must be fixed on the BACKEND server, not the frontend.**

When deploying the frontend to GitHub Pages (or any other domain), you may encounter CORS (Cross-Origin Resource Sharing) errors when trying to access the backend API at `https://kolla-cdb6b0d315ac.herokuapp.com`.

**See [BACKEND_CORS_FIX.md](./BACKEND_CORS_FIX.md) for detailed backend configuration instructions.**

## Error Message

```
Access to fetch at 'https://kolla-cdb6b0d315ac.herokuapp.com/Actor/GetAll' 
from origin 'https://zaynrix.github.io' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solution

The backend server needs to be configured to allow requests from your frontend domain. You need to add CORS headers to the backend API.

### Required Backend Configuration

The backend needs to include the following CORS headers in its responses:

```
Access-Control-Allow-Origin: https://zaynrix.github.io
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true (if using cookies/auth)
```

### For Multiple Origins

If you need to support multiple origins (e.g., localhost for development and GitHub Pages for production), configure the backend to check the `Origin` header and respond with the appropriate `Access-Control-Allow-Origin` value.

### Example Backend Configuration (ASP.NET Core)

If your backend is ASP.NET Core, add this to your `Program.cs` or `Startup.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://zaynrix.github.io",
            "http://localhost:5174",
            "http://localhost:5173"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

// Then use it:
app.UseCors("AllowFrontend");
```

### Alternative: Use a CORS Proxy (Not Recommended for Production)

If you cannot modify the backend, you could use a CORS proxy service, but this is **not recommended** for production as it:
- Adds latency
- May have security implications
- Depends on a third-party service

If you must use a proxy, you can set the `VITE_API_BASE_URL` environment variable to point to a CORS proxy service.

## Testing

After configuring CORS on the backend:

1. Clear your browser cache
2. Reload the application
3. Check the browser console for any remaining CORS errors
4. Verify that API requests are successful

## Development vs Production

- **Development**: The Vite dev server uses a proxy (`/api`) to avoid CORS issues
- **Production**: Direct requests to the backend require proper CORS configuration

## Current Configuration

- **Development API URL**: `/api` (proxied by Vite to Heroku)
- **Production API URL**: `https://kolla-cdb6b0d315ac.herokuapp.com` (direct, requires CORS)

To override the production API URL, set the `VITE_API_BASE_URL` environment variable during build.

