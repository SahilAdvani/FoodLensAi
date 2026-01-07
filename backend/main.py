from fastapi import FastAPI
from routers import scan, analyze, session, chat, tts      
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

ENV = os.getenv("ENV", "development")

if ENV == "production":
    allowed_origins = [os.getenv("PROD_ORIGIN")]
else:
    allowed_origins = [os.getenv("DEV_ORIGIN", "http://localhost:5173")]

app = FastAPI(
    title="Food Lens AI",
    description="OCR + Ingredient Intelligence API",       
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(scan.router)
app.include_router(analyze.router)
app.include_router(session.router)
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(tts.router)


@app.get("/")
def health_check():
    return {
        "status": "Backend is running",
        "env": ENV
    }
    