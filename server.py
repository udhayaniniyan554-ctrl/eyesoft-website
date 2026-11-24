"""
EYESOFT - EXPERIENCE THE LIVE
Production Full-Stack Application Server
FastAPI + SQLite3 + JWT + Bcrypt + Uvicorn
"""

import os
import shutil
import uuid
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from dotenv import load_dotenv

from backend.database import (
    init_db, get_stats, get_products, get_product, create_product, update_product, delete_product,
    get_categories, get_clients, create_client, update_client, delete_client,
    get_all_news, get_news_article, create_news_article, update_news_article, delete_news_article,
    get_settings, update_settings, get_user_by_username, verify_password, update_user_password
)
from backend.auth import (
    LoginRequest, PasswordChangeRequest,
    ClientCreate, NewsCreate, ProductCreate, ContactUpdate,
    create_access_token, get_current_admin
)

load_dotenv()

# Base directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
ADMIN_DIR = os.path.join(BASE_DIR, "admin")
UPLOADS_DIR = os.path.join(ASSETS_DIR, "images", "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

# Initialize database
init_db(
    default_admin_user=os.getenv("ADMIN_DEFAULT_USERNAME", "admin"),
    default_admin_pass=os.getenv("ADMIN_DEFAULT_PASSWORD", "Eyesoft@Admin2026")
)

app = FastAPI(
    title="EYESOFT Enterprise API",
    description="Full-stack REST API for EYESOFT Audio Visual Solutions",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# Public & Utility APIs
# ==============================================================================

@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "EYESOFT", "tagline": "EXPERIENCE THE LIVE", "version": "2.0.0"}

@app.get("/api/stats")
def get_site_stats():
    return get_stats()

# ==============================================================================
# Authentication APIs
# ==============================================================================

@app.post("/api/auth/login")
def login(creds: LoginRequest):
    user = get_user_by_username(creds.username)
    if not user or not verify_password(creds.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    token = create_access_token({"sub": user["username"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "role": user["role"],
            "full_name": user["full_name"]
        }
    }

@app.get("/api/auth/me")
def get_current_user_profile(user: dict = Depends(get_current_admin)):
    return {
        "id": user["id"],
        "username": user["username"],
        "role": user["role"],
        "full_name": user["full_name"]
    }

@app.post("/api/auth/change-password")
def change_admin_password(req: PasswordChangeRequest, user: dict = Depends(get_current_admin)):
    if not verify_password(req.current_password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password verification failed"
        )
    update_user_password(user["username"], req.new_password)
    return {"status": "success", "message": "Password updated successfully"}

# ==============================================================================
# Products APIs
# ==============================================================================

@app.get("/api/products")
def list_products(category: str = Query(None), search: str = Query(None)):
    return get_products(category_id=category, search=search)

@app.get("/api/products/{id_or_slug}")
def retrieve_product(id_or_slug: str):
    prod = get_product(id_or_slug)
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    return prod

@app.post("/api/admin/products")
def admin_create_product(prod: ProductCreate, user: dict = Depends(get_current_admin)):
    try:
        new_prod = create_product(prod.dict())
        return {"status": "success", "product": new_prod}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.put("/api/admin/products/{product_id}")
def admin_update_product(product_id: str, data: dict, user: dict = Depends(get_current_admin)):
    updated = update_product(product_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Product not found or update failed")
    return {"status": "success", "product": updated}

@app.delete("/api/admin/products/{product_id}")
def admin_delete_product(product_id: str, user: dict = Depends(get_current_admin)):
    deleted = delete_product(product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "success", "message": "Product permanently deleted from database"}

# ==============================================================================
# Categories APIs
# ==============================================================================

@app.get("/api/categories")
def list_categories():
    return get_categories()

# ==============================================================================
# Clients APIs (26 Official Clients)
# ==============================================================================

@app.get("/api/clients")
def list_clients():
    return get_clients()

@app.post("/api/admin/clients")
def admin_create_client(client: ClientCreate, user: dict = Depends(get_current_admin)):
    created = create_client(client.name, client.sector, client.display_order or 0)
    return {"status": "success", "client": created}

@app.put("/api/admin/clients/{client_id}")
def admin_update_client(client_id: int, client: ClientCreate, user: dict = Depends(get_current_admin)):
    updated = update_client(client_id, client.name, client.sector, client.display_order or 0)
    if not updated:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"status": "success", "message": "Client updated successfully"}

@app.delete("/api/admin/clients/{client_id}")
def admin_delete_client(client_id: int, user: dict = Depends(get_current_admin)):
    deleted = delete_client(client_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Client not found")
    return {"status": "success", "message": "Client permanently deleted from database"}

# ==============================================================================
# News APIs
# ==============================================================================

@app.get("/api/news")
def list_news():
    return get_all_news()

@app.get("/api/news/{id_or_slug}")
def retrieve_news(id_or_slug: str):
    article = get_news_article(id_or_slug)
    if not article:
        raise HTTPException(status_code=404, detail="News article not found")
    return article

@app.post("/api/admin/news")
def admin_create_news(news: NewsCreate, user: dict = Depends(get_current_admin)):
    slug = news.slug or news.title.lower().replace(" ", "-").replace("/", "-")
    created = create_news_article(
        title=news.title,
        slug=slug,
        summary=news.summary,
        content=news.content,
        featured_image=news.featured_image,
        published_date=news.published_date,
        author=news.author or "EYESOFT Editorial Team"
    )
    return {"status": "success", "news": created}

@app.put("/api/admin/news/{news_id}")
def admin_update_news(news_id: int, news: NewsCreate, user: dict = Depends(get_current_admin)):
    slug = news.slug or news.title.lower().replace(" ", "-").replace("/", "-")
    updated = update_news_article(
        news_id=news_id,
        title=news.title,
        slug=slug,
        summary=news.summary,
        content=news.content,
        featured_image=news.featured_image,
        published_date=news.published_date,
        author=news.author or "EYESOFT Editorial Team"
    )
    if not updated:
        raise HTTPException(status_code=404, detail="News article not found")
    return {"status": "success", "message": "News article updated successfully"}

@app.delete("/api/admin/news/{news_id}")
def admin_delete_news(news_id: int, user: dict = Depends(get_current_admin)):
    deleted = delete_news_article(news_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="News article not found")
    return {"status": "success", "message": "News article permanently deleted from database"}

# ==============================================================================
# Contact & Settings APIs
# ==============================================================================

@app.get("/api/contact")
def get_contact_info():
    return get_settings()

@app.put("/api/admin/contact")
def admin_update_contact(body: ContactUpdate, user: dict = Depends(get_current_admin)):
    data = {k: v for k, v in body.dict().items() if v is not None}
    updated = update_settings(data)
    return {"status": "success", "settings": updated}

# ==============================================================================
# File Upload API (Protected)
# ==============================================================================

@app.post("/api/admin/upload")
async def upload_image(file: UploadFile = File(...), user: dict = Depends(get_current_admin)):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".svg"]:
        raise HTTPException(status_code=400, detail="Allowed formats: JPG, PNG, WEBP, SVG")
    
    filename = f"{uuid.uuid4().hex[:12]}{ext}"
    dest_path = os.path.join(UPLOADS_DIR, filename)
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {
        "status": "success",
        "url": f"assets/images/uploads/{filename}",
        "filename": filename
    }

# ==============================================================================
# Static Files & Frontend Routing
# ==============================================================================

# Mount assets directory
if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

@app.api_route("/admin", methods=["GET", "HEAD"])
def serve_admin_root():
    return FileResponse(os.path.join(ADMIN_DIR, "index.html"))

# Mount admin directory
if os.path.exists(ADMIN_DIR):
    app.mount("/admin", StaticFiles(directory=ADMIN_DIR, html=True), name="admin")

@app.get("/")
def serve_home():
    return FileResponse(os.path.join(BASE_DIR, "index.html"))

@app.get("/{filename}")
def serve_html_page(filename: str):
    file_path = os.path.join(BASE_DIR, filename)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Try adding .html
    if not filename.endswith(".html"):
        html_path = os.path.join(BASE_DIR, f"{filename}.html")
        if os.path.isfile(html_path):
            return FileResponse(html_path)
    
    raise HTTPException(status_code=404, detail="Page not found")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"==================================================")
    print(f"EYESOFT ENTERPRISE APPLICATION SERVER")
    print(f"Running at: http://localhost:{port}/")
    print(f"Admin Portal: http://localhost:{port}/admin/")
    print(f"API Docs: http://localhost:{port}/docs")
    print(f"==================================================")
    uvicorn.run(app, host=host, port=port)
