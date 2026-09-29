# Resumen — SonarQube Cloud

Proyecto: **GestonHospitalaria** · Rama analizada: `main` (5.9k líneas de código) · Quality Gate: **Sonar way**

Capturas: [`docs/evidencias/sonarqube/01-quality-gate-codigo-nuevo.png`](../../docs/evidencias/sonarqube/01-quality-gate-codigo-nuevo.png) y [`02-metricas-codigo-global.png`](../../docs/evidencias/sonarqube/02-metricas-codigo-global.png).

## Métricas

| Métrica | Código global | Código nuevo |
|---|---|---|
| Quality Gate | — | **No aprobado** (3 condiciones fallidas) |
| Seguridad (vulnerabilidades) | 18 issues abiertos — calificación **E** | Calificación E (requerida: A) |
| Confiabilidad (bugs) | 387 issues abiertos — calificación **C** | Calificación C (requerida: A) |
| Mantenibilidad (code smells) | 764 issues abiertos — calificación **A** | 763 issues nuevos |
| Duplicación | 12.1% (sobre 6.7k líneas) | 16.16% sobre 3.9k líneas nuevas (límite ≤ 3.0%) |
| Cobertura | No configurada | No configurada |
| Deuda técnica | Representada por los 764 code smells | — |

## Interpretación

- **Mantenibilidad A:** a pesar del número de code smells, la deuda técnica es baja en proporción al tamaño del código.
- **Seguridad E y confiabilidad C:** son las métricas que hacen fallar el Quality Gate. Cada uno de los 18 issues de seguridad debe revisarse en la pestaña *Issues* de SonarQube Cloud y corregirse o justificarse.
- **Duplicación alta:** el repositorio incluye archivos generados (p. ej. `Backend/coverage/lcov-report/`, HTML/JS del reporte de Jest) que, al ser analizados, inflan la duplicación y el número de issues.
- **Cobertura no configurada:** el reporte `lcov.info` de Jest ya existe (ver `reportes/unit-tests/`); basta con importarlo vía `sonar.javascript.lcov.reportPaths` para que SonarQube calcule la cobertura real.

## Plan de corrección (corto/mediano plazo)

1. Excluir del análisis los archivos generados (`sonar.exclusions`) y volver a medir duplicación.
2. Importar `lcov.info` para que la cobertura se refleje en el dashboard.
3. Revisar y corregir (o justificar) los 18 issues de seguridad abiertos, priorizando los de mayor severidad.
4. Repetir el análisis y confirmar que el Quality Gate pase a **Aprobado** (meta: seguridad A, confiabilidad A).

Detalle completo en el informe final (`documento_final/Informe_Cierre_Proyecto.pdf`, sección 4.3).
