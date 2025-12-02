# 🔄 Guía de Migración - De Firebase Directo a API

Esta guía te ayudará a migrar tu código frontend de usar Firebase directamente a usar la nueva API.

## 📋 Cambios Principales

### Antes (Firebase Directo)
```javascript
// Código antiguo - acceso directo a Firestore
const db = firebase.firestore();
const equiposSnapshot = await db.collection('EQUIPOS').get();
const equipos = equiposSnapshot.docs.map(doc => doc.data());
```

### Después (API)
```javascript
// Código nuevo - usando la API
const response = await fetch('/api/equipos');
const equipos = await response.json();
```

---

## 🔧 Ejemplos de Migración

### 1. Obtener Datos (GET)

#### ❌ Antes
```javascript
document.addEventListener('firebaseReady', async () => {
  const db = firebase.firestore();
  const querySnapshot = await db.collection('USUARIOS').get();
  const users = querySnapshot.docs.map(doc => doc.data());
  // Procesar usuarios...
});
```

#### ✅ Después
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/api/usuarios');
    const users = await response.json();
    // Procesar usuarios...
  } catch (error) {
    console.error('Error:', error);
  }
});
```

### 2. Crear Datos (POST)

#### ❌ Antes
```javascript
const nuevoEquipo = {
  EQUIPO: 'Nombre del Equipo',
  CATEGORIA: 'Senior'
};
await db.collection('EQUIPOS').add(nuevoEquipo);
```

#### ✅ Después
```javascript
const nuevoEquipo = {
  EQUIPO: 'Nombre del Equipo',
  CATEGORIA_ID: 'cat123'
};

const response = await fetch('/api/equipos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(nuevoEquipo)
});

const resultado = await response.json();
```

### 3. Actualizar Datos (PUT)

#### ❌ Antes
```javascript
await db.collection('EQUIPOS').doc(equipoId).update({
  EQUIPO: 'Nuevo Nombre'
});
```

#### ✅ Después
```javascript
await fetch(`/api/equipos/${equipoId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    EQUIPO: 'Nuevo Nombre'
  })
});
```

### 4. Eliminar Datos (DELETE)

#### ❌ Antes
```javascript
await db.collection('EQUIPOS').doc(equipoId).delete();
```

#### ✅ Después
```javascript
await fetch(`/api/equipos/${equipoId}`, {
  method: 'DELETE'
});
```

---

## 📦 Usando el Cliente API Helper

Para simplificar aún más, puedes usar el archivo `api-client.js`:

### 1. Incluir el script en tu HTML
```html
<script src="/js/api-client.js"></script>
```

### 2. Usar las funciones helper

```javascript
// Obtener todos los equipos
const equipos = await Equipos.getAll();

// Crear un equipo
const nuevoEquipo = await Equipos.create({
  EQUIPO: 'Nombre',
  CATEGORIA_ID: 'cat123'
});

// Actualizar un equipo
await Equipos.update('equipo123', {
  EQUIPO: 'Nuevo Nombre'
});

// Eliminar un equipo
await Equipos.delete('equipo123');
```

---

## 🔄 Migración Paso a Paso

### Archivo: `usuarios.html`

#### Paso 1: Cambiar el evento
```javascript
// Antes
document.addEventListener('firebaseReady', async () => {

// Después
document.addEventListener('DOMContentLoaded', async () => {
```

#### Paso 2: Reemplazar la consulta
```javascript
// Antes
const db = firebase.firestore();
const querySnapshot = await db.collection('USUARIOS').get();
const users = querySnapshot.docs.map(doc => doc.data());

// Después
const response = await fetch('/api/usuarios');
const users = await response.json();
```

#### Paso 3: Eliminar imports de Firebase (opcional)
```html
<!-- Ya no necesitas estos scripts si solo usas la API -->
<!-- <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script> -->
<!-- <script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script> -->
```

---

## ✅ Ventajas de Usar la API

1. **Seguridad**: Las credenciales de Firebase están en el servidor
2. **Validación**: Todos los datos se validan antes de guardar
3. **Consistencia**: Lógica de negocio centralizada
4. **Mantenibilidad**: Más fácil de actualizar y mantener
5. **Escalabilidad**: Puedes añadir autenticación, caché, etc.

---

## 🎯 Archivos a Migrar

Estos archivos actualmente usan Firebase directamente:

- ✅ `equipos.html` - Ya migrado (usa `/api/equipos`)
- ⚠️ `usuarios.html` - Usa Firebase directo
- ⚠️ `registrouser.html` - Probablemente usa Firebase
- ⚠️ `registroequipos.html` - Probablemente usa Firebase
- ⚠️ `creaCategoria.html` - Probablemente usa Firebase
- ⚠️ `creaLigas.html` - Probablemente usa Firebase

---

## 🔍 Checklist de Migración

Para cada archivo HTML:

- [ ] Cambiar `firebaseReady` por `DOMContentLoaded`
- [ ] Reemplazar `db.collection().get()` por `fetch('/api/...')`
- [ ] Reemplazar `db.collection().add()` por `fetch('/api/...', {method: 'POST'})`
- [ ] Reemplazar `db.collection().doc().update()` por `fetch('/api/.../id', {method: 'PUT'})`
- [ ] Reemplazar `db.collection().doc().delete()` por `fetch('/api/.../id', {method: 'DELETE'})`
- [ ] Añadir manejo de errores con try/catch
- [ ] Probar todas las funcionalidades

---

## 💡 Consejos

1. **Migra un archivo a la vez** - Más fácil de debuggear
2. **Prueba después de cada cambio** - Asegúrate que funciona
3. **Mantén backups** - Guarda copias de los archivos originales
4. **Usa el cliente helper** - Simplifica el código
5. **Revisa la consola** - Los errores te guiarán

---

## 🆘 Problemas Comunes

### Error: "Failed to fetch"
- Verifica que el servidor esté corriendo (`npm start`)
- Revisa la URL del endpoint

### Error 404
- Verifica que la ruta sea correcta
- Revisa que el ID exista

### Error 400
- Faltan campos obligatorios
- Revisa el formato de los datos

### Error 500
- Error en el servidor
- Revisa los logs del servidor en la consola
