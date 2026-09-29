# Arquitectura de software — GestonHospitalaria

Modelo 4+1 (Kruchten). Decisión implementada: **monolito modular en capas** (API REST en Node.js + Express, frontend en React + Vite) en vez de la propuesta original de microservicios de la Actividad 4 — cada módulo del backend corresponde 1:1 a un microservicio planeado, por lo que una migración futura movería módulos completos sin rediseñarlos.

| Vista | Diagrama | Archivo |
|---|---|---|
| Vista lógica (componentes/servicios) | Diagrama de componentes | [`01-diagrama-componentes.png`](01-diagrama-componentes.png) |
| Vista de desarrollo (módulos/paquetes) | Diagrama de paquetes | [`02-diagrama-paquetes.png`](02-diagrama-paquetes.png) |
| Vista de procesos (interacciones) | Secuencia: registro + login | [`04-secuencia-registro-login.png`](04-secuencia-registro-login.png) |
| Vista de procesos (interacciones) | Secuencia: agendar cita | [`05-secuencia-agendar-cita.png`](05-secuencia-agendar-cita.png) |
| Vista física (despliegue) | Despliegue (Vercel + Render + MongoDB Atlas + Docker local) | [`03-diagrama-despliegue.png`](03-diagrama-despliegue.png) |
| +1 Escenarios | Casos de uso | [`07-diagrama-casos-de-uso.png`](07-diagrama-casos-de-uso.png) |
| Modelo de datos | Entidad-relación (6 colecciones de MongoDB) | [`06-diagrama-entidad-relacion.png`](06-diagrama-entidad-relacion.png) |
| Referencia | Cronograma planificado vs. real | [`08-cronograma-planificado-vs-real.png`](08-cronograma-planificado-vs-real.png) |
| Referencia | Estructura real del repositorio | [`09-estructura-repo-backend.png`](09-estructura-repo-backend.png), [`10-estructura-repo-frontend.png`](10-estructura-repo-frontend.png), [`11-estructura-repo-tests.png`](11-estructura-repo-tests.png) |
| Referencia | Modelos Mongoose (ejemplos) | [`12-modelo-cita.png`](12-modelo-cita.png), [`13-modelo-pedido.png`](13-modelo-pedido.png), [`14-modelo-receta.png`](14-modelo-receta.png) |

Descripción de cada vista y el escenario narrativo completo ("Agendar cita") en el informe final (`documento_final/Informe_Cierre_Proyecto.pdf`, sección 2.3).
