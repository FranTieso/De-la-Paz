# Documentación de la API - Asociación de la Paz

## URL Base
```
http://localhost:3001/api
```

## Estructura de la API

La API está organizada en módulos RESTful para cada recurso:

- `/api/usuarios` - Gestión de usuarios
- `/api/equipos` - Gestión de equipos
- `/api/categorias` - Gestión de categorías
- `/api/ligas` - Gestión de ligas

---

## 🔐 Usuarios

### GET /api/usuarios
Obtiene todos los usuarios registrados.

**Respuesta exitosa (200):**
```json
[
  {
    "id": "uid123",
    "mail": "usuario@example.com",
    "nombre": "Juan",
    "apellido1": "Pérez",
    "apellido2": "García",
    "numeroDocumento": "12345678A",
    "movil": "600123456",
    "roles": {
      "entrenador": {
        "equipo": "Equipo A"
      }
    }
  }
]
```

### GET /api/usuarios/:id
Obtiene un usuario específico por su ID.

**Parámetros:**
- `id` (string) - UID del usuario

**Respuesta exitosa (200):**
```json
{
  "id": "uid123",
  "mail": "usuario@example.com",
  "nombre": "Juan"
}
```

**Errores:**
- `404` - Usuario no encontrado

### POST /api/usuarios
Crea un nuevo usuario en Firebase Auth y Firestore.

**Body:**
```json
{
  "mail": "nuevo@example.com",
  "password": "contraseña123",
  "nombre": "María",
  "apellido1": "López",
  "apellido2": "Martínez",
  "numeroDocumento": "87654321B",
  "movil": "600987654",
  "roles": {
    "delegado": {
      "equipo": "Equipo B"
    }
  }
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Usuario creado con éxito",
  "uid": "newuid456"
}
```

**Errores:**
- `400` - Datos inválidos
- `409` - Email o documento ya existe

### PUT /api/usuarios/:id
Actualiza los datos de un usuario existente.

**Parámetros:**
- `id` (string) - UID del usuario

**Body:**
```json
{
  "movil": "611222333",
  "roles": {
    "entrenador": {
      "equipo": "Equipo C"
    }
  }
}
```

**Respuesta exitosa (200):**
```json
{
  "message": "Usuario actualizado con éxito",
  "id": "uid123"
}
```

### DELETE /api/usuarios/:id
Elimina un usuario de Firebase Auth y Firestore.

**Parámetros:**
- `id` (string) - UID del usuario

**Respuesta exitosa (200):**
```json
{
  "message": "Usuario eliminado con éxito"
}
```

---

## ⚽ Equipos

### GET /api/equipos
Obtiene todos los equipos.

**Respuesta exitosa (200):**
```json
[
  {
    "id": "equipo1",
    "EQUIPO": "Real Madrid CF",
    "CATEGORIA": "Senior",
    "TIPO": "Masculino"
  }
]
```

### GET /api/equipos/:id
Obtiene un equipo específico por su ID.

**Parámetros:**
- `id` (string) - ID del equipo

### GET /api/equipos/categoria/:categoria
Obtiene todos los equipos de una categoría específica.

**Parámetros:**
- `categoria` (string) - Nombre de la categoría

**Ejemplo:**
```
GET /api/equipos/categoria/Senior
```

### POST /api/equipos
Crea un nuevo equipo.

**Body:**
```json
{
  "EQUIPO": "FC Barcelona",
  "CATEGORIA_ID": "cat123"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Equipo creado con éxito",
  "id": "equipo2",
  "EQUIPO": "FC Barcelona",
  "CATEGORIA": "Senior",
  "TIPO": "Masculino"
}
```

**Errores:**
- `400` - Categoría no existe
- `409` - Equipo duplicado en la categoría

### PUT /api/equipos/:id
Actualiza un equipo existente.

### DELETE /api/equipos/:id
Elimina un equipo.

---

## 📂 Categorías

### GET /api/categorias
Obtiene todas las categorías.

**Respuesta exitosa (200):**
```json
[
  {
    "id": "cat1",
    "CATEGORIA": "Senior",
    "TIPO": "Masculino"
  }
]
```

### GET /api/categorias/:id
Obtiene una categoría específica.

### POST /api/categorias
Crea una nueva categoría.

**Body:**
```json
{
  "CATEGORIA": "Juvenil",
  "TIPO": "Femenino"
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Categoría creada con éxito",
  "id": "cat2",
  "CATEGORIA": "Juvenil",
  "TIPO": "Femenino"
}
```

### PUT /api/categorias/:id
Actualiza una categoría.

### DELETE /api/categorias/:id
Elimina una categoría.

**Errores:**
- `409` - No se puede eliminar si tiene equipos asociados

---

## 🏆 Ligas

### GET /api/ligas
Obtiene todas las ligas.

**Respuesta exitosa (200):**
```json
[
  {
    "id": "liga1",
    "NOMBRE": "Liga Regional 2024",
    "TEMPORADA": "2024-2025",
    "NUM_EQUIPOS": 12
  }
]
```

### GET /api/ligas/:id
Obtiene una liga específica.

### POST /api/ligas
Crea una nueva liga.

**Body:**
```json
{
  "NOMBRE": "Copa de Verano",
  "TEMPORADA": "2024",
  "NUM_EQUIPOS": 8
}
```

**Respuesta exitosa (201):**
```json
{
  "message": "Liga creada con éxito",
  "id": "liga2",
  "NOMBRE": "Copa de Verano",
  "TEMPORADA": "2024",
  "NUM_EQUIPOS": 8
}
```

### PUT /api/ligas/:id
Actualiza una liga.

### DELETE /api/ligas/:id
Elimina una liga.

---

## 🔧 Códigos de Estado HTTP

- `200` - OK - Operación exitosa
- `201` - Created - Recurso creado exitosamente
- `400` - Bad Request - Datos inválidos o faltantes
- `404` - Not Found - Recurso no encontrado
- `409` - Conflict - Conflicto (duplicado)
- `500` - Internal Server Error - Error del servidor

---

## 📝 Formato de Errores

Todos los errores devuelven un objeto JSON con el siguiente formato:

```json
{
  "error": "Descripción del error"
}
```

---

## 🚀 Cómo Usar la API

### Desde JavaScript (Frontend)

```javascript
// Obtener todos los equipos
const response = await fetch('/api/equipos');
const equipos = await response.json();

// Crear un nuevo equipo
const response = await fetch('/api/equipos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    EQUIPO: 'Nuevo Equipo',
    CATEGORIA_ID: 'cat123'
  })
});
const resultado = await response.json();

// Actualizar un equipo
const response = await fetch('/api/equipos/equipo123', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    EQUIPO: 'Nombre Actualizado'
  })
});

// Eliminar un equipo
const response = await fetch('/api/equipos/equipo123', {
  method: 'DELETE'
});
```

---

## 🔍 Testing

Puedes probar la API usando:

1. **Navegador** - Para peticiones GET:
   ```
   http://localhost:3001/api/equipos
   ```

2. **Postman** o **Insomnia** - Para todas las operaciones

3. **cURL** - Desde la terminal:
   ```bash
   # GET
   curl http://localhost:3001/api/equipos

   # POST
   curl -X POST http://localhost:3001/api/equipos \
     -H "Content-Type: application/json" \
     -d '{"EQUIPO":"Nuevo Equipo","CATEGORIA_ID":"cat123"}'
   ```
