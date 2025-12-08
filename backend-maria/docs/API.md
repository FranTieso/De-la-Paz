# API REST – Club De la Paz (versión en memoria)

Base URL (desarrollo): `http://localhost:3000`

Recursos:

- `/ligas`
- `/equipos`
- `/categorias`
- `/usuarios`

Todas las respuestas de error usan el formato:

```json
{ "error": "Mensaje descriptivo del error" }
```

---

---

## Tabla-resumen

````md
## Tabla de endpoints

| Recurso    | Método | Ruta              | Descripción                        | Body requerido      |
| ---------- | ------ | ----------------- | ---------------------------------- | ------------------- |
| Ligas      | GET    | `/ligas`          | Listar todas las ligas             | No                  |
| Ligas      | GET    | `/ligas/:id`      | Obtener una liga por id            | No                  |
| Ligas      | POST   | `/ligas`          | Crear una nueva liga               | Sí (JSON liga)      |
| Ligas      | PUT    | `/ligas/:id`      | Actualizar una liga existente      | Sí (JSON parcial)   |
| Ligas      | DELETE | `/ligas/:id`      | Eliminar una liga                  | No                  |
| Equipos    | GET    | `/equipos`        | Listar todos los equipos           | No                  |
| Equipos    | GET    | `/equipos/:id`    | Obtener un equipo por id           | No                  |
| Equipos    | POST   | `/equipos`        | Crear un nuevo equipo              | Sí (JSON equipo)    |
| Equipos    | PUT    | `/equipos/:id`    | Actualizar un equipo existente     | Sí (JSON parcial)   |
| Equipos    | DELETE | `/equipos/:id`    | Eliminar un equipo                 | No                  |
| Categorías | GET    | `/categorias`     | Listar todas las categorías        | No                  |
| Categorías | GET    | `/categorias/:id` | Obtener una categoría por id       | No                  |
| Categorías | POST   | `/categorias`     | Crear una nueva categoría          | Sí (JSON categoría) |
| Categorías | PUT    | `/categorias/:id` | Actualizar una categoría existente | Sí (JSON parcial)   |
| Categorías | DELETE | `/categorias/:id` | Eliminar una categoría             | No                  |
| Usuarios   | GET    | `/usuarios`       | Listar todos los usuarios          | No                  |
| Usuarios   | GET    | `/usuarios/:id`   | Obtener un usuario por id          | No                  |
| Usuarios   | POST   | `/usuarios`       | Crear un nuevo usuario             | Sí (JSON usuario)   |
| Usuarios   | PUT    | `/usuarios/:id`   | Actualizar un usuario existente    | Sí (JSON parcial)   |
| Usuarios   | DELETE | `/usuarios/:id`   | Eliminar un usuario                | No                  |

## 1. LIGAS

### 1.1. Modelo de datos (actual)

```json
{
  "id": "string", // generado por el servidor
  "nombre": "string", // obligatorio
  "temporada": "string", // opcional (ej: "2024-2025")
  "deporte": "string", // opcional (ej: "fútbol")
  "estado": "string" // opcional (ej: "activa", "finalizada")
}
```
````

### 1.2. Endpoints

#### GET /ligas

Devuelve la lista completa de ligas.

- **200 OK**
  ```json
  [
    {
      "id": "1",
      "nombre": "Liga Benjamín",
      "temporada": "2024-2025",
      "deporte": "fútbol",
      "estado": "activa"
    }
  ]
  ```

---

#### GET /ligas/:id

Devuelve una liga por su `id`.

- **200 OK** → objeto liga
- **404 Not Found** → `{ "error": "Liga no encontrada" }`

---

#### POST /ligas

Crea una nueva liga.

- **Body (JSON)**

  ```json
  {
    "nombre": "Liga Senior Femenina",
    "temporada": "2024-2025",
    "deporte": "baloncesto",
    "estado": "activa"
  }
  ```

- **201 Created** → objeto liga con `id` generado
- **400 Bad Request** → falta `nombre`

---

#### PUT /ligas/:id

Actualiza una liga existente. Solo se modifican los campos enviados en el body.

- **Body (JSON) ejemplo**

  ```json
  {
    "estado": "finalizada"
  }
  ```

- **200 OK** → objeto liga actualizado
- **404 Not Found** → `{ "error": "Liga no encontrada" }`

---

#### DELETE /ligas/:id

Elimina una liga por id.

