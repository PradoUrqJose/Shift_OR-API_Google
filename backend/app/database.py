"""
Configuración de base de datos con Supabase
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import structlog

# Cargar variables de entorno
load_dotenv()

logger = structlog.get_logger()

# Configuración Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# Cliente Supabase (solo si las variables están configuradas)
supabase: Client = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Configuración SQLAlchemy
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./sistema_turnos.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependencia para obtener sesión de DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Inicializar base de datos
async def init_db():
    """Crear tablas si no existen"""
    try:
        # Crear tablas
        Base.metadata.create_all(bind=engine)
        logger.info("Base de datos inicializada correctamente")
    except Exception as e:
        logger.error(f"Error inicializando base de datos: {e}")
        raise

# Función para log de errores
async def log_error(run_id: str, user_id: str, message: str, stack: str = None):
    """Guardar error en tabla error_logs"""
    try:
        if supabase:
            error_data = {
                "run_id": run_id,
                "user_id": user_id,
                "message": message,
                "stack": stack,
                "created_at": "now()"
            }
            
            result = supabase.table("error_logs").insert(error_data).execute()
            logger.info(f"Error logueado: {run_id}")
        else:
            logger.info(f"Error (sin Supabase): {run_id} - {message}")
    except Exception as e:
        logger.error(f"Error guardando log: {e}")
