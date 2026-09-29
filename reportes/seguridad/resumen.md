# Resumen — OWASP ZAP (Baseline Scan)

- **Tipo de escaneo:** ZAP Automated Baseline Scan (v2.17.0), ejecutado en Docker dentro del job `owasp-zap` del pipeline de CI/CD.
- **URL objetivo:** https://geston-hospitalaria.vercel.app
- **Fecha:** 28/09/2026
- **Reporte completo:** [`ZAP_Scanning_Report.pdf`](./ZAP_Scanning_Report.pdf) (también disponible como `report_html.html` / `report_xml.xml` en el artifact `reporte-owasp-zap` de GitHub Actions)

## Resumen de alertas

| Riesgo | Número de alertas |
|---|---|
| Alto | 0 |
| Medio | 3 |
| Bajo | 4 |
| Informativo | 8 |

## Hallazgos principales

| Hallazgo | Riesgo | Descripción |
|---|---|---|
| XSS (reflejado o almacenado) | — | No se detectaron alertas |
| Inyección SQL | — | No se detectaron alertas (no aplica motor SQL; el proyecto usa MongoDB) |
| Content Security Policy (CSP) Header Not Set | Medio | No se define la cabecera `Content-Security-Policy` |
| Cross-Domain Misconfiguration | Medio | `Access-Control-Allow-Origin: *` permitía peticiones desde cualquier dominio |
| Missing Anti-clickjacking Header | Medio | Falta `X-Frame-Options` / `frame-ancestors` |
| X-Content-Type-Options Header Missing | Bajo | Falta la cabecera `nosniff` |
| Permissions Policy Header Not Set | Bajo | No se limita el uso de funciones del navegador (cámara, micrófono, geolocalización) |
| COEP y COOP Missing | Bajo | No hay aislamiento del contexto de navegación entre orígenes |

> **Nota metodológica:** el escaneo baseline es pasivo (revisa las respuestas del sitio, no lanza ataques). La ausencia de alertas de XSS o inyección no garantiza que no existan; un *full scan* o un escaneo de API sobre el backend daría una evaluación más completa, en especial para inyección NoSQL en MongoDB.

## Acciones tomadas

| Acción | Detalle |
|---|---|
| Anti-clickjacking | Se configuró `X-Frame-Options: SAMEORIGIN` |
| Protección anti-MIME sniffing | Se agregó `X-Content-Type-Options: nosniff` |
| Restricción de CORS | Se ajustó `Access-Control-Allow-Origin` para permitir solo dominios autorizados en vez de `*` |

## Riesgos aceptados / pendientes

- **Aceptado:** alertas informativas de política de caché en recursos estáticos de Vercel (CSS, JS, SVG) — no contienen datos sensibles ni de sesión.
- **Aceptado temporalmente:** ausencia de COOP y COEP (riesgo bajo).
- **Pendiente (plan de mejora de corto plazo):** definir `Content-Security-Policy` y `Permissions-Policy` (vía `helmet`).

Detalle completo en el informe final (`documento_final/Informe_Cierre_Proyecto.pdf`, sección 4.2).
