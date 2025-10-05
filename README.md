# Sistema de Programación de Turnos

Sistema web para optimización de turnos de trabajo utilizando Google OR-Tools CP-SAT solver.

## 🎯 Descripción

Este proyecto implementa un sistema híbrido de programación por restricciones y SAT (CP-SAT) para optimizar el proceso de programación de turnos en empresas retail.

## 🏗️ Arquitectura

- **Backend**: FastAPI + Python + OR-Tools CP-SAT
- **Frontend**: React + TypeScript + Vite
- **Base de datos**: PostgreSQL (Supabase)
- **Deploy**: Railway (Backend) + Vercel (Frontend)

## 🚀 Características

- ✅ Optimización de turnos con CP-SAT
- ✅ Gestión de empleados y disponibilidades
- ✅ Restricciones de horarios y habilidades
- ✅ Reportes y métricas de optimización
- ✅ Interfaz web moderna y responsive

## 📁 Estructura del Proyecto

```
├── backend/           # API FastAPI
│   ├── app/
│   │   ├── routers/  # Endpoints de la API
│   │   ├── solver/   # Lógica de OR-Tools
│   │   └── models.py # Modelos de datos
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/         # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
└── docs/            # Documentación
```

## 🛠️ Instalación y Desarrollo

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔧 Variables de Entorno

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://...
SECRET_KEY_BASE=your_secret_key
```

### Frontend
```
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📊 Funcionalidades del Solver

- **Optimización de turnos**: Algoritmo CP-SAT para asignación óptima
- **Restricciones**: Horarios, habilidades, disponibilidad
- **Métricas**: Tiempo de optimización, costos, satisfacción
- **Reportes**: Exportación a PDF/Excel

## 🚀 Deploy

### Railway (Backend)
```bash
railway login
railway link
railway up
```

### Vercel (Frontend)
```bash
vercel login
vercel --prod
```

## 📚 Documentación

- [Guía de Desarrollo](docs/DEVELOPMENT.md)
- [Guía de Deploy](docs/DEPLOYMENT.md)
- [Guía de Tesis](docs/THESIS_GUIDE.md)

## 🎓 Tesis

**Título**: "INFLUENCIA DE UN SISTEMA WEB BASADO EN UN SOLVER HÍBRIDO DE PROGRAMACIÓN POR RESTRICCIONES Y SAT (CP-SAT) EN LA OPTIMIZACIÓN DEL PROCESO DE PROGRAMACIÓN DE TURNOS EN UNA EMPRESA RETAIL DE TRUJILLO, 2025"

## 📄 Licencia

Este proyecto es parte de una investigación académica.