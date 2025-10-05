"""
Sistema de Generación de Turnos - Backend FastAPI
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# 👇 ELIMINA esta línea si la tienes:
# from starlette.middleware.proxy_headers import ProxyHeadersMiddleware

# 👇 Polyfill retro-compatible del ProxyHeadersMiddleware
#    (ajusta scope["scheme"]=https cuando viene de Fly.io)
class ProxyHeadersMiddleware:
    def __init__(self, app):
        self.app = app
    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            headers = dict(scope.get("headers") or [])
            # Fly.io envía X-Forwarded-Proto: https cuando el cliente vino por HTTPS
            if headers.get(b"x-forwarded-proto") == b"https":
                scope["scheme"] = "https"
        await self.app(scope, receive, send)

import os
from app.routers import auth, employees, shifts, solver, reports
from app.database import init_db

load_dotenv()

app = FastAPI(
    title="Sistema de Generación de Turnos",
    description="API para optimización de turnos con OR-Tools CP-SAT",
    version="1.0.0"
)

# ✅ Añade primero el middleware de proxy
app.add_middleware(ProxyHeadersMiddleware)

# ✅ CORS con orígenes exactos (sin comodines *.vercel.app)
allowed_origins = [
    "http://localhost:3000",
    "https://shift-or-api-google.vercel.app",
    "https://sistema-turnos-frontend.vercel.app",
    "https://sistema-programacion-turnos-frontend.vercel.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_db()

# Routers
app.include_router(auth.router,     prefix="/api/auth",     tags=["auth"])
app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(shifts.router,    prefix="/api/shifts",    tags=["shifts"])
app.include_router(solver.router,    prefix="/api/solver",    tags=["solver"])
app.include_router(reports.router,   prefix="/api/reports",   tags=["reports"])

@app.get("/")
async def root():
    return {"message": "Sistema de Generación de Turnos API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    # 👇 Imprescindible para Fly.io
    uvicorn.run(app, host="0.0.0.0", port=8000)
