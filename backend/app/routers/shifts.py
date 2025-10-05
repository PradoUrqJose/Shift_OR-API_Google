"""
Router para gestión de turnos
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import structlog

from app.database import get_db
from app.models import Shift
from app.schemas import ShiftCreate, ShiftUpdate, ShiftResponse

logger = structlog.get_logger()
router = APIRouter()

@router.post("/", response_model=ShiftResponse)
async def create_shift(
    shift: ShiftCreate,
    db: Session = Depends(get_db)
):
    """
    Crear nuevo turno
    """
    try:
        # Crear turno
        db_shift = Shift(
            name=shift.name,
            start_time=shift.start_time,
            end_time=shift.end_time,
            day_of_week=shift.day_of_week,
            required_skills=','.join(shift.required_skills) if shift.required_skills else None,
            min_employees=shift.min_employees,
            max_employees=shift.max_employees,
            cost_multiplier=shift.cost_multiplier
        )
        
        db.add(db_shift)
        db.commit()
        db.refresh(db_shift)
        
        logger.info(f"Turno creado: {db_shift.id}")
        
        return ShiftResponse(
            id=db_shift.id,
            name=db_shift.name,
            start_time=db_shift.start_time,
            end_time=db_shift.end_time,
            day_of_week=db_shift.day_of_week,
            required_skills=db_shift.required_skills.split(',') if db_shift.required_skills else [],
            min_employees=db_shift.min_employees,
            max_employees=db_shift.max_employees,
            cost_multiplier=db_shift.cost_multiplier,
            is_active=db_shift.is_active,
            created_at=db_shift.created_at,
            updated_at=db_shift.updated_at
        )
        
    except Exception as e:
        logger.error(f"Error creando turno: {e}")
        raise HTTPException(status_code=500, detail="Error creando turno")

@router.get("/", response_model=List[ShiftResponse])
async def get_shifts(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """
    Obtener lista de turnos
    """
    try:
        query = db.query(Shift)
        
        if active_only:
            query = query.filter(Shift.is_active == True)
        
        shifts = query.offset(skip).limit(limit).all()
        
        return [
            ShiftResponse(
                id=shift.id,
                name=shift.name,
                start_time=shift.start_time,
                end_time=shift.end_time,
                day_of_week=shift.day_of_week,
                required_skills=shift.required_skills.split(',') if shift.required_skills else [],
                min_employees=shift.min_employees,
                max_employees=shift.max_employees,
                cost_multiplier=shift.cost_multiplier,
                is_active=shift.is_active,
                created_at=shift.created_at,
                updated_at=shift.updated_at
            )
            for shift in shifts
        ]
        
    except Exception as e:
        logger.error(f"Error obteniendo turnos: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo turnos")

@router.get("/{shift_id}", response_model=ShiftResponse)
async def get_shift(
    shift_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener turno por ID
    """
    try:
        shift = db.query(Shift).filter(Shift.id == shift_id).first()
        
        if not shift:
            raise HTTPException(status_code=404, detail="Turno no encontrado")
        
        return ShiftResponse(
            id=shift.id,
            name=shift.name,
            start_time=shift.start_time,
            end_time=shift.end_time,
            day_of_week=shift.day_of_week,
            required_skills=shift.required_skills.split(',') if shift.required_skills else [],
            min_employees=shift.min_employees,
            max_employees=shift.max_employees,
            cost_multiplier=shift.cost_multiplier,
            is_active=shift.is_active,
            created_at=shift.created_at,
            updated_at=shift.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo turno: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo turno")

@router.put("/{shift_id}", response_model=ShiftResponse)
async def update_shift(
    shift_id: int,
    shift_update: ShiftUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar turno
    """
    try:
        shift = db.query(Shift).filter(Shift.id == shift_id).first()
        
        if not shift:
            raise HTTPException(status_code=404, detail="Turno no encontrado")
        
        # Actualizar campos
        if shift_update.name is not None:
            shift.name = shift_update.name
        if shift_update.start_time is not None:
            shift.start_time = shift_update.start_time
        if shift_update.end_time is not None:
            shift.end_time = shift_update.end_time
        if shift_update.day_of_week is not None:
            shift.day_of_week = shift_update.day_of_week
        if shift_update.required_skills is not None:
            shift.required_skills = ','.join(shift_update.required_skills)
        if shift_update.min_employees is not None:
            shift.min_employees = shift_update.min_employees
        if shift_update.max_employees is not None:
            shift.max_employees = shift_update.max_employees
        if shift_update.cost_multiplier is not None:
            shift.cost_multiplier = shift_update.cost_multiplier
        if shift_update.is_active is not None:
            shift.is_active = shift_update.is_active
        
        db.commit()
        db.refresh(shift)
        
        logger.info(f"Turno actualizado: {shift_id}")
        
        return ShiftResponse(
            id=shift.id,
            name=shift.name,
            start_time=shift.start_time,
            end_time=shift.end_time,
            day_of_week=shift.day_of_week,
            required_skills=shift.required_skills.split(',') if shift.required_skills else [],
            min_employees=shift.min_employees,
            max_employees=shift.max_employees,
            cost_multiplier=shift.cost_multiplier,
            is_active=shift.is_active,
            created_at=shift.created_at,
            updated_at=shift.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando turno: {e}")
        raise HTTPException(status_code=500, detail="Error actualizando turno")

@router.delete("/{shift_id}")
async def delete_shift(
    shift_id: int,
    db: Session = Depends(get_db)
):
    """
    Eliminar turno (soft delete)
    """
    try:
        shift = db.query(Shift).filter(Shift.id == shift_id).first()
        
        if not shift:
            raise HTTPException(status_code=404, detail="Turno no encontrado")
        
        shift.is_active = False
        db.commit()
        
        logger.info(f"Turno eliminado: {shift_id}")
        
        return {"message": "Turno eliminado correctamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error eliminando turno: {e}")
        raise HTTPException(status_code=500, detail="Error eliminando turno")
