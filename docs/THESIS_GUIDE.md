# Guía para la Tesis - Sistema de Generación de Turnos

## 📋 Información del Proyecto

**Título:** INFLUENCIA DE UN SISTEMA WEB BASADO EN UN SOLVER HÍBRIDO DE PROGRAMACIÓN POR RESTRICCIONES Y SAT (CP-SAT) EN LA OPTIMIZACIÓN DEL PROCESO DE PROGRAMACIÓN DE TURNOS EN UNA EMPRESA RETAIL DE TRUJILLO, 2025

**Tecnologías:**
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python + FastAPI + OR-Tools CP-SAT
- **Base de Datos:** Supabase (PostgreSQL)
- **Deploy:** Vercel (Frontend) + Railway (Backend)

## 🎯 Objetivos del Sistema

### Objetivo General
Desarrollar un sistema web que utilice un solver híbrido CP-SAT para optimizar la programación de turnos en empresas retail, mejorando la eficiencia operativa y reduciendo costos.

### Objetivos Específicos
1. **Implementar solver CP-SAT** para optimización de turnos
2. **Desarrollar interfaz web** intuitiva para gestión
3. **Reducir tiempo de programación** de turnos
4. **Minimizar costos** de personal
5. **Mejorar satisfacción** de empleados

## 🔬 Metodología de Investigación

### Enfoque
- **Tipo:** Aplicada
- **Método:** Experimental
- **Diseño:** Pre-experimental (un solo grupo)

### Población y Muestra
- **Población:** Empresas retail de Trujillo
- **Muestra:** 1 empresa retail (caso de estudio)
- **Tamaño:** 20-50 empleados
- **Período:** 4 semanas de implementación

### Variables de Estudio

#### Variable Independiente
- **Sistema web con solver CP-SAT** para programación de turnos

#### Variable Dependiente
- **Eficiencia en programación de turnos** (tiempo, costos, satisfacción)

#### Variables de Control
- Número de empleados
- Horarios de operación
- Restricciones laborales
- Presupuesto disponible

## 📊 Métricas de Evaluación

### Métricas Cuantitativas

1. **Tiempo de Programación**
   - Tiempo manual vs. tiempo automatizado
   - Reducción porcentual del tiempo

2. **Costos Operativos**
   - Costo por hora de programación
   - Reducción de costos de personal
   - Optimización de recursos

3. **Eficiencia del Solver**
   - Tiempo de ejecución del algoritmo
   - Calidad de la solución (valor objetivo)
   - Tasa de éxito de optimización

4. **Cobertura de Turnos**
   - Porcentaje de turnos cubiertos
   - Balance de carga de trabajo
   - Satisfacción de restricciones

### Métricas Cualitativas

1. **Satisfacción del Usuario**
   - Encuestas a gerentes/administradores
   - Facilidad de uso del sistema
   - Tiempo de aprendizaje

2. **Calidad de la Solución**
   - Cumplimiento de restricciones
   - Balance de preferencias
   - Equidad en asignaciones

## 🧪 Protocolo de Experimentación

### Fase 1: Preparación (Semana 1)
1. **Configuración del sistema**
   - Instalación y configuración
   - Migración de datos existentes
   - Capacitación del personal

2. **Recolección de datos base**
   - Tiempo actual de programación
   - Costos operativos actuales
   - Satisfacción actual del personal

### Fase 2: Implementación (Semanas 2-3)
1. **Uso del sistema**
   - Programación semanal de turnos
   - Optimización automática
   - Monitoreo de resultados

2. **Recolección de datos**
   - Tiempo de programación con sistema
   - Costos operativos optimizados
   - Métricas de rendimiento

### Fase 3: Evaluación (Semana 4)
1. **Análisis de resultados**
   - Comparación antes/después
   - Análisis estadístico
   - Interpretación de resultados

2. **Documentación**
   - Reporte de resultados
   - Conclusiones y recomendaciones

## 📈 Análisis de Datos

### Herramientas de Análisis
- **Estadística descriptiva:** Medias, medianas, desviaciones
- **Pruebas t:** Comparación de medias
- **Análisis de correlación:** Relación entre variables
- **Análisis de regresión:** Predicción de resultados

### Software de Análisis
- **Python:** Pandas, NumPy, SciPy
- **R:** Para análisis estadístico avanzado
- **Excel:** Para análisis básico y gráficos

## 📝 Instrumentos de Recolección

### 1. Cronómetro Digital
- Medición precisa del tiempo de programación
- Registro automático de tiempos

### 2. Encuestas de Satisfacción
- Escala Likert (1-5)
- Preguntas sobre facilidad de uso
- Evaluación de resultados

### 3. Registros del Sistema
- Logs automáticos de uso
- Métricas de rendimiento
- Reportes de optimización

