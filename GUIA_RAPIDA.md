# 🚀 Guía Rápida - API de la Paz

## Inicio Rápido

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar el servidor
```bash
npm start
```

### 3. Acceder a la aplicación
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3001/api
- **Test API**: http://localhost:3001/test-api.html

---

## 📊 Estructura de la API

```
/api
├── /usuarios
│   ├── GET    /              → Listar todos
│   ├── GET    /:id           → Obtener uno
│   ├── POST   /              → Crear nuevo
│   ├── PUT    /:id           → Actualizar
│   └── DELETE /:id           → Eliminar
│
├── /equipos
│   ├── GET    /              → Listar todos
│   ├── GET    /:id           → Obtener uno
│   ├── GET    /categoria/:cat → Por categoría
│   ├── POST   /              → Crear nuevo
│   ├── PUT    /:id           → Actualizar
│   └── DELETE /:id           → Eliminar
│
├── /categorias
│   ├── GET    /              → Listar todas
│   ├── GET    /:id           → Obtener una
│   ├── POST   /              → Crear nueva
│   ├── PUT    /:id           → Actualizar
│   └── DELETE /:id           → Eliminar
│
└── /ligas
    ├── GET    /              → Listar todas
    ├── GET    /:id           → Obtener una
    ├── POST   /              → Crear nueva
    ├── PUT    /:id           → Actualizar
    └── DELETE /:id           → Eliminar
```

---

## 💡 Ejemplos Rápidos

### Crear un Usuario
```javascript
fetch('/api/usuarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mail: 'usuario@example.com',
    password: 'password123',
    nombre: 'Juan',
    apellido1: 'Pérez',
    numeroDocumento: '12345678A',
    movil: '600123456'
  })
});
```

### Crear un Equipo
```javascript
fetch('/api/equipos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    EQUIPO: 'Real Madrid CF',
    CATEGORIA_ID: 'cat123'
  })
});
```

### Crear una Categoría
```javascript
fetch('/api/categorias', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    CATEGORIA: 'Senior',
    TIPO: 'Masculino'
  })
});
```

### Crear una Liga
```javascript
fetch('/api/ligas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    NOMBRE: 'Liga Regional 2024',
    TEMPORADA: '2024-2025',
    NUM_EQUIPOS: 12
  })
});
```

---

## 🔧 Arquitectura del Código

### Flujo de una Petición
```
Cliente
  ↓
Express (server.js)
  ↓
Middleware (logging, json parser)
  ↓
Routes (/api/routes/*.js)
  ↓
Controller (/api/controllers/*.js)
  ↓
Firebase (Firestore/Auth)
  ↓
Response al Cliente
```

### Archivos Principales

| Archivo | Propósito |
|---------|-----------|
| `server.js` | Punto de entrada, configura Express |
| `api/routes/index.js` | Enrutador principal de la API |
| `api/controllers/*.js` | Lógica de negocio |
| `api/config/firebase.js` | Conexión con Firebase |
| `api/middlewares/errorHandler.js` | Manejo de errores |

---

## 🎯 Casos de Uso Comunes

### 1. Registrar un nuevo equipo
1. Primero, obtén las categorías disponibles:
   ```
   GET /api/categorias
   ```
2. Luego, crea el equipo con el ID de la categoría:
   ```
   POST /api/equipos
   Body: { EQUIPO: "Nombre", CATEGORIA_ID: "id_categoria" }
   ```

### 2. Ver todos los equipos de una categoría
```
GET /api/equipos/categoria/Senior
```

### 3. Actualizar datos de un usuario
```
PUT /api/usuarios/:uid
Body: { movil: "611222333" }
```

---

## ⚠️ Errores Comunes

### Error 400 - Bad Request
- Faltan campos obligatorios
- Datos en formato incorrecto

### Error 404 - Not Found
- El recurso no existe
- ID incorrecto

### Error 409 - Conflict
- Recurso duplicado (email, documento, nombre de equipo)

### Error 500 - Server Error
- Error en Firebase
- Error de configuración

---

## 🔍 Debugging

### Ver logs del servidor
Los logs aparecen en la consola donde ejecutaste `npm start`:
```
🚀 Servidor escuchando en el puerto 3001
📱 Accede a tu web en http://localhost:3001
🔌 API disponible en http://localhost:3001/api
2024-12-02T10:30:00.000Z - GET /api/equipos
```

### Probar endpoints manualmente
1. Usa el archivo `test-api.html`
2. Usa Postman o Insomnia
3. Usa cURL desde la terminal:
   ```bash
   curl http://localhost:3001/api/equipos
   ```

---

## 📚 Documentación Completa

Para más detalles, consulta:
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Documentación completa de endpoints
- [api/README.md](./api/README.md) - Arquitectura del backend
