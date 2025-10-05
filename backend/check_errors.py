#!/usr/bin/env python3
"""
Script para verificar errores en Supabase
"""
import os
from dotenv import load_dotenv
from supabase import create_client, Client

# Cargar variables de entorno
load_dotenv()

# Configuración Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("ERROR: Variables de entorno de Supabase no configuradas")
    exit(1)

# Crear cliente
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

try:
    # Verificar si la tabla error_logs existe
    print("Verificando tabla error_logs...")
    
    # Intentar obtener errores
    response = supabase.table('error_logs').select('*').limit(5).execute()
    
    print(f"OK: Tabla error_logs existe. Errores encontrados: {len(response.data)}")
    
    if response.data:
        print("Ultimos errores:")
        for error in response.data:
            print(f"  - {error.get('message', 'Sin mensaje')} ({error.get('created_at', 'Sin fecha')})")
    else:
        print("No hay errores en la tabla")
        
    # Intentar insertar un error de prueba
    print("\nInsertando error de prueba...")
    test_error = {
        "run_id": "test-run-123",
        "user_id": None,
        "message": "Error de prueba desde script",
        "stack": None
    }
    
    result = supabase.table('error_logs').insert(test_error).execute()
    print("OK: Error de prueba insertado correctamente")
    
    # Limpiar error de prueba
    supabase.table('error_logs').delete().eq('run_id', 'test-run-123').execute()
    print("Error de prueba eliminado")
    
except Exception as e:
    print(f"ERROR: {e}")
    print("Verifica que la tabla 'error_logs' existe en Supabase")
    print("SQL para crear la tabla:")
    print("""
    CREATE TABLE IF NOT EXISTS error_logs (
        id SERIAL PRIMARY KEY,
        run_id VARCHAR(255),
        user_id VARCHAR(255),
        message TEXT,
        stack TEXT,
        created_at TIMESTAMP DEFAULT NOW()
    );
    """)
