"""
Sistema de Generación de Turnos - Backend FastAPI
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import os
from dotenv import load_dotenv

from app.routers import auth, employees, shifts, solver, reports
from app.database import init_db

# Cargar variables de entorno
load_dotenv()

# Crear aplicación FastAPI
app = FastAPI(
    title="Sistema de Generación de Turnos",
    description="API para optimización de turnos con OR-Tools CP-SAT",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app", "https://shift-or-api-google.vercel.app", "https://shift-or-api-google-git-main-bertos-projects-32566259.vercel.app", "https://sistema-turnos-frontend.vercel.app", "https://sistema-programacion-turnos-frontend.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar base de datos
@app.on_event("startup")
async def startup_event():
    await init_db()

# Incluir routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(shifts.router, prefix="/api/shifts", tags=["shifts"])
app.include_router(solver.router, prefix="/api/solver", tags=["solver"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

@app.get("/")
async def root():
    return {"message": "Sistema de Generación de Turnos API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
