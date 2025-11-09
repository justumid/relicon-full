"""
Combined server that serves both FastAPI backend and Next.js frontend
"""

import os
import sys
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

# Import the existing API server
from server import app as api_app

# Create the main app
app = FastAPI(title="Relicon Combined Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://relicon-full-production-35cc.up.railway.app", "https://app.relicon.co"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the API under /api prefix
app.mount("/api", api_app)

# Serve static files from Next.js build
static_path = Path(__file__).parent.parent / ".next" / "static"
if static_path.exists():
    app.mount("/_next/static", StaticFiles(directory=str(static_path)), name="static")

# Serve Next.js pages
@app.get("/{full_path:path}")
async def serve_frontend(request: Request, full_path: str):
    """Serve Next.js frontend with subdomain routing"""
    
    # Check if it's an API route
    if full_path.startswith("api/"):
        return {"error": "API route not found"}
    
    # Get hostname for subdomain detection
    hostname = request.headers.get("host", "")
    is_app_subdomain = hostname.startswith("app.") or hostname == "app.relicon.co"
    
    # Handle subdomain routing
    if is_app_subdomain:
        # App subdomain: serve login/dashboard
        if full_path == "" or full_path == "/":
            return RedirectResponse(url="/login")
        
        allowed_paths = ["login", "dashboard"]
        if not any(full_path.startswith(path) for path in allowed_paths):
            return RedirectResponse(url="/dashboard")
    else:
        # Main domain: redirect dashboard/login to app subdomain
        if full_path.startswith("dashboard") or full_path == "login":
            return RedirectResponse(url=f"https://app.relicon.co/{full_path}")
    
    # Serve index.html for all frontend routes
    index_path = Path(__file__).parent.parent / ".next" / "server" / "app" / "page.html"
    if not index_path.exists():
        index_path = Path(__file__).parent.parent / "public" / "index.html"
    
    if index_path.exists():
        return FileResponse(str(index_path))
    
    return {"error": "Frontend not built"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
