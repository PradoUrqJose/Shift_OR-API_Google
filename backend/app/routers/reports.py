"""
Router para reportes y exportación
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import structlog

from app.database import get_db
from app.models import SolverRun, Assignment
from app.schemas import ReportData, AssignmentResponse, SolverRunResponse

logger = structlog.get_logger()
router = APIRouter()

@router.get("/{run_id}", response_model=ReportData)
async def get_report(
    run_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtener reporte completo de una ejecución
    """
    try:
        # Obtener ejecución
        run = db.query(SolverRun).filter(SolverRun.run_id == run_id).first()
        
        if not run:
            raise HTTPException(status_code=404, detail="Ejecución no encontrada")
        
        # Obtener asignaciones
        assignments = db.query(Assignment).filter(Assignment.solver_run_id == run.id).all()
        
        # Calcular métricas
        metrics = {
            'total_assignments': len(assignments),
            'solve_time': run.solve_time,
            'objective_value': run.objective_value,
            'coverage_percentage': (len(assignments) / (run.assignments_count or 1)) * 100,
            'status': run.status
        }
        
        # Convertir asignaciones
        assignments_response = [
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
        
        # Convertir ejecución
        run_response = SolverRunResponse(
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
        
        return ReportData(
            solver_run=run_response,
            assignments=assignments_response,
            metrics=metrics
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo reporte: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo reporte")

@router.get("/{run_id}/printview")
async def get_print_view(
    run_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtener vista imprimible del reporte
    """
    try:
        # Obtener datos del reporte
        report_data = await get_report(run_id, db)
        
        # Generar HTML imprimible
        html_content = generate_printable_html(report_data)
        
        return {"html": html_content}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generando vista imprimible: {e}")
        raise HTTPException(status_code=500, detail="Error generando vista imprimible")

def generate_printable_html(report_data: ReportData) -> str:
    """
    Generar HTML imprimible para el reporte
    """
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Reporte de Turnos - {report_data.solver_run.run_id}</title>
        <style>
            @media print {{
                body {{ margin: 0; }}
                .no-print {{ display: none; }}
            }}
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .metrics {{ display: flex; justify-content: space-around; margin: 20px 0; }}
            .metric {{ text-align: center; }}
            .metric h3 {{ margin: 0; color: #2563eb; }}
            .metric p {{ margin: 5px 0; font-size: 18px; font-weight: bold; }}
            table {{ width: 100%; border-collapse: collapse; margin-top: 20px; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #f8fafc; }}
            .status-completed {{ color: #059669; }}
            .status-failed {{ color: #dc2626; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Sistema de Generación de Turnos</h1>
            <h2>Reporte de Optimización</h2>
            <p>ID de Ejecución: {report_data.solver_run.run_id}</p>
            <p>Fecha: {report_data.solver_run.created_at.strftime('%d/%m/%Y %H:%M')}</p>
        </div>
        
        <div class="metrics">
            <div class="metric">
                <h3>Estado</h3>
                <p class="status-{report_data.solver_run.status}">{report_data.solver_run.status.upper()}</p>
            </div>
            <div class="metric">
                <h3>Asignaciones</h3>
                <p>{report_data.metrics['total_assignments']}</p>
            </div>
            <div class="metric">
                <h3>Tiempo (seg)</h3>
                <p>{report_data.metrics['solve_time']:.2f}</p>
            </div>
            <div class="metric">
                <h3>Cobertura</h3>
                <p>{report_data.metrics['coverage_percentage']:.1f}%</p>
            </div>
        </div>
        
        <h3>Asignaciones de Turnos</h3>
        <table>
            <thead>
                <tr>
                    <th>Empleado</th>
                    <th>Turno</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
    """
    
    for assignment in report_data.assignments:
        html += f"""
                <tr>
                    <td>{assignment.employee_name or 'N/A'}</td>
                    <td>{assignment.shift_name or 'N/A'}</td>
                    <td>{assignment.date.strftime('%d/%m/%Y')}</td>
                    <td>{assignment.status}</td>
                </tr>
        """
    
    html += """
            </tbody>
        </table>
        
        <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>Generado por Sistema de Generación de Turnos</p>
            <p>Optimizado con Google OR-Tools CP-SAT</p>
        </div>
    </body>
    </html>
    """
    
    return html
