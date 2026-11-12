from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import datasets, analytics

app = FastAPI(
    title="DataNerds BI API",
    description="High-performance backend for open-source Excel analytics and Power BI alternative",
    version="0.1.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(datasets.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "DataNerds BI Core",
        "version": "0.1.0"
    }
