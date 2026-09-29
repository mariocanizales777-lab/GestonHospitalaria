# Documentación de la API — GestonHospitalaria

URL base en producción: `https://farmacitas-backend.onrender.com/api`
URL base en local: `http://localhost:4000/api`

Todas las rutas protegidas requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene en `/auth/login` o `/auth/registro` y tiene una vigencia de **8 horas**.

## Auth

| Método | Ruta | Acceso | Body | Respuesta |
|---|---|---|---|---|
| POST | `/auth/registro` | Público | `{ nombre, usuario, contrasena }` | `201` `{ token, usuario }` — crea siempre un **paciente** |
| POST | `/auth/login` | Público | `{ usuario, contrasena }` | `200` `{ token, usuario }` / `401` si las credenciales son incorrectas |

## Usuarios

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/usuarios?rol=doctor` | Público | Lista usuarios filtrados por rol (sin exponer la contraseña) |
| POST | `/usuarios/doctores` | `admin` | Crea un doctor con usuario y contraseña reales |
| DELETE | `/usuarios/doctores/:id` | `admin` | Elimina un doctor (si no tiene citas activas) |

## Horarios

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/horarios` | Público | Lista horarios (siembra los del día si no existen) |
| POST | `/horarios` | `admin` | Crea un horario `{ sucursal, medico, fecha, hora }` |
| PUT | `/horarios/:id` | `admin` | Edita un horario |
| DELETE | `/horarios/:id` | `admin` | Elimina un horario |

## Medicamentos

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/medicamentos` | Autenticado | Lista el catálogo |
| POST | `/medicamentos` | `admin` | Registra un medicamento `{ nombre, categoria, precio, stock, esControlado }` |
| PUT | `/medicamentos/:id` | `admin` | Actualiza precio/stock/esControlado |
| DELETE | `/medicamentos/:id` | `admin` | Elimina un medicamento |

## Citas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/citas` | `paciente` | Reserva una cita `{ horarioId, motivo }` |
| GET | `/citas/mias` | `paciente` | Lista las citas propias |
| GET | `/citas/mi-agenda` | `doctor` | Lista las citas asignadas al doctor autenticado |
| PUT | `/citas/:id` | `paciente` (dueño) | Actualiza el motivo de la cita |
| PUT | `/citas/:id/cancelar` | `paciente` (dueño) | Cancela la cita y libera el horario |
| POST | `/citas/:id/receta` | `doctor` (asignado) | Emite una receta para esa cita `{ medicamentoId, cantidad }` |
| GET | `/citas/:id/recetas` | Autenticado | Lista las recetas emitidas en esa cita |

## Recetas

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/recetas/mias` | `paciente` | Lista las recetas propias |
| GET | `/recetas/paciente/:pacienteId` | `doctor` | Historial de recetas que ese doctor emitió a un paciente |

## Pedidos (farmacia)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/pedidos` | `paciente` | Pide un medicamento no controlado `{ medicamentoId, cantidad }` (descuenta stock) |
| POST | `/pedidos/desde-receta` | `paciente` | Surte un medicamento controlado `{ recetaId }` |
| GET | `/pedidos/mios` | `paciente` | Lista los pedidos propios |
| GET | `/pedidos?estado=` | `admin` | Lista todos los pedidos |
| PUT | `/pedidos/:id` | `admin` | Confirma entrega o cancela `{ estado }` |

## Reportes

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/reportes/resumen` | `admin` | Resumen general del sistema |

## Códigos de error comunes

| Código | Cuándo aparece |
|---|---|
| `400` | Datos faltantes o inválidos (motivo vacío, cantidad ≤ 0, horario/ID mal formado, etc.) |
| `401` | Falta el token (`"Token requerido"`), es inválido/expiró, o las credenciales de login son incorrectas |
| `403` | El rol autenticado no tiene permiso para esa acción (`requireRol`), o el recurso no le pertenece |
| `404` | El recurso solicitado no existe |
| `409` | Conflicto: nombre de usuario ya en uso, horario ya no disponible, receta ya surtida |

Una colección de Postman con pruebas positivas y negativas (incluye escenarios 401/403) está documentada en el informe final (sección 3.2, anexo A7) y en `docs/evidencias/postman/`.
