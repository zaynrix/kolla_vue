# Backend CORS Configuration - REQUIRED FIX

## ⚠️ CRITICAL: This is a BACKEND issue, not a frontend issue

The CORS error you're seeing is because **the backend server needs to be configured** to allow requests from your GitHub Pages domain.

## The Problem

- **Frontend**: Deployed at `https://zaynrix.github.io`
- **Backend**: Deployed at `https://kolla-cdb6b0d315ac.herokuapp.com`
- **Issue**: Backend is blocking requests from GitHub Pages due to CORS policy

## Solution: Configure CORS on Your Backend

You need to modify your **backend code** (the one deployed to Heroku) to allow CORS requests from GitHub Pages.

### Option 1: ASP.NET Core (C#) Backend

If your backend is ASP.NET Core, add this to your `Program.cs` or `Startup.cs`:

```csharp
// Add CORS service
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://zaynrix.github.io",           // GitHub Pages
            "http://localhost:5174",               // Local dev
            "http://localhost:5173",               // Local dev (alternative port)
            "http://localhost:3000"                // Local dev (if using different port)
        )
        .AllowAnyMethod()                          // Allow GET, POST, PUT, DELETE, etc.
        .AllowAnyHeader()                          // Allow any headers
        .AllowCredentials();                       // Allow cookies/auth if needed
    });
});

// Use CORS middleware (must be before UseAuthorization and UseEndpoints)
app.UseCors("AllowFrontend");
```

**Important**: The `app.UseCors()` call must come **before** `app.UseAuthorization()` and `app.UseEndpoints()`.

### Option 2: Node.js/Express Backend

If your backend is Node.js/Express, add this:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Configure CORS
app.use(cors({
  origin: [
    'https://zaynrix.github.io',
    'http://localhost:5174',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Your other middleware and routes...
```

If you don't have the `cors` package installed:
```bash
npm install cors
```

### Option 3: Python/Flask Backend

If your backend is Flask (Python):

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Configure CORS
CORS(app, origins=[
    'https://zaynrix.github.io',
    'http://localhost:5174',
    'http://localhost:5173',
    'http://localhost:3000'
], supports_credentials=True)

# Your routes...
```

Install flask-cors if needed:
```bash
pip install flask-cors
```

### Option 4: Python/FastAPI Backend

If your backend is FastAPI:

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://zaynrix.github.io",
        "http://localhost:5174",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Your routes...
```

### Option 5: Java/Spring Boot Backend

If your backend is Spring Boot:

```java
@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins(
                        "https://zaynrix.github.io",
                        "http://localhost:5174",
                        "http://localhost:5173",
                        "http://localhost:3000"
                    )
                    .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

## Testing After Configuration

1. **Deploy the updated backend** to Heroku
2. **Clear browser cache** on your GitHub Pages site
3. **Reload the page** and check the browser console
4. **Verify** that API requests are now successful

## Quick Test

You can test if CORS is working by running this in your browser console on the GitHub Pages site:

```javascript
fetch('https://kolla-cdb6b0d315ac.herokuapp.com/Actor/GetAll', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('✅ CORS is working!', response);
  return response.json();
})
.then(data => console.log('Data:', data))
.catch(error => console.error('❌ CORS error:', error));
```

If you see the data, CORS is configured correctly. If you see a CORS error, the backend configuration is not correct.

## Important Notes

1. **Wildcard origins**: Don't use `*` for `Access-Control-Allow-Origin` if you're using credentials (cookies/auth)
2. **Preflight requests**: Make sure OPTIONS requests are handled correctly
3. **Order matters**: CORS middleware must be configured before other middleware that handles requests
4. **Multiple origins**: If you need to support multiple origins, you may need to check the `Origin` header and respond dynamically

## Still Having Issues?

1. Check your backend logs on Heroku to see if requests are reaching the server
2. Verify the CORS middleware is actually being executed
3. Test with a tool like Postman or curl to verify the backend is working
4. Check that the backend is actually deployed with the CORS changes

## Need Help?

If you're not sure what backend framework you're using, check:
- Your backend repository
- The `package.json` or `requirements.txt` file
- The language/framework used in your backend code

