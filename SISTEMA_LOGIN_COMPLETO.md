# 🔐 Sistema de Login Completo con Redirección por Roles

**Fecha**: 3 de Diciembre de 2025
**Estado**: ✅ COMPLETADO

---

## 🎯 Funcionalidades Implementadas

### ✅ 1. Login con Redirección Automática
- **Entrenador** → `entrenador_panel.html`
- **Delegado** → `delegado_panel.html`
- **Árbitro** → `arbitro_panel.html`
- **Administrador** → `usuarios.html`

### ✅ 2. Gestión de Sesión
- Sesión guardada en `localStorage`
- Verificación automática al cargar páginas
- Funciones globales para verificar estado de login

### ✅ 3. Navegación Dinámica
- **Sin login**: Muestra botón "Login"
- **Con login**: Muestra "¡Hola, [Nombre]!" y botón "Cerrar Sesión"
- Funciona en desktop y móvil

### ✅ 4. Protección de Páginas
- Verificación de acceso por rol
- Redirección automática si no tienes permisos
- Mensajes informativos de error

---

## 🔄 Flujo Completo del Sistema

### 1. **Proceso de Login**
```
Usuario ingresa credenciales
    ↓
POST /api/usuarios/login
    ↓
API valida contra Firestore
    ↓
Si es válido:
  - Guarda sesión en localStorage
  - Redirige según rol:
    • Entrenador → entrenador_panel.html
    • Delegado → delegado_panel.html
    • Árbitro → arbitro_panel.html
    • Administrador → usuarios.html
```

### 2. **Verificación de Acceso**
```
Usuario accede a página protegida
    ↓
JavaScript verifica getCurrentUser()
    ↓
Si no hay sesión:
  - Alert: "Debes iniciar sesión"
  - Redirige a index.html
    ↓
Si hay sesión pero rol incorrecto:
  - Alert: "No tienes permisos"
  - Redirige a index.html
    ↓
Si todo OK:
  - Carga contenido de la página
```

### 3. **Navegación Dinámica**
```
Página carga
    ↓
checkUserSession() verifica localStorage
    ↓
Si hay sesión:
  - Oculta botones de login
  - Muestra "¡Hola, [Nombre]!"
  - Añade botón "Cerrar Sesión"
    ↓
Si no hay sesión:
  - Muestra botón "Login"
```

---

## 📝 Archivos Modificados

### 1. **`public/plantilla.js`** - Sistema Principal
**Funciones añadidas:**
- `checkUserSession()` - Verifica sesión al cargar
- `updateNavForLoggedUser()` - Actualiza navegación
- `redirectUserByRole()` - Redirige según rol
- `logout()` - Cierra sesión
- `getCurrentUser()` - Función global
- `isUserLoggedIn()` - Función global

**Cambios en login:**
- Guarda sesión en localStorage
- Redirige automáticamente por rol
- Elimina alert manual

### 2. **`public/entrenador_panel.html`**
**Verificaciones añadidas:**
- Usuario debe estar logueado
- Usuario debe tener rol "entrenador"
- Carga datos del equipo desde la sesión

### 3. **`public/delegado_panel.html`**
**Verificaciones añadidas:**
- Usuario debe estar logueado
- Usuario debe tener rol "delegado"
- Carga datos del equipo desde la sesión

### 4. **`public/arbitro_panel.html`**
**Verificaciones añadidas:**
- Usuario debe estar logueado
- Usuario debe tener rol "arbitro"
- Eliminadas dependencias de Firebase Auth

### 5. **`public/usuarios.html`**
**Verificaciones añadidas:**
- Usuario debe estar logueado
- Usuario debe tener rol "administrador"
- Solo administradores pueden acceder

---

## 🧪 Cómo Probar el Sistema

### 1. **Crear Usuarios de Prueba**
Accede a: `http://localhost:3001/registrouser.html`

Crea usuarios con diferentes roles:
```
Administrador:
- Email: admin@test.com
- Contraseña: 123456
- Rol: Administrador

Entrenador:
- Email: entrenador@test.com
- Contraseña: 123456
- Rol: Entrenador
- Equipo: [Selecciona uno]

Delegado:
- Email: delegado@test.com
- Contraseña: 123456
- Rol: Delegado
- Equipo: [Selecciona uno]

Árbitro:
- Email: arbitro@test.com
- Contraseña: 123456
- Rol: Árbitro
```

### 2. **Probar Login y Redirección**

