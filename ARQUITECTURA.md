# 🏗️ Arquitectura de la API - Asociación de la Paz

## 📐 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE (Browser)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ index.   │  │ equipos. │  │ usuarios.│  │  test-   │       │
│  │  html    │  │   html   │  │   html   │  │ api.html │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │             │              │
│       └─────────────┴──────────────┴─────────────┘              │
│                          │                                       │
│                    [HTTP Requests]                               │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVIDOR EXPRESS (Node.js)                    │
│                         server.js                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Middlewares                             │  │
│  │  • express.static('public')  → Archivos estáticos         │  │
│  │  • express.json()            → Parse JSON                 │  │
│  │  • Logging                   → Registra peticiones        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                           │                                      │
│                           ▼                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    API Routes                              │  │
│  │                  /api/routes/index.js                      │  │
│  │                                                            │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │  │
│  │  │ usuarios │  │ equipos  │  │categorias│  │  ligas   │ │  │
│  │  │   .js    │  │   .js    │  │   .js    │  │   .js    │ │  │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │  │
│  └───────┼─────────────┼─────────────┼─────────────┼────────┘  │
│          │             │             │             │            │
│          ▼             ▼             ▼             ▼            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Controllers                             │  │
│  │                  /api/controllers/                         │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   usuarios   │  │   equipos    │  │  categorias  │   │  │
│  │  │ Controller   │  │  Controller  │  │  Controller  │   │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │  │
│  │         │                 │                  │            │  │
│  │  ┌──────────────┐  ┌──────────────────────────────────┐ │  │
│  │  │    ligas     │  │      Middlewares                 │ │  │
│  │  │  Controller  │  │  • validator.js                  │ │  │
│  │  └──────┬───────┘  │  • errorHandler.js               │ │  │
│  │         │          └──────────────────────────────────┘ │  │
│  └─────────┼──────────────────────────────────────────────┘  │
│            │                                                   │
│            ▼                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                Firebase Configuration                      │  │
│  │                  /api/config/firebase.js                   │  │
│  │                                                            │  │
│  │  • admin.initializeApp()                                  │  │
│  │  • db = admin.firestore()                                 │  │
│  │  • auth = admin.auth()                                    │  │
│  └────────────────────────┬──────────────────────────────────┘  │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE (Cloud)                            │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │   Firestore DB   │              │  Firebase Auth   │         │
│  │                  │              │                  │         │
│  │  • USUARIOS      │              │  • User Auth     │         │
│  │  • EQUIPOS       │              │  • Email/Pass    │         │
│  │  • CATEGORIAS    │              │  • User Mgmt     │         │
│  │  • LIGAS         │              │                  │         │
│  └──────────────────┘              └──────────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de una Petición

### Ejemplo: Crear un Equipo

```
1. CLIENTE
   ↓
   fetch('/api/equipos', {
     method: 'POST',
     body: JSON.stringify({ EQUIPO: 'Real Madrid', CATEGORIA_ID: 'cat123' })
   })

2. SERVIDOR EXPRESS
   ↓
   • Recibe la petición en el puerto 3001
   • Middleware express.json() parsea el body
   • Middleware de logging registra la petición

3. ROUTES
   ↓
   • /api/routes/index.js recibe la petición
   • Redirige a /api/routes/equipos.js
   • Identifica que es POST /equipos
   • Llama a equiposController.createEquipo()

4. CONTROLLER
   ↓
   • Valida campos obligatorios (EQUIPO, CATEGORIA_ID)
   • Sanitiza los datos
   • Verifica que la categoría existe en Firestore
   • Verifica que no haya duplicados
   • Prepara los datos para guardar

5. FIREBASE
   ↓
   • Controller llama a db.collection('EQUIPOS').add()
   • Firebase guarda el documento
   • Retorna el ID del nuevo documento

6. RESPUESTA
   ↓
   • Controller formatea la respuesta
   • Retorna status 201 con el nuevo equipo
   • Si hay error, errorHandler lo captura
   • Cliente recibe la respuesta JSON
```

---

## 📦 Patrón MVC Aplicado

### Model (Modelo)
```
Firebase Firestore + Firebase Auth
├── Colecciones:
│   ├── USUARIOS
│   ├── EQUIPOS
│   ├── CATEGORIAS
│   └── LIGAS
└── Autenticación:
    └── Firebase Auth
```

### View (Vista)
```
Frontend (HTML + CSS + JavaScript)
├── Páginas HTML
├── Estilos (TailwindCSS)
└── JavaScript (fetch API)
```

### Controller (Controlador)
```
API Controllers
├── usuariosController.js
├── equiposController.js
├── categoriasController.js
└── ligasController.js
```

---

## 🔌 Capas de la Aplicación

