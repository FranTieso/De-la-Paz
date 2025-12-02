# API - Asociación de la Paz

Esta carpeta contiene toda la lógica del backend de la aplicación, organizada siguiendo el patrón MVC (Modelo-Vista-Controlador).

## 📁 Estructura

```
api/
├── config/
│   └── firebase.js          # Configuración de Firebase Admin
├── controllers/
│   ├── usuariosController.js    # Lógica de negocio para usuarios
│   ├── equiposController.js     # Lógica de negocio para equipos
│   ├── categoriasController.js  # Lógica de negocio para categorías
│   └── ligasController.js       # Lógica de negocio para ligas
├── middlewares/
│   ├── errorHandler.js      # Manejo centralizado de errores
│   └── validator.js         # Validación de datos
└── routes/
    ├── index.js             # Enrutador principal
    ├── usuarios.js          # Rutas de usuarios
    ├── equipos.js           # Rutas de equipos
    ├── categorias.js        # Rutas de categorías
    └── ligas.js             # Rutas de ligas
```

## 🎯 Arquitectura

### Config
Contiene la configuración de servicios externos (Firebase).

### Controllers
Contienen la lógica de negocio de cada recurso. Cada controller tiene métodos para:
- `get[Recurso]s` - Obtener todos
- `get[Recurso]ById` - Obtener uno por ID
- `create[Recurso]` - Crear nuevo
- `update[Recurso]` - Actualizar existente
- `delete[Recurso]` - Eliminar

### Middlewares
Funciones que se ejecutan antes de los controllers:
- **errorHandler**: Captura y formatea errores
- **validator**: Valida y sanitiza datos de entrada

### Routes
Define los endpoints HTTP y los conecta con los controllers correspondientes.

## 🔄 Flujo de una Petición

```
Cliente → Express → Routes → Controller → Firebase → Controller → Cliente
                       ↓
                  Middlewares
```

1. El cliente hace una petición HTTP
2. Express recibe la petición
3. Los middlewares procesan la petición
4. Las rutas dirigen a un controller
5. El controller ejecuta la lógica de negocio
6. Se interactúa con Firebase (Firestore/Auth)
7. El controller devuelve la respuesta
8. Si hay error, el errorHandler lo captura

## 🚀 Uso

Todos los endpoints están montados bajo `/api`:

```javascript
// En server.js
app.use('/api', apiRoutes);
```

Esto significa que todas las rutas definidas en `api/routes/` son accesibles desde:
- `/api/usuarios`
- `/api/equipos`
- `/api/categorias`
- `/api/ligas`

## 📝 Ejemplo de Extensión

Para añadir un nuevo recurso (ej: "partidos"):

1. Crear `controllers/partidosController.js`
2. Crear `routes/partidos.js`
3. Importar y montar en `routes/index.js`:
   ```javascript
   const partidosRoutes = require('./partidos');
   router.use('/partidos', partidosRoutes);
   ```

## 🔒 Seguridad

- Validación de datos en controllers
- Sanitización de strings
- Manejo seguro de errores (no expone detalles internos)
- Uso de Firebase Admin SDK (servidor)
