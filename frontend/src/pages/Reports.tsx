import { useEffect, useState } from 'react'
import { Download, Printer, BarChart3, TrendingUp, Users, Clock, Target, FileText, Calendar, Activity } from 'lucide-react'
import { solverService, reportService } from '../services/api'
import { LoadingTable, LoadingSpinner } from '../components/LoadingStates'
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
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'analytics'>('overview')

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
      setActiveTab('overview')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge-success'
      case 'failed':
        return 'badge-danger'
      case 'running':
        return 'badge-info'
      case 'pending':
        return 'badge-warning'
      default:
        return 'badge-gray'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completado'
      case 'failed':
        return 'Fallido'
      case 'running':
        return 'Ejecutando'
      case 'pending':
        return 'Pendiente'
      default:
        return status
    }
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
    return <LoadingTable />
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Reportes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">
            Visualiza y exporta reportes de optimización
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <BarChart3 className="h-4 w-4" />
          <span>Análisis Avanzado</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Runs List */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Ejecuciones Disponibles
              </h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Activity className="h-4 w-4" />
                <span>{runs.length} total</span>
              </div>
            </div>
            
            {runs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay ejecuciones disponibles
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Ejecuta optimizaciones para generar reportes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {runs.map((run) => (
                  <div
                    key={run.id}
                    className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 group ${
                      selectedRun?.solver_run.id === run.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-md'
                    }`}
                    onClick={() => fetchReport(run.run_id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Optimización #{run.id}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(run.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`badge ${getStatusColor(run.status)}`}>
                        {getStatusText(run.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Report Details */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Detalles del Reporte
              </h3>
              {selectedRun && (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={exportToExcel}
                    className="btn btn-success flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={printReport}
                    className="btn btn-secondary flex items-center space-x-2"
                  >
                    <Printer className="h-4 w-4" />
                    <span>PDF</span>
                  </button>
                </div>
              )}
            </div>
            
            {!selectedRun ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Selecciona una ejecución
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Elige una optimización para ver su reporte detallado
                </p>
              </div>
            ) : reportLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  {[
                    { id: 'overview', label: 'Resumen', icon: BarChart3 },
                    { id: 'assignments', label: 'Asignaciones', icon: Users },
                    { id: 'analytics', label: 'Análisis', icon: TrendingUp }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400">Asignaciones</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                              {selectedRun.metrics.total_assignments}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-green-600 dark:text-green-400">Tiempo (seg)</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                              {selectedRun.metrics.solve_time.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <Target className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-purple-600 dark:text-purple-400">Cobertura</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                              {selectedRun.metrics.coverage_percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-orange-600 dark:text-orange-400">Valor Objetivo</p>
                            <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                              {selectedRun.metrics.objective_value.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status and Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Información de la Ejecución</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">ID:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{selectedRun.solver_run.run_id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                            <span className={`badge ${getStatusColor(selectedRun.solver_run.status)}`}>
                              {getStatusText(selectedRun.solver_run.status)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Fecha:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {new Date(selectedRun.solver_run.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Rendimiento</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Eficiencia:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {((selectedRun.metrics.coverage_percentage / 100) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Velocidad:</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              {selectedRun.metrics.solve_time < 30 ? 'Rápida' : selectedRun.metrics.solve_time < 60 ? 'Media' : 'Lenta'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Calidad:</span>
                            <span className="font-medium text-purple-600 dark:text-purple-400">
                              {selectedRun.metrics.objective_value < 100 ? 'Excelente' : selectedRun.metrics.objective_value < 200 ? 'Buena' : 'Regular'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'assignments' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Asignaciones ({selectedRun.assignments.length})
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>Por fecha</span>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="table table-striped">
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
                              <td>
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                                    <Users className="h-4 w-4 text-white" />
                                  </div>
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {assignment.employee_name || 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  <span>{assignment.shift_name || 'N/A'}</span>
                                </div>
                              </td>
                              <td>{new Date(assignment.date).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${
                                  assignment.status === 'assigned' ? 'badge-success' : 'badge-gray'
                                }`}>
                                  {assignment.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-4">Distribución por Empleado</h4>
                        <div className="space-y-2">
                          {Object.entries(selectedRun.assignments.reduce((acc, assignment) => {
                            const name = assignment.employee_name || 'N/A'
                            acc[name] = (acc[name] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)).map(([name, count]) => (
                            <div key={name} className="flex justify-between items-center">
                              <span className="text-blue-600 dark:text-blue-400">{name}</span>
                              <span className="font-semibold text-blue-700 dark:text-blue-300">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6">
                        <h4 className="font-semibold text-green-700 dark:text-green-300 mb-4">Distribución por Turno</h4>
                        <div className="space-y-2">
                          {Object.entries(selectedRun.assignments.reduce((acc, assignment) => {
                            const shift = assignment.shift_name || 'N/A'
                            acc[shift] = (acc[shift] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)).map(([shift, count]) => (
                            <div key={shift} className="flex justify-between items-center">
                              <span className="text-green-600 dark:text-green-400">{shift}</span>
                              <span className="font-semibold text-green-700 dark:text-green-300">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6">
                      <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-4">Métricas de Rendimiento</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-purple-600 dark:text-purple-400">Tiempo Promedio</p>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {(selectedRun.metrics.solve_time / selectedRun.metrics.total_assignments).toFixed(2)}s
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-purple-600 dark:text-purple-400">Cobertura Efectiva</p>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {selectedRun.metrics.coverage_percentage.toFixed(1)}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-purple-600 dark:text-purple-400">Eficiencia</p>
                          <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                            {((selectedRun.metrics.total_assignments / selectedRun.metrics.solve_time) * 60).toFixed(1)}/min
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