```
┌─────────────────────────────────────┐
│     Capa de Presentación            │  ← HTML, CSS, JavaScript
│     (Frontend)                       │
└──────────────┬──────────────────────┘
               │ HTTP/JSON
┌──────────────▼──────────────────────┐
│     Capa de API                      │  ← Express Routes
│     (Routing)                        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Capa de Lógica de Negocio       │  ← Controllers
│     (Business Logic)                 │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Capa de Acceso a Datos          │  ← Firebase Config
│     (Data Access)                    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Capa de Datos                    │  ← Firestore + Auth
│     (Database)                       │
└─────────────────────────────────────┘
```

---

## 🛡️ Middlewares

### Middleware Pipeline

```
Request
  │
  ├─► express.static()      → Sirve archivos estáticos
  │
  ├─► express.json()        → Parsea JSON del body
  │
  ├─► Logging Middleware    → Registra la petición
  │
  ├─► Routes                → Enruta a controller
  │
  ├─► Controller            → Ejecuta lógica
  │
  └─► errorHandler()        → Captura errores
      │
      ▼
    Response
```

---

## 📁 Organización de Archivos

```
de-la-paz/
│
├── api/                          ← Backend (API)
│   ├── config/                   ← Configuraciones
│   │   └── firebase.js
│   ├── controllers/              ← Lógica de negocio
│   │   ├── usuariosController.js
│   │   ├── equiposController.js
│   │   ├── categoriasController.js
│   │   └── ligasController.js
│   ├── middlewares/              ← Funciones intermedias
│   │   ├── errorHandler.js
│   │   └── validator.js
│   ├── routes/                   ← Definición de rutas
│   │   ├── index.js
│   │   ├── usuarios.js
│   │   ├── equipos.js
│   │   ├── categorias.js
│   │   └── ligas.js
│   └── utils/                    ← Utilidades
│       └── apiHelper.js
│
├── public/                       ← Frontend (estáticos)
│   ├── js/
│   │   └── api-client.js        ← Cliente API
│   ├── images/
│   ├── *.html                    ← Páginas
│   └── style.css
│
├── scripts/                      ← Scripts de utilidad
│   └── test-connection.js
│
├── server.js                     ← Punto de entrada
├── package.json                  ← Dependencias
└── firebase-adminsdk.json        ← Credenciales
```

---

## 🔐 Flujo de Seguridad

```
┌─────────────────────────────────────────────────────────────┐
│                         Cliente                              │
│  • No tiene acceso directo a Firebase                       │
│  • Solo puede hacer peticiones HTTP a la API               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Servidor API                            │
│  • Valida todos los datos de entrada                        │
│  • Sanitiza strings                                         │
│  • Verifica permisos (futuro: JWT)                          │
│  • Maneja errores de forma segura                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       Firebase                               │
│  • Credenciales solo en el servidor                         │
│  • Reglas de seguridad de Firestore                         │
│  • Firebase Auth para autenticación                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Escalabilidad

### Actual
```
Cliente → Express → Firebase
```

### Futuro Posible
```
Cliente → Load Balancer → Express (múltiples instancias)
                              ↓
                          Redis Cache
                              ↓
                          Firebase
```

---

## 📊 Ventajas de esta Arquitectura

### ✅ Separación de Responsabilidades
- Cada capa tiene una función específica
- Fácil de mantener y debuggear

### ✅ Modularidad
- Componentes independientes
- Fácil de extender y modificar

### ✅ Reutilización
- Controllers reutilizables
- Middlewares componibles

### ✅ Testabilidad
- Cada capa se puede testear independientemente
- Fácil de mockear dependencias

### ✅ Seguridad
- Credenciales en el servidor
- Validación centralizada
- Control de acceso

### ✅ Escalabilidad
- Fácil de escalar horizontalmente
- Posibilidad de añadir caché
- Posibilidad de añadir load balancer

---

## 🎯 Principios Aplicados

### SOLID
- **S**ingle Responsibility: Cada controller/route tiene una responsabilidad
- **O**pen/Closed: Fácil de extender sin modificar código existente
- **L**iskov Substitution: Middlewares intercambiables
- **I**nterface Segregation: APIs específicas por recurso
- **D**ependency Inversion: Controllers dependen de abstracciones (Firebase)

### DRY (Don't Repeat Yourself)
- Lógica centralizada en controllers
- Validaciones reutilizables
- Error handling centralizado

### KISS (Keep It Simple, Stupid)
- Estructura clara y simple
- Código fácil de entender
- Documentación completa

---

## 🔄 Ciclo de Vida de una Petición

```
1. Cliente envía petición HTTP
   ↓
2. Express recibe en el puerto 3001
   ↓
3. Middlewares procesan la petición
   ↓
4. Router identifica la ruta
   ↓
5. Controller ejecuta la lógica
   ↓
6. Se accede a Firebase si es necesario
   ↓
7. Controller formatea la respuesta
   ↓
8. Middlewares procesan la respuesta
   ↓
9. Cliente recibe la respuesta JSON
```

---

**Esta arquitectura proporciona una base sólida, escalable y mantenible para tu aplicación** 🏗️
