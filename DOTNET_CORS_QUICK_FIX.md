# Quick CORS Fix for .NET Backend on Heroku

## Your Backend Info
- **Repository**: `zaynrix/SAQS-kolla-backend`
- **Framework**: .NET (ASP.NET Core)
- **Heroku App**: `kolla` (https://kolla-cdb6b0d315ac.herokuapp.com)

## Step-by-Step Instructions

### 1. Open Your Backend Repository
Go to: `https://github.com/zaynrix/SAQS-kolla-backend`

### 2. Find the Main Configuration File
Look for one of these files:
- `Program.cs` (ASP.NET Core 6+)
- `Startup.cs` (ASP.NET Core 5 or earlier)
- `Startup.cs` in a `Startup` folder

### 3. Add CORS Configuration

#### If you have `Program.cs` (ASP.NET Core 6+):

Find the section where services are configured (usually near the top, after `var builder = WebApplication.CreateBuilder(args);`):

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
// ... other services ...

// ✅ ADD THIS: Configure CORS
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

var app = builder.Build();

// ✅ ADD THIS: Use CORS middleware (MUST be before UseAuthorization and MapControllers)
app.UseCors("AllowFrontend");

// Other middleware...
// app.UseAuthentication();
// app.UseAuthorization();
app.MapControllers();
```

#### If you have `Startup.cs` (ASP.NET Core 5 or earlier):

In the `ConfigureServices` method:

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    // ... other services ...

    // ✅ ADD THIS: Configure CORS
    services.AddCors(options =>
    {
        options.AddPolicy("AllowFrontend", policy =>
        {
            policy.WithOrigins(
                "https://zaynrix.github.io",
                "http://localhost:5174",
                "http://localhost:5173",
                "http://localhost:3000"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
        });
    });
}
```

In the `Configure` method (MUST be before `UseAuthorization`):

```csharp
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    // ... other middleware ...

    // ✅ ADD THIS: Use CORS (before UseAuthorization)
    app.UseCors("AllowFrontend");

    app.UseAuthentication();
    app.UseAuthorization();
    
    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

### 4. Important: Middleware Order

The CORS middleware **MUST** be in this order:

```
1. app.UseCors("AllowFrontend")  ← CORS FIRST
2. app.UseAuthentication()
3. app.UseAuthorization()
4. app.MapControllers() or app.UseEndpoints()
```

### 5. Commit and Push

```bash
git add .
git commit -m "Add CORS configuration for GitHub Pages frontend"
git push origin main
```

### 6. Deploy to Heroku

If you have automatic deployment from GitHub:
- The changes will deploy automatically
- Check the Heroku dashboard for deployment status

Or deploy manually:
```bash
git push heroku main
```

### 7. Test

After deployment, test in your browser console on GitHub Pages:

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

## Troubleshooting

### If CORS still doesn't work:

1. **Check middleware order** - CORS must be before Authorization
2. **Verify the origin** - Make sure `https://zaynrix.github.io` is exactly correct (no trailing slash)
3. **Check Heroku logs**: `heroku logs --tail --app kolla`
4. **Clear browser cache** and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Common Issues:

- **405 Method Not Allowed on OPTIONS**: Make sure `AllowAnyMethod()` includes OPTIONS
- **Still getting CORS errors**: Verify the middleware is actually being called (add logging)
- **Works locally but not on Heroku**: Check that the code was actually deployed

## Need Help?

If you can't find `Program.cs` or `Startup.cs`, check:
- The root directory of your backend repository
- Look for `.csproj` files to identify the project structure
- Check if there's a `Controllers` folder (indicates ASP.NET Core)

