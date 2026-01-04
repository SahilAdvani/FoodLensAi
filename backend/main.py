from fastapi import FastAPI
from routers import scan, analyze

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
