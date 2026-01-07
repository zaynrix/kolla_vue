# CORS Configuration Changes for Your Backend

## What to Change

You need to add **2 sections** to your `Program.cs` file:

### 1. Add CORS Service Configuration

Add this **after** `var builder = WebApplication.CreateBuilder(args);` and **before** your other service registrations:

```csharp
// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://zaynrix.github.io",           // GitHub Pages (production)
            "http://localhost:5174",               // Local dev (Vite default)
            "http://localhost:5173",               // Local dev (alternative port)
            "http://localhost:3000"                // Local dev (if using different port)
        )
        .AllowAnyMethod()                          // Allow GET, POST, PUT, DELETE, PATCH, OPTIONS
        .AllowAnyHeader()                          // Allow any headers (Content-Type, Authorization, etc.)
        .AllowCredentials();                       // Allow cookies/auth if needed
    });
});
```

### 2. Add CORS Middleware

Add this **after** `var app = builder.Build();` and **before** your endpoint mappings:

```csharp
// Use CORS middleware (MUST be before endpoint mapping)
app.UseCors("AllowFrontend");
```

## Complete Updated Program.cs

See `Program.cs.UPDATED` for the complete file with CORS already added.

## Important Notes

1. **Order matters**: `app.UseCors()` must be called **before** `ObjectiveEndpoints.Map(app)` and other endpoint mappings
2. **Origins**: Make sure `https://zaynrix.github.io` is exactly correct (no trailing slash)
3. **Deploy**: After making changes, commit and push to trigger Heroku deployment

## Steps to Apply

1. Open your backend repository: `https://github.com/zaynrix/SAQS-kolla-backend`
2. Open `Program.cs`
3. Add the two code sections shown above
4. Save and commit:
   ```bash
   git add Program.cs
   git commit -m "Add CORS configuration for GitHub Pages frontend"
   git push origin main
   ```
5. Wait for Heroku to auto-deploy (or deploy manually)
6. Test your frontend - it should work now!

## Testing After Deployment

After deploying, test in your browser console on GitHub Pages:

```javascript
fetch('https://kolla-cdb6b0d315ac.herokuapp.com/Actor/GetAll')
  .then(r => {
    console.log('Status:', r.status);
    console.log('CORS Header:', r.headers.get('Access-Control-Allow-Origin'));
    return r.json();
  })
  .then(d => console.log('✅ CORS Works!', d))
  .catch(e => console.error('❌ Error:', e));
```

If you see the data and the CORS header, it's working!

