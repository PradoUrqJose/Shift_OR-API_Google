"""
Router para el solver de optimización de turnos
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import uuid
import structlog
from datetime import datetime

from app.database import get_db, log_error
from app.models import SolverRun, Assignment, Employee, Shift
from app.schemas import SolverRunCreate, SolverRunResponse, AssignmentResponse
from app.solver.cp_sat_solver import CPSatSolver

logger = structlog.get_logger()
router = APIRouter()

@router.post("/solve", response_model=SolverRunResponse)
async def solve_shift_scheduling(
    constraints: SolverRunCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Iniciar proceso de optimización de turnos
    """
    try:
        # Generar ID único para la ejecución
        run_id = str(uuid.uuid4())
        
        # Crear registro de ejecución
        import json
        solver_run = SolverRun(
            run_id=run_id,
            user_id=None,  # Temporalmente sin usuario
            status="pending",
            start_date=constraints.constraints.start_date,
            end_date=constraints.constraints.end_date,
            constraints=json.dumps(constraints.constraints.dict(), default=str)
        )
        
        db.add(solver_run)
        db.commit()
        db.refresh(solver_run)
        
        # Ejecutar solver en background
        background_tasks.add_task(
            execute_solver,
            run_id,
            constraints.constraints.dict(),
            db
        )
        
        logger.info(f"Solver iniciado: {run_id}")
        
        return SolverRunResponse(
            id=solver_run.id,
            run_id=solver_run.run_id,
            status=solver_run.status,
            start_date=solver_run.start_date,
            end_date=solver_run.end_date,
            objective_value=solver_run.objective_value,
            solve_time=solver_run.solve_time,
            assignments_count=solver_run.assignments_count,
            created_at=solver_run.created_at
        )
        
    except Exception as e:
        logger.error(f"Error iniciando solver: {e}")
        raise HTTPException(status_code=500, detail="Error iniciando optimización")

