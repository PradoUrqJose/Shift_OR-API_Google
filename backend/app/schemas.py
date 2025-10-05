"""
Esquemas Pydantic para validación de datos
"""
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# Esquemas de Usuario
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "user"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Esquemas de Empleado
class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    position: Optional[str] = None
    skills: Optional[List[str]] = []
    availability: Optional[Dict[str, Any]] = {}
    preferences: Optional[Dict[str, Any]] = {}
    hourly_rate: float = 0.0

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    skills: Optional[List[str]] = None
    availability: Optional[Dict[str, Any]] = None
    preferences: Optional[Dict[str, Any]] = None
    hourly_rate: Optional[float] = None
    is_active: Optional[bool] = None

class EmployeeResponse(EmployeeBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Esquemas de Turno
class ShiftBase(BaseModel):
    name: str
    start_time: str
    end_time: str
    day_of_week: int
    required_skills: Optional[List[str]] = []
    min_employees: int = 1
    max_employees: int = 1
    cost_multiplier: float = 1.0

class ShiftCreate(ShiftBase):
    pass

class ShiftUpdate(BaseModel):
    name: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    day_of_week: Optional[int] = None
    required_skills: Optional[List[str]] = None
    min_employees: Optional[int] = None
    max_employees: Optional[int] = None
    cost_multiplier: Optional[float] = None
    is_active: Optional[bool] = None

class ShiftResponse(ShiftBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Esquemas de Solver
class SolverConstraints(BaseModel):
    start_date: datetime
    end_date: datetime
    max_hours_per_employee: int = 40
    min_rest_hours: int = 12
    prefer_employee_preferences: bool = True
    minimize_cost: bool = True

class SolverRunCreate(BaseModel):
    constraints: SolverConstraints

class SolverRunResponse(BaseModel):
    id: int
    run_id: str
    status: str
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    objective_value: Optional[float]
    solve_time: Optional[float]
    assignments_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Esquemas de Asignación
class AssignmentResponse(BaseModel):
    id: int
    employee_id: int
    shift_id: int
    date: datetime
    status: str
    employee_name: Optional[str] = None
    shift_name: Optional[str] = None
    
    class Config:
        from_attributes = True

# Esquemas de Reporte
class ReportData(BaseModel):
    solver_run: SolverRunResponse
    assignments: List[AssignmentResponse]
    metrics: Dict[str, Any]
