import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Employees } from './pages/Employees'
import { Shifts } from './pages/Shifts'
import { Solver } from './pages/Solver'
import { Reports } from './pages/Reports'
import { Assignments } from './pages/Assignments'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="shifts" element={<Shifts />} />
            <Route path="solver" element={<Solver />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
