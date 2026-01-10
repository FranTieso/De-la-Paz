# Documentación de la API - Asociación de la Paz

## URL Base
```
http://localhost:3001/api
```

## Autenticación (JWT)
**Header**
```
Authorization: Bearer <token>
```

**Obtener token**
- `POST /api/usuarios/login`

## Usuarios

### POST /api/usuarios/login
**Body**
```json
{
  "mail": "usuario@example.com",
  "password": "********"
}
```

### GET /api/usuarios *(auth + admin)*
Listado de usuarios (solo admin).

### GET /api/usuarios/:id *(auth + admin)*
Usuario por id (solo admin).

### PATCH /api/usuarios/:id/contacto *(auth + admin|entrenador|delegado)*
Actualiza solo `mail` y/o `movil`.

### POST /api/usuarios/migracion/roles-equipos *(auth + admin, temporal)*
Migración de roles/equipos.

## Jugadores

### POST /api/jugadores/migracion/equipo-id *(auth + admin, temporal)*
Rellena `EQUIPO_ID` en jugadores a partir de `EQUIPO`.

**Ejemplo**
```
POST /api/jugadores/migracion/equipo-id?dryRun=false
```

**200**
```json
{
  "success": true,
  "result": {
    "total": 43,
    "migrados": 43,
    "sinEquipo": 0,
    "sinMatch": 0,
    "dryRun": false
  }
}
```
