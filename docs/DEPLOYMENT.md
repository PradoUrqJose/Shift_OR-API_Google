# Guía de Despliegue - Sistema de Generación de Turnos

## 🚀 Despliegue en Producción

### Frontend (Vercel)

1. **Preparar el proyecto:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Configurar variables de entorno en Vercel:**
   - `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
   - `VITE_SUPABASE_ANON_KEY`: Clave anónima de Supabase
   - `VITE_API_URL`: URL del backend (Railway)

3. **Deploy automático:**
   - Conectar repositorio GitHub a Vercel
   - Configurar build command: `npm run build`
   - Configurar output directory: `dist`

### Backend (Railway)

1. **Preparar el proyecto:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configurar variables de entorno en Railway:**
   - `SUPABASE_URL`: URL de tu proyecto Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio de Supabase
   - `SUPABASE_JWT_SECRET`: Secreto JWT de Supabase
   - `DATABASE_URL`: URL de la base de datos PostgreSQL
   - `SECRET_KEY_BASE`: Clave secreta para la aplicación
   - `SENDGRID_API_KEY`: Clave de API de SendGrid

3. **Deploy automático:**
   - Conectar repositorio GitHub a Railway
   - Railway detectará automáticamente el `railway.json`
   - El deploy se ejecutará automáticamente

## 🔧 Configuración de Supabase

### 1. Crear Proyecto Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Obtener URL y claves de API

### 2. Configurar Base de Datos

Ejecutar los siguientes SQL en el editor SQL de Supabase:

```sql
-- Crear tablas
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    position TEXT,
    skills TEXT,
    availability TEXT,
    preferences TEXT,
    hourly_rate DECIMAL DEFAULT 0.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE shifts (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    day_of_week INTEGER,
    required_skills TEXT,
    min_employees INTEGER DEFAULT 1,
    max_employees INTEGER DEFAULT 1,
    cost_multiplier DECIMAL DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE solver_runs (
    id SERIAL PRIMARY KEY,
    run_id TEXT UNIQUE NOT NULL,
    user_id TEXT REFERENCES users(id),
    status TEXT DEFAULT 'pending',
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    constraints TEXT,
    objective_value DECIMAL,
    solve_time DECIMAL,
    assignments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    solver_run_id INTEGER REFERENCES solver_runs(id),
    employee_id INTEGER REFERENCES employees(id),
    shift_id INTEGER REFERENCES shifts(id),
    date TIMESTAMP,
    status TEXT DEFAULT 'assigned',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE error_logs (
    id SERIAL PRIMARY KEY,
    run_id TEXT,
    user_id TEXT REFERENCES users(id),
    message TEXT,
    stack TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE solver_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can manage employees" ON employees FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage shifts" ON shifts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage solver_runs" ON solver_runs FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage assignments" ON assignments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage error_logs" ON error_logs FOR ALL USING (auth.role() = 'authenticated');
```

### 3. Configurar Autenticación

1. Ir a Authentication > Settings
2. Configurar Site URL: `https://tu-dominio.vercel.app`
3. Configurar Redirect URLs: `https://tu-dominio.vercel.app/**`

## 📊 Monitoreo y Logs

### Railway
- Logs disponibles en el dashboard de Railway
- Métricas de CPU y memoria
- Health checks automáticos

### Vercel
- Logs de función disponibles en el dashboard
- Métricas de rendimiento
- Analytics de uso

## 🔒 Seguridad

### Variables de Entorno Sensibles
- `SUPABASE_SERVICE_ROLE_KEY`: Mantener secreta
- `SECRET_KEY_BASE`: Generar clave segura
- `SENDGRID_API_KEY`: Mantener secreta

### Configuración de CORS
- Frontend: `https://tu-dominio.vercel.app`
- Backend: Configurar CORS para el dominio del frontend

## 🚨 Troubleshooting

### Problemas Comunes

1. **Error de CORS:**
   - Verificar configuración de CORS en el backend
   - Verificar URLs en variables de entorno

2. **Error de autenticación:**
   - Verificar claves de Supabase
   - Verificar configuración de JWT

3. **Error de base de datos:**
   - Verificar conexión a PostgreSQL
   - Verificar políticas de RLS

### Logs de Debug

```bash
# Backend
railway logs

# Frontend
vercel logs
```

## 📈 Optimización

### Backend
- Configurar cache para consultas frecuentes
- Optimizar consultas de base de datos
- Configurar rate limiting

### Frontend
- Optimizar bundle size
- Configurar CDN
- Implementar lazy loading

## 🔄 CI/CD

### GitHub Actions (Opcional)
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: railway deploy
```

## 📞 Soporte

Para problemas específicos:
1. Revisar logs en Railway/Vercel
2. Verificar configuración de variables de entorno
3. Consultar documentación de Supabase
4. Revisar configuración de CORS
