# 🏆 De-la-Paz - Portal Deportivo
Trabajo TFG Raúl, María, Fran

> **✨ Nueva API RESTful Implementada** - Tu proyecto ahora cuenta con una API profesional, modular y escalable

## 🚀 Portal Deportivo - Asociación de la Paz

Aplicación web para la gestión de ligas deportivas, equipos, usuarios y categorías.

## 📋 Características

- ✅ Gestión completa de usuarios (entrenadores, delegados, administradores)
- ✅ Registro y administración de equipos
- ✅ Organización por categorías y tipos
- ✅ Gestión de ligas y temporadas
- ✅ Visualización de clasificaciones y resultados
- ✅ API RESTful completa

## 🛠️ Tecnologías

- **Backend**: Node.js + Express
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Frontend**: HTML5, TailwindCSS, JavaScript
- **Arquitectura**: API RESTful con patrón MVC

## 📁 Estructura del Proyecto

```
de-la-paz/
├── api/                    # Backend API
│   ├── config/            # Configuración (Firebase)
│   ├── controllers/       # Lógica de negocio
│   ├── middlewares/       # Validación y manejo de errores
│   ├── routes/            # Definición de endpoints
│   ├── services/          # Servicios de negocio
│   └── utils/             # Utilidades y helpers
├── public/                # Frontend (archivos estáticos)
│   ├── js/                # JavaScript del cliente
│   └── images/            # Recursos gráficos
├── server.js              # Servidor Express
├── package.json           # Dependencias
└── API_DOCUMENTATION.md   # Documentación completa de la API
```

## 🚀 Inicio Rápido

### 1. Instala las dependencias
```bash
npm install
```

### 2. Verifica la conexión con Firebase
```bash
npm run test:connection
```

### 3. Inicia el servidor
```bash
npm start
```

### 4. Accede a la aplicación
- **Frontend**: http://localhost:3001
- **API**: http://localhost:3001/api
- **Test API**: http://localhost:3001/test-api.html

### 📖 Primera vez aquí?
👉 Lee **[EMPEZAR_AQUI.md](./EMPEZAR_AQUI.md)** para una guía completa

## 🔌 API Endpoints

### Usuarios
- `GET /api/usuarios` - Obtener todos los usuarios
- `GET /api/usuarios/:id` - Obtener un usuario
- `POST /api/usuarios` - Crear usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Equipos
- `GET /api/equipos` - Obtener todos los equipos
- `GET /api/equipos/:id` - Obtener un equipo
- `GET /api/equipos/categoria/:categoria` - Equipos por categoría
- `POST /api/equipos` - Crear equipo
- `PUT /api/equipos/:id` - Actualizar equipo
- `DELETE /api/equipos/:id` - Eliminar equipo

### Categorías
- `GET /api/categorias` - Obtener todas las categorías
- `GET /api/categorias/:id` - Obtener una categoría
- `POST /api/categorias` - Crear categoría
- `PUT /api/categorias/:id` - Actualizar categoría
- `DELETE /api/categorias/:id` - Eliminar categoría

### Ligas
- `GET /api/ligas` - Obtener todas las ligas
- `GET /api/ligas/:id` - Obtener una liga
- `POST /api/ligas` - Crear liga
- `PUT /api/ligas/:id` - Actualizar liga
- `DELETE /api/ligas/:id` - Eliminar liga

### 📚 Documentación Completa

| Documento | Descripción |
|-----------|-------------|
| **[EMPEZAR_AQUI.md](./EMPEZAR_AQUI.md)** | 👋 Guía de bienvenida - Empieza aquí |
| **[GUIA_RAPIDA.md](./GUIA_RAPIDA.md)** | ⚡ Guía rápida de uso |
| **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | 📖 Documentación completa de endpoints |
| **[MIGRACION.md](./MIGRACION.md)** | 🔄 Cómo migrar de Firebase a API |
| **[ARQUITECTURA.md](./ARQUITECTURA.md)** | 🏗️ Arquitectura técnica |
| **[RESUMEN_API.md](./RESUMEN_API.md)** | 📊 Resumen completo del proyecto |
| **[CHECKLIST.md](./CHECKLIST.md)** | ✅ Lista de verificación |

## 🧪 Probar la API

Abre en tu navegador:
```
http://localhost:3001/test-api.html
```

O usa herramientas como Postman, Insomnia o cURL.

## 📝 Ejemplo de Uso

```javascript
// Obtener todos los equipos
const response = await fetch('/api/equipos');
const equipos = await response.json();

// Crear un nuevo equipo
const nuevoEquipo = await fetch('/api/equipos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    EQUIPO: 'Nuevo Equipo',
    CATEGORIA_ID: 'cat123'
  })
});
```

## 👥 Autores

- Raúl
- María
- Fran

## 📄 Licencia

ISC
