# Documentación API REST – Asociación de la Paz

---

## 1. Descripción general
API REST desarrollada con **Node.js + Express**, conectada a **Firebase (Firestore)** mediante Firebase Admin.
Esta API da soporte a la aplicación web de gestión deportiva del proyecto DAW.

Gestiona:
- Usuarios y autenticación
- Ligas, equipos y jugadores
- Partidos, resultados y clasificaciones
- Calendario, campos y mensajes

URL base:
http://localhost:3001/api

---

## 2. Autenticación y seguridad

### Autenticación
- JWT (JSON Web Token)
- Header obligatorio:
Authorization: Bearer <token>

Middleware:
- auth.js

### Roles
- admin
- delegado
- entrenador

El acceso a los endpoints está controlado mediante middleware de permisos.

---

## 3. Endpoints

### Usuarios / Auth
- POST /usuarios/login
- GET /usuarios
- GET /usuarios/:id
- POST /usuarios
- PUT /usuarios/:id
- DELETE /usuarios/:id

### Ligas
- GET /ligas
- GET /ligas/:id
- POST /ligas
- PUT /ligas/:id
- DELETE /ligas/:id

### Equipos
- GET /equipos
- GET /equipos/:id
- POST /equipos
- PUT /equipos/:id
- DELETE /equipos/:id

### Jugadores
- GET /jugadores
- GET /jugadores/:id
- POST /jugadores
- PUT /jugadores/:id
- DELETE /jugadores/:id

### Partidos
- GET /partidos
- GET /partidos/:id
- POST /partidos
- PUT /partidos/:id
- DELETE /partidos/:id

### Resultados
- GET /resultados
- POST /resultados

### Clasificaciones
- GET /clasificaciones

### Calendario
- GET /calendario

### Campos
- GET /campos
- POST /campos

### Mensajes
- GET /mensajes
- POST /mensajes

---

## 4. Middlewares

- auth.js → Verificación de JWT
- permissions.js → Control de roles
- validator.js → Saneado y validación de datos
- errorHandler.js → Gestión centralizada de errores

---

## 5. Códigos de estado HTTP

- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 500 Internal Server Error

---

## 6. Arquitectura Backend

### Estructura de carpetas

api/
├── config/
│   └── firebase.js
├── controllers/
│   ├── usuariosController.js
│   ├── ligasController.js
│   ├── equiposController.js
│   ├── jugadoresController.js
│   ├── partidosController.js
│   ├── resultadosController.js
│   ├── clasificacionesController.js
│   ├── calendarioController.js
│   ├── camposController.js
│   └── mensajesController.js
├── middlewares/
│   ├── auth.js
│   ├── permissions.js
│   ├── validator.js
│   └── errorHandler.js
└── routes/
    └── index.js

---

## 7. Flujo de una petición

Cliente  
→ Router  
→ Middleware de autenticación  
→ Middleware de permisos  
→ Controller  
→ Firestore  
→ Respuesta HTTP

---

## 8. Base de datos

Base de datos:
- Firebase Firestore (NoSQL)

Colecciones:
- usuarios
- ligas
- equipos
- jugadores
- partidos
- resultados
- clasificaciones
- mensajes
- campos

---

## 9. Ventajas de la arquitectura

- Arquitectura modular
- Escalable y mantenible
- Separación clara de responsabilidades
- Preparada para ampliaciones futuras

---

Proyecto DAW – Asociación de la Paz
