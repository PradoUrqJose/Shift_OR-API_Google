"""
Solver CP-SAT para optimización de turnos usando Google OR-Tools
"""
from ortools.sat.python import cp_model
import structlog
from typing import List, Dict, Any, Tuple
from datetime import datetime, timedelta
import json

logger = structlog.get_logger()

class CPSatSolver:
    def __init__(self):
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        self.solver.parameters.max_time_in_seconds = 300  # 5 minutos máximo
        
    def solve_shift_scheduling(
        self,
        employees: List[Dict[str, Any]],
        shifts: List[Dict[str, Any]],
        constraints: Dict[str, Any]
    ) -> Tuple[bool, List[Dict[str, Any]], Dict[str, Any]]:
        """
        Resuelve el problema de programación de turnos
        
        Args:
            employees: Lista de empleados con disponibilidad
            shifts: Lista de turnos a asignar
            constraints: Restricciones del problema
            
        Returns:
            Tuple[success, assignments, metrics]
        """
        try:
            logger.info("=== INICIANDO SOLVER CP-SAT ===")
            logger.info(f"Empleados disponibles: {len(employees)}")
            logger.info(f"Turnos a asignar: {len(shifts)}")
            logger.info(f"Período: {constraints['start_date']} a {constraints['end_date']}")
            
            # VALIDACIONES PREVIAS
            validation_result = self._validate_inputs(employees, shifts, constraints)
            if not validation_result['valid']:
                logger.error(f"Validación fallida: {validation_result['error']}")
                return False, [], {'error': validation_result['error']}
            
            # Crear variables de decisión
            assignments = self._create_decision_variables(employees, shifts, constraints)
            logger.info(f"Variables de decisión creadas: {len(assignments)}")
            
            # Agregar restricciones
            self._add_constraints(assignments, employees, shifts, constraints)
            logger.info("Restricciones agregadas al modelo")
            
            # Definir función objetivo
            self._set_objective(assignments, employees, shifts, constraints)
            logger.info("Función objetivo definida")
            
            # Resolver
            logger.info("Ejecutando solver...")
            status = self.solver.Solve(self.model)
            
            # ANALIZAR RESULTADO
            if status == cp_model.OPTIMAL:
                logger.info("✅ Solución óptima encontrada")
                assignments_result = self._extract_assignments(assignments, employees, shifts, constraints)
                metrics = self._calculate_metrics(assignments_result, employees, shifts)
                return True, assignments_result, metrics
            elif status == cp_model.FEASIBLE:
                logger.info("✅ Solución factible encontrada (no óptima)")
                assignments_result = self._extract_assignments(assignments, employees, shifts, constraints)
                metrics = self._calculate_metrics(assignments_result, employees, shifts)
                return True, assignments_result, metrics
            elif status == cp_model.INFEASIBLE:
                error_msg = "❌ No hay solución factible - Restricciones muy estrictas"
                logger.error(error_msg)
                return False, [], {'error': error_msg, 'status': 'INFEASIBLE'}
            elif status == cp_model.UNKNOWN:
                error_msg = "❌ Solver no pudo determinar si hay solución"
                logger.error(error_msg)
                return False, [], {'error': error_msg, 'status': 'UNKNOWN'}
            else:
                error_msg = f"❌ Error desconocido del solver: {status}"
                logger.error(error_msg)
                return False, [], {'error': error_msg, 'status': str(status)}
                
        except Exception as e:
            error_msg = f"❌ Error en solver: {str(e)}"
            logger.error(error_msg)
            return False, [], {'error': error_msg}
    
    def _validate_inputs(self, employees, shifts, constraints):
        """Validar entradas antes de resolver"""
        errors = []
        
        # 1. Validar empleados
        if not employees:
            errors.append("No hay empleados disponibles")
        else:
            logger.info("=== ANÁLISIS DE EMPLEADOS ===")
            for emp in employees:
                logger.info(f"Empleado: {emp.get('name', 'Sin nombre')} - Habilidades: {emp.get('skills', [])}")
        
        # 2. Validar turnos
        if not shifts:
            errors.append("No hay turnos configurados")
        else:
            logger.info("=== ANÁLISIS DE TURNOS ===")
            for shift in shifts:
                logger.info(f"Turno: {shift.get('name', 'Sin nombre')} - Día: {shift.get('day_of_week')} - Habilidades: {shift.get('required_skills', [])}")
        
        # 3. Validar cobertura de turnos
        if employees and shifts:
            total_shifts_needed = 0
            employees_by_skill = {}
            
            # Agrupar empleados por habilidad
            for emp in employees:
                skills = emp.get('skills', [])
                for skill in skills:
                    if skill not in employees_by_skill:
                        employees_by_skill[skill] = []
                    employees_by_skill[skill].append(emp['name'])
            
            logger.info(f"Empleados por habilidad: {employees_by_skill}")
            
            # Calcular turnos necesarios por habilidad
            for shift in shifts:
                required_skills = shift.get('required_skills', [])
                min_employees = shift.get('min_employees', 1)
                
                for skill in required_skills:
                    if skill not in employees_by_skill:
                        errors.append(f"Turno '{shift.get('name')}' requiere habilidad '{skill}' pero no hay empleados con esa habilidad")
                    else:
                        available_employees = len(employees_by_skill[skill])
                        if available_employees < min_employees:
                            errors.append(f"Turno '{shift.get('name')}' necesita {min_employees} empleados con habilidad '{skill}' pero solo hay {available_employees}")
                        total_shifts_needed += min_employees
            
            # Validar si hay suficientes empleados para cubrir todos los turnos
            total_employee_capacity = len(employees) * 7  # 1 turno por día máximo
            if total_shifts_needed > total_employee_capacity:
                errors.append(f"Se necesitan {total_shifts_needed} asignaciones pero solo hay capacidad para {total_employee_capacity}")
        
        # 4. Validar fechas
        if 'start_date' not in constraints or 'end_date' not in constraints:
            errors.append("Fechas de inicio y fin son requeridas")
        
        return {
            'valid': len(errors) == 0,
            'error': '; '.join(errors) if errors else None
        }
    
    def _create_decision_variables(self, employees, shifts, constraints):
        """Crear variables de decisión binarias"""
        assignments = {}
        
        for emp in employees:
            for shift in shifts:
                for day in self._get_date_range(constraints['start_date'], constraints['end_date']):
                    var_name = f"emp_{emp['id']}_shift_{shift['id']}_day_{day}"
                    assignments[var_name] = self.model.NewBoolVar(var_name)
        
        return assignments
    
    def _add_constraints(self, assignments, employees, shifts, constraints):
        """Agregar restricciones al modelo"""
        
        # 1. Restricción: Cada empleado puede trabajar máximo 1 turno por día
        for emp in employees:
            for day in self._get_date_range(constraints['start_date'], constraints['end_date']):
                day_assignments = [
                    assignments[f"emp_{emp['id']}_shift_{shift['id']}_day_{day}"]
                    for shift in shifts
                ]
                self.model.Add(sum(day_assignments) <= 1)
        
        # 2. Restricción: Cada turno debe tener el mínimo de empleados requerido
        # SOLO en los días configurados para ese turno
        for shift in shifts:
            shift_day_of_week = shift.get('day_of_week')  # 0-6 (lunes-domingo)
            for day in self._get_date_range(constraints['start_date'], constraints['end_date']):
                day_of_week = day.weekday()  # 0-6 (lunes-domingo)
                
                # Si el turno no está configurado para este día, no asignar a nadie
                if day_of_week != shift_day_of_week:
                    for emp in employees:
                        var_name = f"emp_{emp['id']}_shift_{shift['id']}_day_{day}"
                        if var_name in assignments:
                            self.model.Add(assignments[var_name] == 0)
                else:
                    # Solo asignar en días configurados
                    shift_assignments = [
                        assignments[f"emp_{emp['id']}_shift_{shift['id']}_day_{day}"]
                        for emp in employees
                    ]
                    self.model.Add(sum(shift_assignments) >= shift.get('min_employees', 1))
                    self.model.Add(sum(shift_assignments) <= shift.get('max_employees', 10))
        
        # 3. Restricción: Disponibilidad de empleados
        for emp in employees:
            availability = emp.get('availability', {})
            for day in self._get_date_range(constraints['start_date'], constraints['end_date']):
                day_name = day.strftime('%A').lower()
                if day_name in availability and not availability[day_name]:
                    for shift in shifts:
                        var_name = f"emp_{emp['id']}_shift_{shift['id']}_day_{day}"
                        if var_name in assignments:
                            self.model.Add(assignments[var_name] == 0)
        
        # 4. Restricción: Habilidades requeridas
        for shift in shifts:
            required_skills = shift.get('required_skills', [])
            if required_skills:
                for day in self._get_date_range(constraints['start_date'], constraints['end_date']):
                    for emp in employees:
                        emp_skills = emp.get('skills', [])
                        if not any(skill in emp_skills for skill in required_skills):
                            var_name = f"emp_{emp['id']}_shift_{shift['id']}_day_{day}"
                            if var_name in assignments:
                                self.model.Add(assignments[var_name] == 0)
    
    def _set_objective(self, assignments, employees, shifts, constraints):
        """Definir función objetivo"""
        if constraints.get('minimize_cost', True):
            # Minimizar costos
            cost_terms = []
            for emp in employees:
                for shift in shifts:
                    for day in self._get_date_range(constraints['start_date'], constraints['end_date']):
                        var_name = f"emp_{emp['id']}_shift_{shift['id']}_day_{day}"
                        if var_name in assignments:
                            cost = emp.get('hourly_rate', 0) * shift.get('cost_multiplier', 1.0)
                            cost_terms.append(assignments[var_name] * cost)
            
            self.model.Minimize(sum(cost_terms))
        else:
            # Maximizar satisfacción de preferencias
            satisfaction_terms = []
            for emp in employees:
                preferences = emp.get('preferences', {})
                for shift in shifts:
                    for day in self._get_date_range(constraints['start_date'], constraints['end_date']):
                        var_name = f"emp_{emp['id']}_shift_{shift['id']}_day_{day}"
                        if var_name in assignments:
                            preference_score = preferences.get(str(shift['id']), 0)
                            satisfaction_terms.append(assignments[var_name] * preference_score)
            
            self.model.Maximize(sum(satisfaction_terms))
    
    def _extract_assignments(self, assignments, employees, shifts, constraints):
        """Extraer asignaciones de la solución"""
        result = []
        
        for emp in employees:
            for shift in shifts:
                for day in self._get_date_range(
                    constraints['start_date'], 
                    constraints['end_date']
                ):
                    var_name = f"emp_{emp['id']}_shift_{shift['id']}_day_{day}"
                    if var_name in assignments and self.solver.Value(assignments[var_name]) == 1:
                        result.append({
                            'employee_id': emp['id'],
                            'shift_id': shift['id'],
                            'date': day,
                            'employee_name': emp['name'],
                            'shift_name': shift['name']
                        })
        
        return result
    
    def _calculate_metrics(self, assignments, employees, shifts):
        """Calcular métricas de la solución"""
        total_assignments = len(assignments)
        total_employees = len(employees)
        total_shifts = len(shifts)
        
        # Calcular cobertura
        coverage = (total_assignments / (total_employees * total_shifts)) * 100 if total_employees * total_shifts > 0 else 0
        
        # Calcular balance de carga
        employee_assignments = {}
        for assignment in assignments:
            emp_id = assignment['employee_id']
            employee_assignments[emp_id] = employee_assignments.get(emp_id, 0) + 1
        
        if employee_assignments:
            min_assignments = min(employee_assignments.values())
            max_assignments = max(employee_assignments.values())
            balance = (min_assignments / max_assignments) * 100 if max_assignments > 0 else 0
        else:
            balance = 0
        
        return {
            'total_assignments': total_assignments,
            'coverage_percentage': round(coverage, 2),
            'load_balance': round(balance, 2),
            'solve_time': self.solver.WallTime(),
            'objective_value': self.solver.ObjectiveValue()
        }
    
    def _get_date_range(self, start_date, end_date):
        """Generar rango de fechas"""
        current = start_date
        while current <= end_date:
            yield current
            current += timedelta(days=1)
