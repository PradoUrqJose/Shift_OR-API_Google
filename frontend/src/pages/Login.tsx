import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react'

interface LoginForm {
  email: string
  password: string
}

interface SignUpForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export function Login() {
  const { user, signIn, signUp, loading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const loginForm = useForm<LoginForm>()
  const signUpForm = useForm<SignUpForm>()

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleLogin = async (data: LoginForm) => {
    try {
      await signIn(data.email, data.password)
    } catch (error) {
      // Error handled in context
    }
  }

  const handleSignUp = async (data: SignUpForm) => {
    if (data.password !== data.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }
    
    try {
      await signUp(data.email, data.password, data.name)
    } catch (error) {
      // Error handled in context
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Generación de Turnos
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          {isSignUp ? (
            <form className="space-y-6" onSubmit={signUpForm.handleSubmit(handleSignUp)}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  {...signUpForm.register('name', { required: true })}
                  type="text"
                  className="input mt-1"
                  placeholder="Tu nombre completo"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...signUpForm.register('email', { required: true, pattern: /^\S+@\S+$/i })}
                  type="email"
                  className="input mt-1"
                  placeholder="tu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative mt-1">
                  <input
                    {...signUpForm.register('password', { required: true, minLength: 6 })}
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <input
                  {...signUpForm.register('confirmPassword', { required: true })}
                  type="password"
                  className="input mt-1"
                  placeholder="Repite tu contraseña"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Crear cuenta
              </button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={loginForm.handleSubmit(handleLogin)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  {...loginForm.register('email', { required: true, pattern: /^\S+@\S+$/i })}
                  type="email"
                  className="input mt-1"
                  placeholder="tu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative mt-1">
                  <input
                    {...loginForm.register('password', { required: true })}
                    type={showPassword ? 'text' : 'password'}
                    className="input pr-10"
                    placeholder="Tu contraseña"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar sesión
              </button>
            </form>
          )}
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
            >
              {isSignUp 
                ? '¿Ya tienes cuenta? Inicia sesión' 
                : '¿No tienes cuenta? Regístrate'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
