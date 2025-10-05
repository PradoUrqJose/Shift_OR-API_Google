"""
Modelos de datos para el sistema de turnos
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    role = Column(String, default="user")  # admin, manager, user
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    position = Column(String)
    skills = Column(Text)  # JSON string
    availability = Column(Text)  # JSON string
    preferences = Column(Text)  # JSON string
    hourly_rate = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Shift(Base):
    __tablename__ = "shifts"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    start_time = Column(String)  # "08:00"
    end_time = Column(String)    # "16:00"
    day_of_week = Column(Integer)  # 0-6 (lunes-domingo)
    required_skills = Column(Text)  # JSON string
    min_employees = Column(Integer, default=1)
    max_employees = Column(Integer, default=1)
    cost_multiplier = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class SolverRun(Base):
    __tablename__ = "solver_runs"
    
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String, unique=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="pending")  # pending, running, completed, failed
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    constraints = Column(Text)  # JSON string
    objective_value = Column(Float)
    solve_time = Column(Float)  # segundos
    assignments_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relación con asignaciones
    assignments = relationship("Assignment", back_populates="solver_run")

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    solver_run_id = Column(Integer, ForeignKey("solver_runs.id"))
    employee_id = Column(Integer, ForeignKey("employees.id"))
    shift_id = Column(Integer, ForeignKey("shifts.id"))
    date = Column(DateTime)
    status = Column(String, default="assigned")  # assigned, confirmed, rejected
    created_at = Column(DateTime, default=func.now())
    
    # Relaciones
    solver_run = relationship("SolverRun", back_populates="assignments")
    employee = relationship("Employee")
    shift = relationship("Shift")

class ErrorLog(Base):
    __tablename__ = "error_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    message = Column(Text)
    stack = Column(Text)
    created_at = Column(DateTime, default=func.now())
