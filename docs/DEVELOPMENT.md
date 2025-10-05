# Guía de Desarrollo - Sistema de Generación de Turnos

## 🛠️ Configuración del Entorno de Desarrollo

### Prerrequisitos

- **Node.js** 18+ y npm
- **Python** 3.11+
- **Git**
- **Supabase CLI** (opcional)

### 1. Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd sistema-programacion-turnos
```

### 2. Configurar Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus valores

# Ejecutar migraciones (si es necesario)
# alembic upgrade head

# Ejecutar servidor
uvicorn app.main:app --reload
```

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus valores

# Ejecutar servidor de desarrollo
npm run dev
```

## 🗄️ Configuración de Supabase

### 1. Crear Proyecto Supabase

1. Ir a [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Obtener URL y claves de API

### 2. Configurar Base de Datos

Ejecutar el SQL de `docs/DEPLOYMENT.md` en el editor SQL de Supabase.

### 3. Configurar Autenticación

1. Ir a Authentication > Settings
2. Configurar Site URL: `http://localhost:3000`
3. Configurar Redirect URLs: `http://localhost:3000/**`

## 🧪 Testing

### Backend Tests

```bash
cd backend
python -m pytest tests/
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 📝 Estructura del Proyecto

```
sistema-programacion-turnos/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── main.py         # Aplicación principal
│   │   ├── database.py     # Configuración DB
│   │   ├── models.py        # Modelos SQLAlchemy
│   │   ├── schemas.py      # Esquemas Pydantic
│   │   ├── routers/        # Endpoints API
│   │   └── solver/         # Lógica OR-Tools
│   ├── requirements.txt    # Dependencias Python
│   └── Dockerfile         # Configuración Docker
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas de la app
│   │   ├── services/       # Servicios API
│   │   └── contexts/       # Contextos React
│   ├── package.json       # Dependencias Node
│   └── vercel.json        # Configuración Vercel
├── docs/                   # Documentación
└── README.md              # Documentación principal
```

## 🔧 Comandos Útiles

### Backend

```bash
# Ejecutar servidor
uvicorn app.main:app --reload

# Ejecutar con debug
uvicorn app.main:app --reload --log-level debug

# Crear migración
alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
alembic upgrade head

# Revertir migración
alembic downgrade -1
```

### Frontend

```bash
# Ejecutar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Preview build
npm run preview

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🐛 Debugging

### Backend Debugging

1. **Logs estructurados:**
   ```python
   import structlog
   logger = structlog.get_logger()
   logger.info("Mensaje de debug", key="value")
   ```

2. **Debug de base de datos:**
   ```python
   # En database.py
   engine = create_engine(DATABASE_URL, echo=True)
   ```

3. **Debug de OR-Tools:**
   ```python
   # En solver/cp_sat_solver.py
   self.solver.parameters.log_search_progress = True
   ```

### Frontend Debugging

1. **React DevTools:**
   - Instalar extensión del navegador
   - Inspeccionar estado y props

2. **Network debugging:**
   - Abrir DevTools > Network
   - Verificar requests a la API

3. **Console debugging:**
   ```javascript
   console.log('Debug info:', data);
   ```

## 📊 Monitoreo de Rendimiento

### Backend

1. **Métricas de OR-Tools:**
   ```python
   solve_time = self.solver.WallTime()
   objective_value = self.solver.ObjectiveValue()
   ```

2. **Logs de performance:**
   ```python
   import time
   start_time = time.time()
   # ... código ...
   execution_time = time.time() - start_time
   logger.info(f"Execution time: {execution_time}s")
   ```

### Frontend

1. **React Profiler:**
   - Usar React DevTools Profiler
   - Identificar componentes lentos

2. **Bundle analysis:**
   ```bash
   npm run build
   npx vite-bundle-analyzer dist
   ```

## 🔒 Seguridad

### Backend Security

1. **Validación de entrada:**
   ```python
   from pydantic import BaseModel, validator
   
   class EmployeeCreate(BaseModel):
       email: str
       
       @validator('email')
       def validate_email(cls, v):
           if '@' not in v:
               raise ValueError('Invalid email')
           return v
   ```

2. **Autenticación JWT:**
   ```python
   from fastapi.security import HTTPBearer
   security = HTTPBearer()
   ```

3. **CORS configuration:**
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:3000"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### Frontend Security

1. **Validación de formularios:**
   ```javascript
   const { register, handleSubmit, formState: { errors } } = useForm();
   ```

2. **Sanitización de datos:**
   ```javascript
   const sanitizeInput = (input) => {
       return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
   };
   ```

## 🚀 Optimización

### Backend Optimization

1. **Caching:**
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=128)
   def expensive_calculation(param):
       # ... cálculo costoso ...
       return result
   ```

2. **Async operations:**
   ```python
   async def fetch_data():
       async with httpx.AsyncClient() as client:
           response = await client.get(url)
           return response.json()
   ```

### Frontend Optimization

1. **Lazy loading:**
   ```javascript
   const LazyComponent = React.lazy(() => import('./Component'));
   ```

2. **Memoization:**
   ```javascript
   const MemoizedComponent = React.memo(Component);
   ```

3. **Code splitting:**
   ```javascript
   const routes = [
       { path: '/', component: lazy(() => import('./Home')) },
       { path: '/employees', component: lazy(() => import('./Employees')) },
   ];
   ```

## 📚 Recursos Adicionales

### Documentación
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Supabase](https://supabase.com/docs)
- [OR-Tools](https://developers.google.com/optimization)

### Herramientas
- [Postman](https://www.postman.com/) - Testing de API
- [Supabase Dashboard](https://supabase.com/dashboard) - Gestión de datos
- [Vercel Dashboard](https://vercel.com/dashboard) - Deploy frontend
- [Railway Dashboard](https://railway.app/dashboard) - Deploy backend

### Comunidad
- [FastAPI Discord](https://discord.gg/VQjSZaeJmf)
- [React Discord](https://discord.gg/react)
- [Supabase Discord](https://discord.supabase.com/)