@router.get("/runs", response_model=List[SolverRunResponse])
async def get_solver_runs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Obtener historial de ejecuciones del solver
    """
    try:
        runs = db.query(SolverRun).offset(skip).limit(limit).all()
        
        return [
            SolverRunResponse(
                id=run.id,
                run_id=run.run_id,
                status=run.status,
                start_date=run.start_date,
                end_date=run.end_date,
                objective_value=run.objective_value,
                solve_time=run.solve_time,
                assignments_count=run.assignments_count,
                created_at=run.created_at
            )
            for run in runs
        ]
        
    except Exception as e:
        logger.error(f"Error obteniendo runs: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo ejecuciones")

@router.get("/runs/{run_id}", response_model=SolverRunResponse)
async def get_solver_run(
    run_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtener detalles de una ejecución específica
    """
    try:
        run = db.query(SolverRun).filter(SolverRun.run_id == run_id).first()
        
        if not run:
            raise HTTPException(status_code=404, detail="Ejecución no encontrada")
        
        return SolverRunResponse(
            id=run.id,
            run_id=run.run_id,
            status=run.status,
            start_date=run.start_date,
            end_date=run.end_date,
            objective_value=run.objective_value,
            solve_time=run.solve_time,
            assignments_count=run.assignments_count,
            created_at=run.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo run: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo ejecución")

@router.get("/runs/{run_id}/assignments", response_model=List[AssignmentResponse])
async def get_solver_assignments(
    run_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtener asignaciones de una ejecución específica
    """
    try:
        run = db.query(SolverRun).filter(SolverRun.run_id == run_id).first()
        
        if not run:
            raise HTTPException(status_code=404, detail="Ejecución no encontrada")
        
        assignments = db.query(Assignment).filter(Assignment.solver_run_id == run.id).all()
        
        return [
            AssignmentResponse(
                id=assignment.id,
                employee_id=assignment.employee_id,
                shift_id=assignment.shift_id,
                date=assignment.date,
                status=assignment.status,
                employee_name=assignment.employee.name if assignment.employee else None,
                shift_name=assignment.shift.name if assignment.shift else None
            )
            for assignment in assignments
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo asignaciones: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo asignaciones")

async def execute_solver(run_id: str, constraints: dict, db: Session):
    """
    Ejecutar solver en background
    """
    try:
        logger.info(f"Ejecutando solver: {run_id}")
        
        # Actualizar estado a "running"
        run = db.query(SolverRun).filter(SolverRun.run_id == run_id).first()
        if run:
            run.status = "running"
            db.commit()
        
        # Obtener datos necesarios
        employees = db.query(Employee).filter(Employee.is_active == True).all()
        shifts = db.query(Shift).filter(Shift.is_active == True).all()
        
        # Convertir a diccionarios
        employees_data = [
            {
                'id': emp.id,
                'name': emp.name,
                'skills': emp.skills.split(',') if emp.skills else [],
                'availability': json.loads(emp.availability) if emp.availability else {},
                'preferences': json.loads(emp.preferences) if emp.preferences else {},
                'hourly_rate': emp.hourly_rate
            }
            for emp in employees
        ]
        
        shifts_data = [
            {
                'id': shift.id,
                'name': shift.name,
                'start_time': shift.start_time,
                'end_time': shift.end_time,
                'day_of_week': shift.day_of_week,
                'required_skills': shift.required_skills.split(',') if shift.required_skills else [],
                'min_employees': shift.min_employees,
                'max_employees': shift.max_employees,
                'cost_multiplier': shift.cost_multiplier
            }
            for shift in shifts
        ]
        
        # Ejecutar solver
        solver = CPSatSolver()
        success, assignments, metrics = solver.solve_shift_scheduling(
            employees_data, shifts_data, constraints
        )
        
        # Actualizar resultado
        if run:
            if success:
                run.status = "completed"
                run.objective_value = metrics.get('objective_value', 0)
                run.solve_time = metrics.get('solve_time', 0)
                run.assignments_count = len(assignments)
            else:
                run.status = "failed"
                # Guardar el error de validación en la base de datos
                error_message = metrics.get('error', 'Error desconocido en la optimización')
                log_error(run_id, None, f"Solver failed: {error_message}")
            
            run.end_date = datetime.now()
            db.commit()
            
            # Guardar asignaciones
            if success and assignments:
                for assignment_data in assignments:
                    assignment = Assignment(
                        solver_run_id=run.id,
                        employee_id=assignment_data['employee_id'],
                        shift_id=assignment_data['shift_id'],
                        date=assignment_data['date'],
                        status='assigned'
                    )
                    db.add(assignment)
                
                db.commit()
        
        logger.info(f"Solver completado: {run_id}, éxito: {success}")
        
    except Exception as e:
        logger.error(f"Error ejecutando solver: {e}")
        
        # Actualizar estado a "failed"
        run = db.query(SolverRun).filter(SolverRun.run_id == run_id).first()
        if run:
            run.status = "failed"
            run.end_date = datetime.now()
            db.commit()
            
            # Guardar error en logs
            log_error(run_id, None, f"Error ejecutando solver: {str(e)}")
        
@router.get("/runs/{run_id}/errors")
async def get_solver_errors(
    run_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtener errores de una ejecución específica
    """
    try:
        # Obtener errores de la tabla error_logs
        from app.database import supabase
        
        if supabase:
            response = supabase.table('error_logs').select('*').eq('run_id', run_id).execute()
            errors = response.data if response.data else []
        else:
            # Fallback: buscar en logs del sistema
            errors = [{"message": "No se pudieron obtener los errores detallados", "created_at": datetime.now().isoformat()}]
        
        return {"errors": errors}
        
    except Exception as e:
        logger.error(f"Error obteniendo errores: {e}")
        return {"errors": [{"message": f"Error obteniendo logs: {str(e)}", "created_at": datetime.now().isoformat()}]}
