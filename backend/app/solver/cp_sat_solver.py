from ortools.sat.python import cp_model
import structlog
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import json

logger = structlog.get_logger()

class CPSatSolver:
    def __init__(self):
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()
        self.solver.parameters.max_time_in_seconds = 60  # 1 minuto

    def solve_shift_scheduling(
        self, employees: List[Dict[str, Any]], shifts: List[Dict[str, Any]], constraints: Dict[str, Any]
    ) -> Tuple[bool, List[Dict[str, Any]], Dict[str, Any]]:
        try:
            logger.info("🚀 Iniciando solver CP-SAT realista")

            # Convertir fechas si vienen como string
            start_date, end_date = self._parse_dates(constraints)
            dates = list(self._get_date_range(start_date, end_date))

            # Validación
            if not employees or not shifts:
                return False, [], {"error": "Faltan empleados o turnos"}

            # Crear variables
            assignments = {}
            for emp in employees:
                for shift in shifts:
                    for date in dates:
                        name = f"E{emp['id']}_S{shift['id']}_{date.date()}"
                        assignments[name] = self.model.NewBoolVar(name)

            logger.info(f"Variables de decisión: {len(assignments)}")

            # Restricción 1: Máx 1 turno por día por empleado
            for emp in employees:
                for date in dates:
                    vars_day = [
                        assignments[f"E{emp['id']}_S{shift['id']}_{date.date()}"]
                        for shift in shifts
                        if f"E{emp['id']}_S{shift['id']}_{date.date()}" in assignments
                    ]
                    if vars_day:
                        self.model.Add(sum(vars_day) <= 1)

            # Restricción 2: Cobertura mínima por turno
            slack_penalties = []
            for shift in shifts:
                for date in dates:
                    if date.weekday() == shift["day_of_week"]:
                        vars_shift = [
                            assignments[f"E{emp['id']}_S{shift['id']}_{date.date()}"]
                            for emp in employees
                        ]
                        slack = self.model.NewIntVar(0, 10, f"slack_S{shift['id']}_{date.date()}")
                        self.model.Add(sum(vars_shift) + slack >= shift["min_employees"])
                        self.model.Add(sum(vars_shift) <= shift["max_employees"])
                        slack_penalties.append(slack)

            # Restricción 3: Habilidades requeridas
            for emp in employees:
                for shift in shifts:
                    if not set(shift["required_skills"]).intersection(set(emp["skills"])):
                        for date in dates:
                            if f"E{emp['id']}_S{shift['id']}_{date.date()}" in assignments:
                                self.model.Add(assignments[f"E{emp['id']}_S{shift['id']}_{date.date()}"] == 0)

            # Restricción 4: Descanso mínimo de 12h entre turnos
            for emp in employees:
                for i in range(len(dates) - 1):
                    d1, d2 = dates[i], dates[i + 1]
                    shifts_emp_day1 = [
                        assignments[f"E{emp['id']}_S{shift['id']}_{d1.date()}"]
                        for shift in shifts if f"E{emp['id']}_S{shift['id']}_{d1.date()}" in assignments
                    ]
                    shifts_emp_day2 = [
                        assignments[f"E{emp['id']}_S{shift['id']}_{d2.date()}"]
                        for shift in shifts if f"E{emp['id']}_S{shift['id']}_{d2.date()}" in assignments
                    ]
                    if shifts_emp_day1 and shifts_emp_day2:
                        self.model.Add(sum(shifts_emp_day1) + sum(shifts_emp_day2) <= 1)

            # Restricción 5: Máx 6 días seguidos
            for emp in employees:
                for i in range(len(dates) - 6):
                    window = dates[i:i+7]
                    day_vars = [
                        assignments[f"E{emp['id']}_S{shift['id']}_{d.date()}"]
                        for shift in shifts for d in window
                        if f"E{emp['id']}_S{shift['id']}_{d.date()}" in assignments
                    ]
                    if day_vars:
                        self.model.Add(sum(day_vars) <= 6)

            # Función objetivo: minimizar costo + penalización de slack + balance
            cost_terms = []
            for emp in employees:
                for shift in shifts:
                    for date in dates:
                        key = f"E{emp['id']}_S{shift['id']}_{date.date()}"
                        if key in assignments:
                            cost = emp["hourly_rate"] * shift["cost_multiplier"]
                            cost_terms.append(assignments[key] * cost)

            total_cost = sum(cost_terms)
            slack_penalty = sum(slack_penalties)
            self.model.Minimize(total_cost + 10 * slack_penalty)

            # Resolver
            status = self.solver.Solve(self.model)
            if status in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
                return True, self._extract(assignments, employees, shifts, dates), {
                    "objective": self.solver.ObjectiveValue(),
                    "status": "SUCCESS",
                    "solve_time": self.solver.WallTime()
                }

            return False, [], {"error": "No hay solución factible", "status": "INFEASIBLE"}

        except Exception as e:
            return False, [], {"error": str(e)}

    def _extract(self, assignments, employees, shifts, dates):
        result = []
        for emp in employees:
            for shift in shifts:
                for date in dates:
                    key = f"E{emp['id']}_S{shift['id']}_{date.date()}"
                    if key in assignments and self.solver.Value(assignments[key]) == 1:
                        result.append({
                            "employee_id": emp["id"],
                            "employee_name": emp["name"],
                            "shift_id": shift["id"],
                            "shift_name": shift["name"],
                            "date": date.isoformat()
                        })
        return result

    def _get_date_range(self, start, end):
        cur = start
        while cur <= end:
            yield cur
            cur += timedelta(days=1)

    def _parse_dates(self, constraints):
        s = constraints.get("start_date")
        e = constraints.get("end_date")
        s = datetime.fromisoformat(s.replace("Z", "+00:00")) if isinstance(s, str) else s
        e = datetime.fromisoformat(e.replace("Z", "+00:00")) if isinstance(e, str) else e
        return s, e
