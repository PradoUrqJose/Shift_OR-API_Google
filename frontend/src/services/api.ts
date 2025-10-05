import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-restless-pond-1420.fly.dev'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('supabase.auth.token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado, redirigir a login
      localStorage.removeItem('supabase.auth.token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Servicios específicos
export const employeeService = {
  getAll: () => api.get('/api/employees'),
  getById: (id: number) => api.get(`/api/employees/${id}`),
  create: (data: any) => api.post('/api/employees', data),
  update: (id: number, data: any) => api.put(`/api/employees/${id}`, data),
  delete: (id: number) => api.delete(`/api/employees/${id}`),
}

export const shiftService = {
  getAll: () => api.get('/api/shifts'),
  getById: (id: number) => api.get(`/api/shifts/${id}`),
  create: (data: any) => api.post('/api/shifts', data),
  update: (id: number, data: any) => api.put(`/api/shifts/${id}`, data),
  delete: (id: number) => api.delete(`/api/shifts/${id}`),
}

export const solverService = {
  solve: (constraints: any) => api.post('/api/solver/solve', constraints),
  getRuns: () => api.get('/api/solver/runs'),
  getRun: (runId: string) => api.get(`/api/solver/runs/${runId}`),
  getAssignments: (runId: string) => api.get(`/api/solver/runs/${runId}/assignments`),
}

export const reportService = {
  getReport: (runId: string) => api.get(`/api/reports/${runId}`),
  getPrintView: (runId: string) => api.get(`/api/reports/${runId}/printview`),
}
