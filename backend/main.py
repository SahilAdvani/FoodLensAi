from fastapi import FastAPI
from routers import scan, analyze, session


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Food Lens AI",
    description="OCR + Ingredient Intelligence API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development, allow all. For prod, generic list.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router)
app.include_router(analyze.router)
app.include_router(session.router)


@app.get("/")
def health_check():
    return {"status": "Backend is running"}
