import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.routers import (
    auth,
    dashboard,
    students,
    predictions,
    what_if,
    interventions,
    followups,
    datasets,
    models,
    analytics,
    reports,
    audit_logs,
    settings as institution_settings
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("eduguard")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema
    logger.info("Initializing EduGuard AI database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Run seed script
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        logger.error(f"Error during seeding: {e}")
    finally:
        db.close()
    
    yield

app = FastAPI(
    title="EduGuard AI API",
    description="Explainable Student Dropout Early Warning & Intervention Decision Support Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard.router, prefix=settings.API_V1_PREFIX)
app.include_router(students.router, prefix=settings.API_V1_PREFIX)
app.include_router(predictions.router, prefix=settings.API_V1_PREFIX)
app.include_router(what_if.router, prefix=settings.API_V1_PREFIX)
app.include_router(interventions.router, prefix=settings.API_V1_PREFIX)
app.include_router(followups.router, prefix=settings.API_V1_PREFIX)
app.include_router(datasets.router, prefix=settings.API_V1_PREFIX)
app.include_router(models.router, prefix=settings.API_V1_PREFIX)
app.include_router(analytics.router, prefix=settings.API_V1_PREFIX)
app.include_router(reports.router, prefix=settings.API_V1_PREFIX)
app.include_router(audit_logs.router, prefix=settings.API_V1_PREFIX)
app.include_router(institution_settings.router, prefix=settings.API_V1_PREFIX)

@app.get("/")
def root():
    return {
        "project": "EduGuard AI",
        "tagline": "Predict risk earlier. Support students sooner.",
        "status": "Operational",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "EduGuard AI Decision Support Platform",
        "version": "1.0.0"
    }
