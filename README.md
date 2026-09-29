# GestonHospitalaria (FarmaCitas Fantásticas)

Sistema de gestión de citas médicas y farmacia para consultorios en farmacias. Sustituye el registro manual en papel por una plataforma web donde los pacientes reservan citas, consultan medicamentos y recetas, los doctores gestionan su agenda y emiten recetas, y el administrador da de alta doctores, publica horarios y controla el inventario.

Proyecto integrador — Ingeniería en Desarrollo de Software (Tecmilenio). Ver el informe completo en [`documento_final/Informe_Cierre_Proyecto.pdf`](documento_final/Informe_Cierre_Proyecto.pdf).

## Entornos desplegados

| Componente | URL |
|---|---|
| Frontend (Vercel) | https://geston-hospitalaria.vercel.app |
| Backend / API (Render) | https://farmacitas-backend.onrender.com |
| Base de datos | MongoDB Atlas |

> El backend usa el plan gratuito de Render, que suspende el servicio tras un periodo de inactividad; la primera petición puede tardar ~50 segundos en responder.

## Stack técnico

- **Backend:** Node.js 20 + Express + Mongoose (MongoDB)
- **Frontend:** React + Vite
- **Autenticación:** JWT (8h de vigencia) + bcrypt para contraseñas
- **Pruebas:** Jest + Supertest + mongodb-memory-server
- **CI/CD:** GitHub Actions (`.github/workflows/ci.yml`)
- **Calidad y seguridad:** SonarQube Cloud + OWASP ZAP (baseline scan)
- **Contenedores:** Docker + Docker Compose (desarrollo local)

## Estructura del repositorio

```
GestonHospitalaria/
├─ Backend/                  # API REST (Express + Mongoose)
│  ├─ src/controllers/       # Lógica de negocio por módulo
│  ├─ src/routes/            # Definición de endpoints
│  ├─ src/models/            # Esquemas de Mongoose
│  ├─ src/middleware/        # Autenticación (JWT) y autorización por rol
│  ├─ src/config/            # Conexión a BD y datos semilla (seed)
│  └─ src/tests/             # Pruebas con Jest + Supertest
├─ Frontend/                 # Aplicación React + Vite
│  └─ src/components/        # Vistas por rol (paciente, doctor, admin)
├─ docs/
│  ├─ arquitectura/          # Diagramas UML (4+1): componentes, despliegue,
│  │                         # secuencia, entidad-relación, casos de uso
│  ├─ evidencias/            # Capturas: Trello, Postman, CI/CD, SonarQube
│  └─ api/                   # Documentación de endpoints
├─ reportes/
│  ├─ unit-tests/            # Resumen y captura de cobertura (Jest)
│  ├─ seguridad/             # Reporte de OWASP ZAP
│  └─ sonarqube/             # Resumen de métricas de SonarQube Cloud
├─ documento_final/          # Informe de cierre de proyecto (PDF)
├─ docker-compose.yml        # Orquestación local (frontend + backend + Mongo)
└─ .github/workflows/ci.yml  # Pipeline de CI/CD
```

## Puesta en marcha local

### Con Docker Compose (recomendado)

```bash
docker compose up --build
```

Esto levanta 3 contenedores: `mongo` (puerto 27017), `backend` (puerto 4000) y `frontend` (puerto 3000, servido con nginx).

### Manual (sin Docker)

**Backend:**
```bash
cd Backend
npm install
cp .env.example .env   # define MONGO_URI y JWT_SECRET
npm run dev            # http://localhost:4000
```

**Frontend:**
```bash
cd Frontend
npm install
npm run dev             # http://localhost:5173
```

### Pruebas

```bash
cd Backend
npm test                # Jest + cobertura (Istanbul)
```

El reporte HTML de cobertura queda en `Backend/coverage/lcov-report/index.html`. Un resumen de los últimos resultados está en [`reportes/unit-tests/coverage-summary.txt`](reportes/unit-tests/coverage-summary.txt).

## Autenticación y roles

El sistema tiene 3 roles: `paciente`, `doctor` y `admin`. El registro público (`POST /api/auth/registro`) siempre crea una cuenta de paciente; los doctores los da de alta el administrador. Cada ruta protegida valida primero el JWT (`verificarToken`) y después el rol (`requireRol`). Ver el detalle completo en [`docs/api/endpoints.md`](docs/api/endpoints.md) y en la sección 3.2 del informe final.

## CI/CD

El pipeline (`.github/workflows/ci.yml`) corre en cada push y, cuando el cambio llega a `main`, despliega automáticamente a Render y Vercel y ejecuta un escaneo de seguridad con OWASP ZAP. Ver capturas en [`docs/evidencias/cicd/`](docs/evidencias/cicd/).

## Calidad y seguridad

- **Cobertura de pruebas:** 94.15% de líneas / 100% de funciones en los controladores de citas, pedidos y recetas (meta: ≥80%). Ver [`reportes/unit-tests/`](reportes/unit-tests/).
- **OWASP ZAP:** 0 alertas de riesgo alto, 3 de riesgo medio (ya atendidas: CSP, anti-clickjacking, CORS). Ver [`reportes/seguridad/ZAP_Scanning_Report.pdf`](reportes/seguridad/ZAP_Scanning_Report.pdf).
- **SonarQube Cloud:** Quality Gate no aprobado en código nuevo (seguridad E, confiabilidad C); plan de corrección documentado. Ver [`reportes/sonarqube/`](reportes/sonarqube/).

Detalle completo de hallazgos, decisiones y lecciones aprendidas en [`documento_final/Informe_Cierre_Proyecto.pdf`](documento_final/Informe_Cierre_Proyecto.pdf).

## Equipo

| Nombre | Matrícula | Rol |
|---|---|---|
| Mario Ángel García Canizales | 3065072 | Coordinador del Proyecto |
| Pablo Ángel Garza Ramírez | 7094461 | Administrador de Base de Datos y QA |
| Rubén Miguel Manzanares Tovar | 2886925 | Front-end |
| Christopher Abraham Chairez Cruz | 3038149 | Back-end |
| Luis Carlos Soto Carrillo | 7039730 | Analista y Documentador |

**Materia:** Ingeniería en Desarrollo de Software · **Docente:** Carlos Abraham Carballo Monsivais
