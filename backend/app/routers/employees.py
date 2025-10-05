"""
Router para gestión de empleados
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import structlog

from app.database import get_db
from app.models import Employee
from app.schemas import EmployeeCreate, EmployeeUpdate, EmployeeResponse

logger = structlog.get_logger()
router = APIRouter()

@router.post("/", response_model=EmployeeResponse)
async def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db)
):
    """
    Crear nuevo empleado
    """
    try:
        # Verificar si el email ya existe
        existing = db.query(Employee).filter(Employee.email == employee.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email ya registrado")
        
        # Crear empleado
        db_employee = Employee(
            name=employee.name,
            email=employee.email,
            phone=employee.phone,
            position=employee.position,
            skills=','.join(employee.skills) if employee.skills else None,
            availability=str(employee.availability) if employee.availability else None,
            preferences=str(employee.preferences) if employee.preferences else None,
            hourly_rate=employee.hourly_rate
        )
        
        db.add(db_employee)
        db.commit()
        db.refresh(db_employee)
        
        logger.info(f"Empleado creado: {db_employee.id}")
        
        return EmployeeResponse(
            id=db_employee.id,
            name=db_employee.name,
            email=db_employee.email,
            phone=db_employee.phone,
            position=db_employee.position,
            skills=db_employee.skills.split(',') if db_employee.skills else [],
            availability=db_employee.availability,
            preferences=db_employee.preferences,
            hourly_rate=db_employee.hourly_rate,
            is_active=db_employee.is_active,
            created_at=db_employee.created_at,
            updated_at=db_employee.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creando empleado: {e}")
        raise HTTPException(status_code=500, detail="Error creando empleado")

@router.get("/", response_model=List[EmployeeResponse])
async def get_employees(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """
    Obtener lista de empleados
    """
    try:
        query = db.query(Employee)
        
        if active_only:
            query = query.filter(Employee.is_active == True)
        
        employees = query.offset(skip).limit(limit).all()
        
        return [
            EmployeeResponse(
                id=emp.id,
                name=emp.name,
                email=emp.email,
                phone=emp.phone,
                position=emp.position,
                skills=emp.skills.split(',') if emp.skills else [],
                availability=emp.availability,
                preferences=emp.preferences,
                hourly_rate=emp.hourly_rate,
                is_active=emp.is_active,
                created_at=emp.created_at,
                updated_at=emp.updated_at
            )
            for emp in employees
        ]
        
    except Exception as e:
        logger.error(f"Error obteniendo empleados: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo empleados")

@router.get("/{employee_id}", response_model=EmployeeResponse)
async def get_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener empleado por ID
    """
    try:
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        
        if not employee:
            raise HTTPException(status_code=404, detail="Empleado no encontrado")
        
        return EmployeeResponse(
            id=employee.id,
            name=employee.name,
            email=employee.email,
            phone=employee.phone,
            position=employee.position,
            skills=employee.skills.split(',') if employee.skills else [],
            availability=employee.availability,
            preferences=employee.preferences,
            hourly_rate=employee.hourly_rate,
            is_active=employee.is_active,
            created_at=employee.created_at,
            updated_at=employee.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo empleado: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo empleado")

@router.put("/{employee_id}", response_model=EmployeeResponse)
async def update_employee(
    employee_id: int,
    employee_update: EmployeeUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar empleado
    """
    try:
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        
        if not employee:
            raise HTTPException(status_code=404, detail="Empleado no encontrado")
        
        # Actualizar campos
        if employee_update.name is not None:
            employee.name = employee_update.name
        if employee_update.email is not None:
            employee.email = employee_update.email
        if employee_update.phone is not None:
            employee.phone = employee_update.phone
        if employee_update.position is not None:
            employee.position = employee_update.position
        if employee_update.skills is not None:
            employee.skills = ','.join(employee_update.skills)
        if employee_update.availability is not None:
            employee.availability = str(employee_update.availability)
        if employee_update.preferences is not None:
            employee.preferences = str(employee_update.preferences)
        if employee_update.hourly_rate is not None:
            employee.hourly_rate = employee_update.hourly_rate
        if employee_update.is_active is not None:
            employee.is_active = employee_update.is_active
        
        db.commit()
        db.refresh(employee)
        
        logger.info(f"Empleado actualizado: {employee_id}")
        
        return EmployeeResponse(
            id=employee.id,
            name=employee.name,
            email=employee.email,
            phone=employee.phone,
            position=employee.position,
            skills=employee.skills.split(',') if employee.skills else [],
            availability=employee.availability,
            preferences=employee.preferences,
            hourly_rate=employee.hourly_rate,
            is_active=employee.is_active,
            created_at=employee.created_at,
            updated_at=employee.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando empleado: {e}")
        raise HTTPException(status_code=500, detail="Error actualizando empleado")

@router.delete("/{employee_id}")
async def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db)
):
    """
    Eliminar empleado (soft delete)
    """
    try:
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        
        if not employee:
            raise HTTPException(status_code=404, detail="Empleado no encontrado")
        
        employee.is_active = False
        db.commit()
        
        logger.info(f"Empleado eliminado: {employee_id}")
        
        return {"message": "Empleado eliminado correctamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error eliminando empleado: {e}")
        raise HTTPException(status_code=500, detail="Error eliminando empleado")
