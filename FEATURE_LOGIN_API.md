# 🔐 Sistema de Login con API Propia

**Fecha**: 2 de Diciembre de 2025
**Estado**: ✅ IMPLEMENTADO

---

## 🎯 Funcionalidad Implementada

Se ha creado un sistema de login que **NO usa Firebase Auth**, sino que valida directamente contra el campo `contra` en Firestore a través de nuestra API.

---

## 🔧 Cambios Realizados

### 1. Nuevo Endpoint de Login (api/controllers/usuariosController.js)

**POST /api/usuarios/login**

**Recibe:**
```json
{
  "mail": "usuario@example.com",
  "password": "123456"
}
```

**Proceso:**
1. Busca el usuario por `mail` en Firestore (colección USUARIOS)
2. Compara el `password` recibido con el campo `contra` del usuario
3. Si coincide → extrae el rol y devuelve los datos
4. Si no coincide → error 401

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "usuario": {
    "id": "uid123",
    "mail": "usuario@example.com",
    "nombre": "Juan",
    "apellido1": "Pérez",
    "apellido2": "García",
    "rol": "entrenador",
    "roles": {
      "entrenador": {
        "equipo": "Equipo A"
      }
    }
  }
}
```

**Respuesta de error (401):**
```json
{
  "success": false,
  "error": "Credenciales incorrectas."
}
```

---

### 2. Ruta Añadida (api/routes/usuarios.js)

```javascript
// POST /api/usuarios/login - Login de usuario
router.post('/login', loginUsuario);
```

**Importante:** Esta ruta está **antes** de `POST /` para evitar conflictos.

---

### 3. Modal de Login Actualizado (public/plantilla.js)

**Antes:**
- Usaba Firebase Auth directamente
- `firebase.auth().signInWithEmailAndPassword()`

**Después:**
- Usa nuestra API
- `fetch('/api/usuarios/login', { method: 'POST' })`
- Muestra alert con el rol del usuario

**Código:**
```javascript
const response = await fetch('/api/usuarios/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ mail: email, password: password })
});

const result = await response.json();

if (result.success) {
  alert(`¡Bienvenido ${result.usuario.nombre}!\n\nTu rol es: ${result.usuario.rol}`);
  // Cerrar modal y limpiar formulario
}
```

---

### 4. Registro de Usuarios Actualizado (public/registrouser.html)

**Cambio:**
Ahora cuando se crea un usuario, se guarda el campo `contra` en Firestore:

```javascript
const userData = { 
  nombre, apellido1, apellido2, numeroDocumento, 
  mail, movil, 
  password,      // Para Firebase Auth
  contra: password,  // Para Firestore (validación de login)
  roles 
};
```

---

## 🔐 Flujo de Login

```
1. Usuario abre modal de login
   ↓
2. Ingresa mail y contraseña
   ↓
3. Click en "Entrar"
   ↓
4. POST /api/usuarios/login
   ↓
5. API busca usuario por mail en Firestore
   ↓
6. API compara password con campo "contra"
   ↓
7. Si coincide:
   - Extrae el rol
   - Devuelve datos del usuario
   ↓
8. Frontend muestra alert:
   "¡Bienvenido Juan!
    Tu rol es: Entrenador"
   ↓
9. Cierra modal y limpia formulario
```

---

## 🧪 Cómo Probar

### 1. Crear un usuario de prueba

Accede a:
```
http://localhost:3001/registrouser.html
```

Crea un usuario con:
- **Email**: test@example.com
- **Contraseña**: 123456
- **Nombre**: Test
- **Apellido**: Usuario
- **Documento**: 99999999X
- **Rol**: Administrador

### 2. Hacer login

En cualquier página, haz clic en el botón **"Login"** en el menú.

Ingresa:
- **Email**: test@example.com
- **Contraseña**: 123456

### 3. Resultado esperado

Deberías ver un alert:
```
¡Bienvenido Test!

Tu rol es: Administrador
```

---

## ⚠️ Importante - Seguridad

### Estado Actual (Desarrollo)
- ❌ Contraseñas guardadas en texto plano
- ❌ Sin cifrado
- ❌ Sin tokens de sesión
- ❌ Sin protección de endpoints

### ⚠️ NO usar en producción así

Este sistema es **solo para desarrollo y pruebas**. Para producción necesitarías:

1. **Cifrar contraseñas** con bcrypt o similar
2. **Usar JWT** para mantener sesión
3. **HTTPS** obligatorio
4. **Rate limiting** para prevenir ataques de fuerza bruta
5. **Validación adicional** de seguridad

---

## 📊 Estructura de Usuario en Firestore

```json
{
  "mail": "usuario@example.com",
  "contra": "123456",  ← Campo para validación de login
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
```

---

## 🎯 Roles Soportados

El sistema extrae el primer rol del objeto `roles`:

- **administrador**: Acceso completo
- **entrenador**: Gestión de su equipo
- **delegado**: Gestión de su equipo
- **arbitro**: Gestión de partidos

---

## 📝 Archivos Modificados

1. **api/controllers/usuariosController.js**
   - Añadida función `loginUsuario`
   - Validación contra campo "contra" en Firestore

2. **api/routes/usuarios.js**
   - Añadida ruta `POST /login`

3. **public/plantilla.js**
   - Reemplazado Firebase Auth por llamada a API
   - Añadido alert con el rol del usuario

4. **public/registrouser.html**
   - Añadido campo `contra` al guardar usuario

---

## 🚀 Próximos Pasos (Futuro)

### Corto Plazo
- [ ] Guardar sesión en localStorage
- [ ] Mostrar nombre de usuario en el nav
- [ ] Botón de logout

### Medio Plazo
- [ ] Implementar JWT para sesiones
- [ ] Cifrar contraseñas con bcrypt
- [ ] Proteger endpoints según rol

### Largo Plazo
- [ ] Sistema de permisos granular
- [ ] Recuperación de contraseña
- [ ] Autenticación de dos factores

---

## ✅ Resultado Final

El sistema de login ahora:
- ✅ Usa nuestra propia API (no Firebase Auth)
- ✅ Valida contra el campo "contra" en Firestore
- ✅ Extrae y muestra el rol del usuario
- ✅ Proporciona feedback claro
- ✅ Funciona de forma independiente

---

**¡El sistema de login está listo para usar!** 🎉

**Pruébalo en cualquier página haciendo clic en "Login"**

---

**Última actualización**: 2 de Diciembre de 2025, 18:00
