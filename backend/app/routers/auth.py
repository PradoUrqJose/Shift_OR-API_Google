"""
Router para autenticación con Supabase
"""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Optional
import structlog

from app.database import get_db, supabase
from app.models import User
from app.schemas import UserResponse

logger = structlog.get_logger()
router = APIRouter()
security = HTTPBearer()

@router.get("/me", response_model=UserResponse)
async def get_current_user(
    token: str = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Obtener usuario actual desde token JWT
    """
    try:
        # Verificar token con Supabase
        response = supabase.auth.get_user(token)
        
        if not response.user:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        user_data = response.user
        
        # Buscar o crear usuario en la base de datos
        user = db.query(User).filter(User.id == user_data.id).first()
        
        if not user:
            # Crear nuevo usuario
            user = User(
                id=user_data.id,
                email=user_data.email,
                name=user_data.user_metadata.get('name', ''),
                role='user'
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            created_at=user.created_at
        )
        
    except Exception as e:
        logger.error(f"Error obteniendo usuario: {e}")
        raise HTTPException(status_code=401, detail="Error de autenticación")

@router.post("/logout")
async def logout():
    """
    Cerrar sesión
    """
    try:
        # Supabase maneja el logout automáticamente
        return {"message": "Sesión cerrada correctamente"}
        
    except Exception as e:
        logger.error(f"Error cerrando sesión: {e}")
        raise HTTPException(status_code=500, detail="Error cerrando sesión")