- **204 No Content** → borrado correcto
- **404 Not Found** → `{ "error": "Liga no encontrada" }`

---

## 2. EQUIPOS

### 2.1. Modelo de datos (actual)

```json
{
  "id": "string", // generado por el servidor
  "nombre": "string", // obligatorio
  "categoria": "string", // opcional (ej: "Benjamín", "Senior")
  "ligaId": "string" // opcional, id de la liga a la que pertenece
}
```

### 2.2. Endpoints

#### GET /equipos

- **200 OK** → array de equipos

---

#### GET /equipos/:id

- **200 OK** → objeto equipo
- **404 Not Found** → `{ "error": "Equipo no encontrado" }`

---

#### POST /equipos

- **Body (JSON)**

  ```json
  {
    "nombre": "Equipo Senior Femenino",
    "categoria": "Senior",
    "ligaId": "1"
  }
  ```

- **201 Created** → objeto equipo creado
- **400 Bad Request** → falta `nombre`

---

#### PUT /equipos/:id

- **Body (JSON)**

  ```json
  {
    "nombre": "Equipo Senior Femenino A"
  }
  ```

- **200 OK** → equipo actualizado
- **404 Not Found** → `{ "error": "Equipo no encontrado" }`

---

#### DELETE /equipos/:id

- **204 No Content**
- **404 Not Found** → `{ "error": "Equipo no encontrado" }`

---

## 3. CATEGORÍAS

### 3.1. Modelo de datos (actual)

```json
{
  "id": "string", // generado por el servidor
  "nombre": "string", // obligatorio (ej: "Infantil", "Juvenil")
  "tipo": "string" // opcional (ej: "Masculino", "Femenino", "Mixto")
}
```

### 3.2. Endpoints

#### GET /categorias

- **200 OK** → array de categorías

---

#### GET /categorias/:id

- **200 OK** → objeto categoría
- **404 Not Found** → `{ "error": "Categoría no encontrada" }`

---

#### POST /categorias

- **Body (JSON)**

  ```json
  {
    "nombre": "Infantil",
    "tipo": "Mixto"
  }
  ```

- **201 Created** → categoría creada
- **400 Bad Request** → falta `nombre`

---

#### PUT /categorias/:id

- **Body (JSON)**

  ```json
  {
    "tipo": "Femenino"
  }
  ```

- **200 OK** → categoría actualizada
- **404 Not Found** → `{ "error": "Categoría no encontrada" }`

---

#### DELETE /categorias/:id

- **204 No Content**
- **404 Not Found** → `{ "error": "Categoría no encontrada" }`

---

## 4. USUARIOS

### 4.1. Modelo de datos (actual)

```json
{
  "id": "string", // generado por el servidor
  "nombre": "string", // obligatorio
  "email": "string", // obligatorio, debe tener formato válido
  "rol": "string", // opcional (ej: "admin", "entrenador", "jugador", "tutor")
  "equipoId": "string" // opcional, id del equipo asociado
}
```

### Validaciones especiales

- `nombre` y `email` son **obligatorios**.
- El `email` debe cumplir el patrón: `algo@algo.algo`  
  Se valida con la expresión regular:

  ```txt
  ^[^\s@]+@[^\s@]+\.[^\s@]+$
  ```

- No se permiten usuarios con **email duplicado**:
  - si se intenta crear otro usuario con el mismo email → **409 Conflict**

---

### 4.2. Endpoints

#### GET /usuarios

- **200 OK** → listado completo

---

#### GET /usuarios/:id

- **200 OK** → usuario encontrado
- **404 Not Found** → `{ "error": "Usuario no encontrado" }`

---

#### POST /usuarios

- **Body (JSON)**

  ```json
  {
    "nombre": "María PC",
    "email": "maria@example.com",
    "rol": "admin",
    "equipoId": "1"
  }
  ```

- **201 Created** → usuario creado
- **400 Bad Request**

  - si falta `nombre` o `email`
  - o si el email no cumple el formato

- **409 Conflict**
  - si ya existe un usuario con el mismo `email`

---

#### PUT /usuarios/:id

- **Body (JSON)** (ejemplo)

  ```json
  {
    "rol": "entrenador"
  }
  ```

- **200 OK** → usuario actualizado
- **404 Not Found** → `{ "error": "Usuario no encontrado" }`

---

#### DELETE /usuarios/:id

- **204 No Content**
- **404 Not Found** → `{ "error": "Usuario no encontrado" }`
