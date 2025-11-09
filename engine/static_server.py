"""
Combined server that serves both FastAPI backend and Next.js frontend
"""

import os
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
    allow_origins=["https://relicon.co", "https://app.relicon.co", "https://relicon-full-production-35cc.up.railway.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the API under /api prefix
app.mount("/api", api_app)

# Serve Next.js static files
static_path = Path(__file__).parent.parent / ".next" / "static"
if static_path.exists():
    app.mount("/_next/static", StaticFiles(directory=str(static_path)), name="static")

# Serve public files
public_path = Path(__file__).parent.parent / "public"
if public_path.exists():
    app.mount("/public", StaticFiles(directory=str(public_path)), name="public")

@app.get("/{full_path:path}")
async def serve_frontend(request: Request, full_path: str):
    """Serve Next.js frontend with dual domain routing"""
    
    # Skip API routes
    if full_path.startswith("api/"):
        return {"error": "API route not found"}
    
    # Get hostname for domain detection
    hostname = request.headers.get("host", "")
    is_app_subdomain = hostname.startswith("app.") or hostname == "app.relicon.co"
    is_main_domain = hostname == "relicon.co" or "railway.app" in hostname
    
    # Handle app subdomain routing
    if is_app_subdomain:
        # App subdomain: serve login/dashboard
        if full_path == "" or full_path == "/":
            return RedirectResponse(url="/login")
        
        # Only allow app routes
        allowed_paths = ["login", "dashboard", "_next", "favicon"]
        if not any(full_path.startswith(path) for path in allowed_paths):
            return RedirectResponse(url="/dashboard")
    
    # Handle main domain routing  
    elif is_main_domain:
        # Main domain: redirect app routes to app subdomain
        if full_path.startswith("dashboard") or full_path == "login":
            return RedirectResponse(url=f"https://app.relicon.co/{full_path}")
        
        # Serve landing page and marketing content
        marketing_paths = ["", "/", "about", "contact", "join-waitlist", "_next", "favicon"]
        if not any(full_path.startswith(path) for path in marketing_paths):
            return RedirectResponse(url="/")
    
    # Try to serve specific page first
    page_paths = [
        Path(__file__).parent.parent / ".next" / "server" / "pages" / f"{full_path}.html",
        Path(__file__).parent.parent / ".next" / "server" / "app" / full_path / "page.html",
        Path(__file__).parent.parent / ".next" / "server" / "app" / "page.html"
    ]
    
    for page_path in page_paths:
        if page_path.exists():
            return FileResponse(str(page_path))
    
    # Fallback to index.html
    index_path = Path(__file__).parent.parent / "public" / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    
    return {"error": "Page not found"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
