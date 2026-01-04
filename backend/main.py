from fastapi import FastAPI
from routers import scan, analyze
from supabase import create_client
import os

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)


app = FastAPI(
    title="Food Lens AI",
    description="OCR + Ingredient Intelligence API",
    version="0.1.0"
)

app.include_router(scan.router)
app.include_router(analyze.router)


@app.get("/")
def health_check():
    return {"status": "Backend is running"}
