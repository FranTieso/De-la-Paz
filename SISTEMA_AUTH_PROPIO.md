# 🔐 Sistema de Autenticación Propio (Sin Firebase Auth)

**Fecha**: 3 de Diciembre de 2025
**Estado**: ✅ COMPLETADO

---

## 🎯 Objetivo

Implementar un sistema de autenticación completamente basado en nuestra propia API, **sin usar Firebase Auth**, validando credenciales directamente contra Firestore.

---

## ✅ Cambios Realizados

### 1. **Controlador de Usuarios** (`api/controllers/usuariosController.js`)

#### Eliminado:
- ❌ Importación de `auth` de Firebase
- ❌ Creación de usuarios en Firebase Auth
- ❌ Verificación de email en Firebase Auth
- ❌ Eliminación de usuarios en Firebase Auth

#### Modificado:

**`createUsuario`** - Ahora crea usuarios solo en Firestore:
```javascript
// Verificar si el email ya existe en Firestore
const existingEmail = await db.collection('USUARIOS')
  .where('mail', '==', mail)
  .get();

if (!existingEmail.empty) {
  return res.status(409).json({ 
    error: 'El correo electrónico ya está en uso.' 
  });
}

// Guardar usuario en Firestore con contraseña en campo "contra"
const toSave = { 
  mail, 
  contra: password,  // Guardar contraseña para login
  ...userData 
};

const docRef = await db.collection('USUARIOS').add(toSave);
```

**`deleteUsuario`** - Ahora elimina solo de Firestore:
```javascript
// Eliminar de Firestore
await db.collection('USUARIOS').doc(id).delete();
```

**`loginUsuario`** - Valida contra el campo `contra` en Firestore:
```javascript
// Buscar usuario por email
const usuariosSnapshot = await db.collection('USUARIOS')
  .where('mail', '==', mail)
  .limit(1)
  .get();

// Verificar contraseña
if (usuarioData.contra !== password) {
  return res.status(401).json({ 
    success: false,
    error: 'Credenciales incorrectas.' 
  });
}
```

---

## 🔄 Flujo Completo

### Registro de Usuario
```
1. Usuario completa formulario en registrouser.html
   ↓
2. POST /api/usuarios
   ↓
3. API verifica:
   - Email no existe en Firestore
   - Número de documento no existe
   - Contraseña tiene mínimo 6 caracteres
   ↓
4. API guarda en Firestore:
   {
     mail: "usuario@example.com",
     contra: "123456",  ← Contraseña en texto plano
     nombre: "Juan",
     roles: { entrenador: { equipo: "Equipo A" } }
   }
   ↓
5. Usuario creado con éxito
```

### Login de Usuario
```
1. Usuario abre modal de login
   ↓
2. Ingresa email y contraseña
   ↓
3. POST /api/usuarios/login
   ↓
4. API busca usuario por email en Firestore
   ↓
5. API compara contraseña con campo "contra"
   ↓
6. Si coincide:
   - Extrae el rol
   - Devuelve datos del usuario
   ↓
7. Frontend muestra mensaje de bienvenida
```

---

## 📊 Estructura de Usuario en Firestore

```json
{
  "mail": "usuario@example.com",
  "contra": "123456",
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

## 🧪 Cómo Probar

### 1. Iniciar el servidor
```bash
node server.js
```

### 2. Registrar un usuario
Accede a: `http://localhost:3001/registrouser.html`

Completa el formulario:
- **Email**: test@example.com
- **Contraseña**: 123456
- **Nombre**: Test
- **Apellido**: Usuario
- **Documento**: 99999999X
- **Rol**: Entrenador
- **Equipo**: (selecciona uno)

### 3. Hacer login
En cualquier página, haz clic en **"Login"**

Ingresa:
- **Email**: test@example.com
- **Contraseña**: 123456

### 4. Resultado esperado
```
¡Bienvenido Test!

Tu rol es: Entrenador
```

---

## ⚠️ Seguridad - IMPORTANTE

### ⚠️ Estado Actual (Solo Desarrollo)

Este sistema es **SOLO PARA DESARROLLO**. Las contraseñas se guardan en **texto plano**.

**NO USAR EN PRODUCCIÓN**

### 🔒 Para Producción Necesitas:

1. **Cifrar contraseñas con bcrypt**
   ```javascript
   const bcrypt = require('bcrypt');
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Usar JWT para sesiones**
   ```javascript
   const jwt = require('jsonwebtoken');
   const token = jwt.sign({ userId: user.id }, SECRET_KEY);
   ```

3. **HTTPS obligatorio**
   - Nunca enviar contraseñas por HTTP

4. **Rate limiting**
   - Prevenir ataques de fuerza bruta

5. **Validación adicional**
   - Sanitización de inputs
   - Protección contra inyección

---

## 📝 Archivos Modificados

1. **api/controllers/usuariosController.js**
   - Eliminada dependencia de Firebase Auth
   - `createUsuario` ahora solo usa Firestore
   - `deleteUsuario` ahora solo usa Firestore
   - `loginUsuario` valida contra campo "contra"

2. **api/routes/usuarios.js**
   - Sin cambios (ya tenía la ruta de login)

3. **public/plantilla.js**
   - Sin cambios (ya usaba la API propia)

4. **public/registrouser.html**
   - Sin cambios (ya enviaba el campo "contra")

---

## ✅ Ventajas del Sistema Actual

- ✅ **Independiente de Firebase Auth**: No necesitas configurar Firebase Auth
- ✅ **Simple**: Fácil de entender y mantener
- ✅ **Flexible**: Puedes agregar campos personalizados fácilmente
- ✅ **Control total**: Toda la lógica está en tu API

---

## 🚀 Próximos Pasos Recomendados

### Corto Plazo
- [ ] Implementar bcrypt para cifrar contraseñas
- [ ] Agregar JWT para mantener sesión
- [ ] Guardar token en localStorage
- [ ] Mostrar nombre de usuario en el nav
- [ ] Botón de logout

### Medio Plazo
- [ ] Middleware de autenticación para proteger endpoints
- [ ] Verificación de roles en el backend
- [ ] Rate limiting en login
- [ ] Recuperación de contraseña

### Largo Plazo
- [ ] Autenticación de dos factores
- [ ] Historial de sesiones
- [ ] Notificaciones de login
- [ ] Políticas de contraseñas

---

## 🎉 Resultado Final

Tu sistema ahora:
- ✅ **NO usa Firebase Auth**
- ✅ Valida credenciales contra Firestore
- ✅ Crea usuarios solo en Firestore
- ✅ Elimina usuarios solo de Firestore
- ✅ Login funcional con tu propia API
- ✅ Extrae y muestra roles correctamente

**¡El sistema está listo para desarrollo!**

---

**Última actualización**: 3 de Diciembre de 2025