**Desde cualquier página:**
1. Haz clic en "Login"
2. Ingresa credenciales de administrador
3. **Resultado esperado**: Redirige a `usuarios.html`

**Repite con cada rol:**
- **Entrenador** → `entrenador_panel.html`
- **Delegado** → `delegado_panel.html`
- **Árbitro** → `arbitro_panel.html`

### 3. **Probar Protección de Páginas**

**Sin estar logueado:**
1. Accede directamente a `http://localhost:3001/usuarios.html`
2. **Resultado esperado**: Alert "Debes iniciar sesión" + redirige a index

**Con rol incorrecto:**
1. Haz login como entrenador
2. Accede directamente a `http://localhost:3001/usuarios.html`
3. **Resultado esperado**: Alert "No tienes permisos" + redirige a index

### 4. **Probar Navegación Dinámica**

**Sin login:**
- Verifica que aparece botón "Login" en el nav

**Con login:**
- Verifica que aparece "¡Hola, [Nombre]!"
- Verifica que aparece botón "Cerrar Sesión"
- Haz clic en "Cerrar Sesión" → debe recargar página y mostrar "Login"

---

## 🔧 Funciones JavaScript Disponibles

### Funciones Globales (disponibles en todas las páginas)

```javascript
// Obtener usuario actual
const usuario = getCurrentUser();
// Retorna: { id, mail, nombre, apellido1, rol, roles } o null

// Verificar si está logueado
const isLoggedIn = isUserLoggedIn();
// Retorna: true o false

// Cerrar sesión
logoutUser();
// Elimina sesión y recarga página
```

### Estructura del Objeto Usuario
```javascript
{
  id: "doc123",
  mail: "usuario@example.com",
  nombre: "Juan",
  apellido1: "Pérez",
  apellido2: "García",
  rol: "entrenador",
  roles: {
    entrenador: {
      equipo: "Equipo A"
    }
  }
}
```

---

## 🎨 Cambios en la UI

### Navegación Desktop
**Antes del login:**
```
[Logo] [Equipos] [Categorías] [Usuarios] [Login]
```

**Después del login:**
```
[Logo] [Equipos] [Categorías] [Usuarios] [¡Hola, Juan!] [Cerrar Sesión]
```

### Navegación Móvil
**Antes del login:**
- Menú hamburguesa con botón "Login"

**Después del login:**
- Menú hamburguesa con "¡Hola, Juan!" y botón "Cerrar Sesión"

---

## ⚠️ Seguridad Actual

### ✅ Implementado
- Validación de credenciales en backend
- Verificación de roles en frontend
- Protección de páginas sensibles
- Gestión de sesión local

### ⚠️ Pendiente para Producción
- **Cifrado de contraseñas** (bcrypt)
- **JWT tokens** en lugar de localStorage
- **Middleware de autenticación** en backend
- **Rate limiting** en login
- **HTTPS** obligatorio
- **Expiración de sesiones**

---

## 🚀 Próximos Pasos Recomendados

### Corto Plazo
- [ ] Implementar bcrypt para contraseñas
- [ ] Añadir JWT para tokens seguros
- [ ] Middleware de autenticación en API
- [ ] Expiración automática de sesiones

### Medio Plazo
- [ ] Recuperación de contraseña
- [ ] Cambio de contraseña desde el panel
- [ ] Historial de sesiones
- [ ] Notificaciones de login

### Largo Plazo
- [ ] Autenticación de dos factores
- [ ] Roles granulares con permisos específicos
- [ ] Auditoría de accesos
- [ ] Single Sign-On (SSO)

---

## ✅ Resultado Final

El sistema ahora proporciona:

### 🔐 **Autenticación Completa**
- Login funcional sin Firebase Auth
- Redirección automática por roles
- Gestión de sesión persistente

### 🛡️ **Seguridad por Roles**
- Páginas protegidas por rol
- Verificación automática de permisos
- Mensajes informativos de error

### 🎨 **UI Dinámica**
- Navegación que cambia según estado de login
- Botones contextuales (Login/Logout)
- Experiencia fluida en desktop y móvil

### 📱 **Experiencia de Usuario**
- Redirección inteligente
- Mensajes claros de estado
- Navegación intuitiva

---

**¡El sistema de login está completamente funcional!** 🎉

**Pruébalo creando usuarios y haciendo login desde cualquier página**

---

**Última actualización**: 3 de Diciembre de 2025