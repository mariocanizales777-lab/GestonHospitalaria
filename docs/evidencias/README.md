# Evidencias del ciclo de desarrollo

Capturas de pantalla organizadas por actividad, referenciadas desde el informe final (`documento_final/Informe_Cierre_Proyecto.pdf`).

| Carpeta | Contenido |
|---|---|
| [`trello/`](trello/) | Tablero Kanban al cierre (13 tarjetas en Done: 7 historias de usuario + 5 tareas de documentación + 1 tarea técnica de CI) y tarjetas individuales de cada historia con su checklist de criterios de aceptación. |
| [`postman/`](postman/) | 15 pruebas de API (positivas y negativas: 401 sin token, 401 credenciales incorrectas, 403 rol sin permiso) sobre login, registro, doctores, horarios, medicamentos, citas y pedidos. |
| [`cicd/`](cicd/) | Ejecución del pipeline con los 4 jobs en verde, el archivo `ci.yml` completo, e historial de despliegues en Render y Vercel. |
| [`sonarqube/`](sonarqube/) | Dashboard de SonarQube Cloud: Quality Gate de código nuevo y métricas del código global. |

Las capturas del reporte de cobertura de Jest están en [`../../reportes/unit-tests/`](../../reportes/unit-tests/) y el reporte completo de OWASP ZAP en [`../../reportes/seguridad/`](../../reportes/seguridad/).
