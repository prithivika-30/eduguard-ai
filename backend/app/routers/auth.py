from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=schemas.Token)
def login(login_req: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == login_req.email).first()
    if not user or not auth.verify_password(login_req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is deactivated")

    access_token = auth.create_access_token(data={"sub": user.email, "role": user.role})
    
    # Audit log
    log = models.AuditLog(
        user_id=user.id,
        user_email=user.email,
        action="LOGIN",
        entity_type="User",
        entity_id=str(user.id),
        details=f"Successful login with role: {user.role}"
    )
    db.add(log)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    log = models.AuditLog(
        user_id=current_user.id,
        user_email=current_user.email,
        action="LOGOUT",
        entity_type="User",
        entity_id=str(current_user.id),
        details="User logged out"
    )
    db.add(log)
    db.commit()
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=schemas.UserOut)
def get_current_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
