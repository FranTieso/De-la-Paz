# Backend alternativo de desarrollo (María)

Este backend contiene:

- pruebas de arquitectura
- integración inicial con Firestore
- capa de servicios reescrita
- prototipos de autenticación y validación

Este backend está desarrollado con **Node.js + Express** y expone una API REST para gestionar la aplicación del Club De la Paz. No es la API oficial del proyecto (que está en /api/), pero sirve como base de desarrollo y pruebas

## Requisitos

- Node.js (versión 20.x recomendada)
- npm

## Instalación

Desde la carpeta `backend`, ejecutar:

```
npm install
```

## Scripts

```
npm run dev   # arranca el servidor en modo desarrollo con nodemon
npm start     # arranca el servidor en producción (node src/app.js)
```

## Servidor (por defecto)

La API se ejecuta en:

```
http://localhost:3000
```

## Estructura del proyecto

```
backend/
  ├─ src/
  │   ├─ app.js               # punto de entrada de Express
  │   ├─ routes/              # definición de rutas (ligas, equipos, categorías, usuarios)
  │   ├─ controllers/         # lógica HTTP: valida input y llama a los services
  │   ├─ services/            # lógica de negocio (CRUD en memoria o BD)
  │   └── config/              # configuración (ej: firebase, en el futuro)
  ├─ docs/
  │   └─ API.md               # documentación de los endpoints
  ├─ package.json
  └─ README.md                # este archivo
```

## Endpoints principales

La API expone actualmente los siguientes recursos:

- `/ligas`
- `/equipos`
- `/categorias`
- `/usuarios`

La documentación detallada (modelos, ejemplos de peticiones y respuestas, códigos de estado, etc.) está en:

```
docs/API.md
```

## Variables de entorno (futuro)

La configuración de base de datos (Firebase o MongoDB) se moverá a variables de entorno.

Ejemplo:

```
FIREBASE_PROJECT_ID=...
MONGO_URI=...
```
