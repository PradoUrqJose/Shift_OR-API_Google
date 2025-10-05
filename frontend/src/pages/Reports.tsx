import { useEffect, useState } from 'react'
import { Download, Printer, FileText, Calendar } from 'lucide-react'
import { solverService, reportService } from '../services/api'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

interface SolverRun {
  id: number
  run_id: string
  status: string
  start_date: string
  end_date?: string
  objective_value?: number
  solve_time?: number
  assignments_count: number
  created_at: string
}

interface Assignment {
  id: number
  employee_id: number
  shift_id: number
  date: string
  status: string
  employee_name?: string
  shift_name?: string
}

interface ReportData {
  solver_run: SolverRun
  assignments: Assignment[]
  metrics: {
    total_assignments: number
    solve_time: number
    objective_value: number
    coverage_percentage: number
    status: string
  }
}

export function Reports() {
  const [runs, setRuns] = useState<SolverRun[]>([])
  const [selectedRun, setSelectedRun] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [reportLoading, setReportLoading] = useState(false)

  useEffect(() => {
    fetchRuns()
  }, [])

  const fetchRuns = async () => {
    try {
      setLoading(true)
      const response = await solverService.getRuns()
      setRuns(response.data)
    } catch (error) {
      toast.error('Error cargando ejecuciones')
    } finally {
      setLoading(false)
    }
  }

  const fetchReport = async (runId: string) => {
    try {
      setReportLoading(true)
      const response = await reportService.getReport(runId)
      setSelectedRun(response.data)
    } catch (error) {
      toast.error('Error cargando reporte')
    } finally {
      setReportLoading(false)
    }
  }

  const exportToExcel = () => {
    if (!selectedRun) return

    const data = selectedRun.assignments.map(assignment => ({
      'Empleado': assignment.employee_name || 'N/A',
      'Turno': assignment.shift_name || 'N/A',
      'Fecha': new Date(assignment.date).toLocaleDateString(),
      'Estado': assignment.status
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Asignaciones')
    XLSX.writeFile(wb, `asignaciones_${selectedRun.solver_run.run_id}.xlsx`)
    
    toast.success('Archivo Excel exportado')
  }

  const printReport = () => {
    if (!selectedRun) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = generatePrintHTML(selectedRun)
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  const generatePrintHTML = (report: ReportData) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Turnos - ${report.solver_run.run_id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .metrics { display: flex; justify-content: space-around; margin: 20px 0; }
          .metric { text-align: center; }
          .metric h3 { margin: 0; color: #2563eb; font-size: 14px; }
          .metric p { margin: 5px 0; font-size: 16px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f8fafc; }
          .status-completed { color: #059669; }
          .status-failed { color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Sistema de Generación de Turnos</h1>
          <h2>Reporte de Optimización</h2>
          <p>ID de Ejecución: ${report.solver_run.run_id}</p>
          <p>Fecha: ${new Date(report.solver_run.created_at).toLocaleString()}</p>
        </div>
        
        <div class="metrics">
          <div class="metric">
            <h3>Estado</h3>
            <p class="status-${report.solver_run.status}">${report.solver_run.status.toUpperCase()}</p>
          </div>
          <div class="metric">
            <h3>Asignaciones</h3>
            <p>${report.metrics.total_assignments}</p>
          </div>
          <div class="metric">
            <h3>Tiempo (seg)</h3>
            <p>${report.metrics.solve_time.toFixed(2)}</p>
          </div>
          <div class="metric">
            <h3>Cobertura</h3>
            <p>${report.metrics.coverage_percentage.toFixed(1)}%</p>
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
            ${report.assignments.map(assignment => `
              <tr>
                <td>${assignment.employee_name || 'N/A'}</td>
                <td>${assignment.shift_name || 'N/A'}</td>
                <td>${new Date(assignment.date).toLocaleDateString()}</td>
                <td>${assignment.status}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="margin-top: 30px; text-align: center; color: #666;">
          <p>Generado por Sistema de Generación de Turnos</p>
          <p>Optimizado con Google OR-Tools CP-SAT</p>
        </div>
      </body>
      </html>
    `
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600 mt-2">
          Visualiza y exporta reportes de optimización
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Runs List */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ejecuciones Disponibles
          </h3>
          
          {runs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay ejecuciones disponibles
            </div>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <div
                  key={run.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRun?.solver_run.id === run.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => fetchReport(run.run_id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Optimización #{run.id}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(run.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        run.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : run.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {run.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detalles del Reporte
          </h3>
          
          {!selectedRun ? (
            <div className="text-center py-8 text-gray-500">
              Selecciona una ejecución para ver el reporte
            </div>
          ) : reportLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Asignaciones</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedRun.metrics.total_assignments}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tiempo (seg)</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedRun.metrics.solve_time.toFixed(2)}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Cobertura</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedRun.metrics.coverage_percentage.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Valor Objetivo</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedRun.metrics.objective_value.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={exportToExcel}
                  className="btn btn-primary flex items-center"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Excel
                </button>
                <button
                  onClick={printReport}
                  className="btn btn-secondary flex items-center"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Imprimir
                </button>
              </div>

              {/* Assignments Table */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Asignaciones ({selectedRun.assignments.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>Turno</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRun.assignments.map((assignment) => (
                        <tr key={assignment.id}>
                          <td>{assignment.employee_name || 'N/A'}</td>
                          <td>{assignment.shift_name || 'N/A'}</td>
                          <td>{new Date(assignment.date).toLocaleDateString()}</td>
                          <td>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                assignment.status === 'assigned'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {assignment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
