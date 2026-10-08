import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/settings", tags=["Institution Settings"])

@router.get("", response_model=schemas.InstitutionSettingsOut)
def get_institution_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    settings = db.query(models.InstitutionSettings).first()
    if not settings:
        settings = models.InstitutionSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("", response_model=schemas.InstitutionSettingsOut)
def update_institution_settings(
    update_in: schemas.InstitutionSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.require_roles(["admin"]))
):
    settings = db.query(models.InstitutionSettings).first()
    if not settings:
        settings = models.InstitutionSettings()
        db.add(settings)

    for field, val in update_in.dict(exclude_unset=True).items():
        if val is not None:
            setattr(settings, field, val)

    settings.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(settings)

    db.add(models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="SETTINGS_UPDATE",
        entity_type="Settings",
        entity_id=str(settings.id),
        details=f"Updated institutional configuration thresholds: high={settings.high_risk_threshold}, med={settings.medium_risk_threshold}"
    ))
    db.commit()

    return settings