### 4. Entrevistas Semiestructuradas
- Gerentes de recursos humanos
- Supervisores de turnos
- Empleados afectados

## 📊 Presentación de Resultados

### Gráficos y Tablas

1. **Comparación de Tiempos**
   - Gráfico de barras: Tiempo manual vs. automatizado
   - Tabla de reducción porcentual

2. **Análisis de Costos**
   - Gráfico de líneas: Evolución de costos
   - Tabla de ahorros generados

3. **Eficiencia del Solver**
   - Gráfico de dispersión: Tiempo vs. calidad
   - Tabla de métricas de rendimiento

4. **Satisfacción del Usuario**
   - Gráfico de barras: Puntuaciones por criterio
   - Tabla de resultados de encuestas

### Interpretación de Resultados

1. **Significancia Estadística**
   - Nivel de confianza: 95%
   - Valor p < 0.05
   - Intervalos de confianza

2. **Magnitud del Efecto**
   - Tamaño del efecto (Cohen's d)
   - Interpretación práctica
   - Relevancia clínica

## 🎯 Conclusiones Esperadas

### Hipótesis de Trabajo
**H1:** El sistema web con solver CP-SAT reduce significativamente el tiempo de programación de turnos.

**H2:** El sistema web con solver CP-SAT reduce los costos operativos de programación.

**H3:** El sistema web con solver CP-SAT mejora la satisfacción de los usuarios.

### Resultados Esperados

1. **Reducción del tiempo de programación:** 60-80%
2. **Reducción de costos operativos:** 30-50%
3. **Mejora en satisfacción del usuario:** 4.0+ en escala 1-5
4. **Aumento en eficiencia operativa:** 40-60%

## 📚 Marco Teórico

### Fundamentos Teóricos

1. **Programación por Restricciones (CP)**
   - Definición y características
   - Algoritmos de satisfacción
   - Aplicaciones en optimización

2. **Satisfiability (SAT)**
   - Problema SAT
   - Algoritmos de resolución
   - Aplicaciones prácticas

3. **Optimización Combinatoria**
   - Problemas de asignación
   - Algoritmos heurísticos
   - Metaheurísticas

4. **Sistemas de Información**
   - Arquitectura de sistemas web
   - Bases de datos relacionales
   - Interfaces de usuario

### Estado del Arte

1. **Sistemas de programación de turnos**
   - Soluciones comerciales existentes
   - Limitaciones actuales
   - Oportunidades de mejora

2. **Algoritmos de optimización**
   - OR-Tools y CP-SAT
   - Comparación con otros solvers
   - Ventajas y desventajas

3. **Aplicaciones en retail**
   - Casos de estudio similares
   - Métricas de éxito
   - Lecciones aprendidas

## 🔍 Limitaciones del Estudio

### Limitaciones Metodológicas
1. **Muestra pequeña:** Solo una empresa
2. **Período corto:** 4 semanas de implementación
3. **Contexto específico:** Solo retail en Trujillo

### Limitaciones Técnicas
1. **Dependencia de datos:** Calidad de datos de entrada
2. **Configuración del solver:** Parámetros del algoritmo
3. **Recursos computacionales:** Limitaciones de hardware

### Limitaciones de Generalización
1. **Contexto específico:** Resultados no generalizables
2. **Tamaño de muestra:** Limitaciones estadísticas
3. **Período de estudio:** Resultados a corto plazo

## 🚀 Recomendaciones Futuras

### Mejoras del Sistema
1. **Integración con sistemas existentes**
2. **Machine learning para predicciones**
3. **Interfaz móvil para empleados**
4. **Reportes avanzados y analytics**

### Investigaciones Futuras
1. **Estudio longitudinal:** 6-12 meses
2. **Múltiples empresas:** Comparación sectorial
3. **Algoritmos híbridos:** Combinación de técnicas
4. **Aplicación en otros sectores**

## 📖 Referencias Bibliográficas

### Libros
- Russell, S. & Norvig, P. (2020). Artificial Intelligence: A Modern Approach
- Winston, W. L. (2003). Operations Research: Applications and Algorithms
- Pinedo, M. (2016). Scheduling: Theory, Algorithms, and Systems

### Artículos Científicos
- Google OR-Tools Documentation
- CP-SAT Solver Research Papers
- Workforce Scheduling Optimization Studies

### Recursos Web
- Supabase Documentation
- FastAPI Documentation
- React Documentation
- OR-Tools GitHub Repository

## 📞 Contacto y Soporte

Para dudas sobre la implementación técnica:
- Revisar documentación en `/docs/`
- Consultar logs del sistema
- Verificar configuración de variables de entorno

Para dudas sobre la metodología de investigación:
- Consultar marco teórico
- Revisar protocolo de experimentación
- Analizar instrumentos de recolección
