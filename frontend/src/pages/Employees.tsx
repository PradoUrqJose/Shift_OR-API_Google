import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, User, Mail, Phone, DollarSign, Badge, Search, Filter, Download } from 'lucide-react'
import { employeeService } from '../services/api'
import { DataTable } from '../components/tables/DataTable'
import { FormField } from '../components/forms/FormField'
import { SelectField } from '../components/forms/SelectField'
import { LoadingTable, LoadingSpinner } from '../components/LoadingStates'
import toast from 'react-hot-toast'

interface Employee {
  id: number
  name: string
  email: string
  phone?: string
  position?: string
  skills: string[]
  hourly_rate: number
  is_active: boolean
  created_at: string
}

export function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    skills: '',
    hourly_rate: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await employeeService.getAll()
      setEmployees(response.data)
    } catch (error) {
      toast.error('Error cargando empleados')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este empleado?')) return

    try {
      await employeeService.delete(id)
      toast.success('Empleado eliminado')
      fetchEmployees()
    } catch (error) {
      toast.error('Error eliminando empleado')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFormErrors({})

    try {
      const employeeData = {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        hourly_rate: parseFloat(formData.hourly_rate)
      }

      if (editingEmployee) {
        await employeeService.update(editingEmployee.id, employeeData)
        toast.success('Empleado actualizado')
      } else {
        await employeeService.create(employeeData)
        toast.success('Empleado creado')
      }

      setShowForm(false)
      setEditingEmployee(null)
      setFormData({ name: '', email: '', phone: '', position: '', skills: '', hourly_rate: '' })
      fetchEmployees()
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors)
      } else {
        toast.error('Error guardando empleado')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      position: employee.position || '',
      skills: employee.skills.join(', '),
      hourly_rate: employee.hourly_rate.toString()
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingEmployee(null)
    setFormData({ name: '', email: '', phone: '', position: '', skills: '', hourly_rate: '' })
    setFormErrors({})
  }

  const handleExport = () => {
    // Implementar exportación
    toast.success('Exportando datos...')
  }

  const columns = [
    {
      key: 'name' as keyof Employee,
      label: 'Nombre',
      render: (value: string, row: Employee) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{row.position || 'Sin posición'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email' as keyof Employee,
      label: 'Email',
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'hourly_rate' as keyof Employee,
      label: 'Tarifa/Hora',
      render: (value: number) => (
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-green-500" />
          <span className="font-medium text-green-600 dark:text-green-400">
            ${value.toFixed(2)}
          </span>
        </div>
      )
    },
    {
      key: 'skills' as keyof Employee,
      label: 'Habilidades',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.slice(0, 2).map((skill, index) => (
            <span key={index} className="badge badge-info">
              {skill}
            </span>
          ))}
          {value.length > 2 && (
            <span className="badge badge-gray">
              +{value.length - 2}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'is_active' as keyof Employee,
      label: 'Estado',
      render: (value: boolean) => (
        <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      )
    }
  ]

  if (loading) {
    return <LoadingTable />
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            Empleados
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 transition-colors duration-300">
            Gestiona la información de tus empleados
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Nuevo Empleado</span>
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={employees}
        columns={columns}
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
        onRowClick={handleEdit}
        onExport={handleExport}
        emptyMessage="No hay empleados registrados"
      />

      {/* Employee Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-bounce-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
                </h3>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="Nombre"
                    value={formData.name}
                    onChange={(value) => setFormData({ ...formData, name: value })}
                    error={formErrors.name}
                    required
                    icon={<User className="h-4 w-4" />}
                    placeholder="Nombre completo"
                  />
                  
                  <FormField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(value) => setFormData({ ...formData, email: value })}
                    error={formErrors.email}
                    required
                    icon={<Mail className="h-4 w-4" />}
                    placeholder="correo@ejemplo.com"
                  />
                  
                  <FormField
                    label="Teléfono"
                    type="tel"
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                    error={formErrors.phone}
                    icon={<Phone className="h-4 w-4" />}
                    placeholder="+1 234 567 8900"
                  />
                  
                  <FormField
                    label="Posición"
                    value={formData.position}
                    onChange={(value) => setFormData({ ...formData, position: value })}
                    error={formErrors.position}
                    icon={<Badge className="h-4 w-4" />}
                    placeholder="Cargo o posición"
                  />
                  
                  <FormField
                    label="Habilidades"
                    value={formData.skills}
                    onChange={(value) => setFormData({ ...formData, skills: value })}
                    error={formErrors.skills}
                    helpText="Separar habilidades con comas"
                    placeholder="Almacen, Ventas, Atención al Cliente"
                  />
                  
                  <FormField
                    label="Tarifa por Hora"
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(value) => setFormData({ ...formData, hourly_rate: value })}
                    error={formErrors.hourly_rate}
                    required
                    icon={<DollarSign className="h-4 w-4" />}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary flex items-center space-x-2"
                  >
                    {submitting && <LoadingSpinner size="sm" />}
                    <span>{editingEmployee ? 'Actualizar' : 'Crear'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

