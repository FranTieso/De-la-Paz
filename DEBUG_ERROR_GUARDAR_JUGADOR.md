# 🔍 Debug - Error al Guardar Jugador

**Fecha**: 3 de Diciembre de 2025
**Estado**: 🔍 DEBUGGING

---

## ❌ Error Reportado

```
Error al guardar jugador: Error: Error en la respuesta del servidor
guardarJugador http://localhost:3001/jugadores.html?equipo=FOREVER YOUNG&modo=entrenador:748
```

---

## 🔧 Mejoras de Debug Implementadas

### **1. Logging Detallado Añadido**

```javascript
console.log('Enviando datos:', jugadorData); // Ver qué se envía
console.log('Response status:', response.status); // Ver status HTTP
console.log('Response headers:', response.headers.get('content-type')); // Ver tipo de respuesta
console.log('Response text:', responseText); // Ver respuesta completa
```

### **2. Verificación de Content-Type**

```javascript
// Verificar si la respuesta es JSON
const contentType = response.headers.get('content-type');
if (contentType && contentType.includes('application/json')) {
    // Parsear como JSON
} else {
    // Error: servidor devolvió HTML u otro formato
    throw new Error(`El servidor devolvió una respuesta no válida (${response.status})`);
}
```

---

## 🧪 Pasos para Debuggear

### **1. Verificar que el Servidor Esté Corriendo**

```bash
# Iniciar el servidor
node server.js

# Deberías ver:
🚀 Servidor escuchando en el puerto 3001
📱 Accede a tu web en http://localhost:3001
🔌 API disponible en http://localhost:3001/api
```

### **2. Probar la API Directamente**

```bash
# Probar endpoint de jugadores
curl http://localhost:3001/api/jugadores

# Debería devolver JSON, no HTML
```

### **3. Verificar en el Navegador**

1. **Abrir DevTools** (F12)
2. **Ir a Console**
3. **Intentar crear un jugador**
4. **Ver los logs** que añadí:
   - `Enviando datos:` - Verificar que los datos sean correctos
   - `Response status:` - Debería ser 201 para éxito
   - `Response headers:` - Debería ser `application/json`
   - `Response text:` - Ver la respuesta completa

---

## 🔍 Posibles Causas del Error

### **Causa 1: Servidor No Está Corriendo**
**Síntomas:**
- Error de conexión
- Response status: 0 o error de red

**Solución:**
```bash
node server.js
```

### **Causa 2: Ruta No Encontrada (404)**
**Síntomas:**
- Response status: 404
- Response text: HTML de página de error

**Solución:**
- Verificar que `/api/jugadores` esté disponible
- Probar: `http://localhost:3001/api`

### **Causa 3: Error en el Controlador (500)**
**Síntomas:**
- Response status: 500
- Response text: HTML de error del servidor

**Solución:**
- Revisar logs del servidor
- Verificar conexión a Firestore

### **Causa 4: Datos Inválidos (400)**
**Síntomas:**
- Response status: 400
- Response text: JSON con error específico

**Solución:**
- Verificar que todos los campos obligatorios estén presentes
- Verificar formato de los datos

---

## 🔧 Verificaciones Específicas

### **Datos Enviados**
Verificar en console que `jugadorData` contenga:
```javascript
{
  NOMBRE: "Juan",           // ✅ Obligatorio
  APELLIDO1: "Pérez",       // ✅ Obligatorio
  DNI: "12345678A",         // ✅ Obligatorio
  EQUIPO: "FOREVER YOUNG",  // ✅ Obligatorio
  DORSAL: 10,               // ✅ Obligatorio
  CATEGORIA: "...",         // Heredado del equipo
  TIPO: "...",              // Heredado del equipo
  // ... otros campos
}
```

### **Respuesta del Servidor**
Si la respuesta es HTML en lugar de JSON:
```html
<!DOCTYPE html>
<html>
<head><title>Error</title></head>
<body>Error 500: Internal Server Error</body>
</html>
```

Esto indica que hay un error en el servidor.

---

## 🛠️ Soluciones por Tipo de Error

### **Si Response Status = 0**
```
Problema: Servidor no está corriendo
Solución: node server.js
```

### **Si Response Status = 404**
```
Problema: Ruta no encontrada
Solución: Verificar que /api/jugadores esté disponible
```

### **Si Response Status = 500**
```
Problema: Error interno del servidor
Solución: Revisar logs del servidor y conexión a Firestore
```

### **Si Content-Type ≠ application/json**
```
Problema: Servidor devuelve HTML de error
Solución: Revisar configuración del servidor y middleware de errores
```

---

## 📋 Checklist de Verificación

### **Backend**
- [ ] Servidor corriendo en puerto 3001
- [ ] Ruta `/api/jugadores` disponible
- [ ] Controlador `jugadoresController.js` sin errores
- [ ] Conexión a Firestore funcionando
- [ ] Middleware de errores configurado

### **Frontend**
- [ ] Datos del formulario completos
- [ ] Campos obligatorios presentes
- [ ] Formato de datos correcto
- [ ] Headers de Content-Type correctos

### **Red**
- [ ] Sin errores de CORS
- [ ] Sin problemas de conectividad
- [ ] Respuesta en formato JSON

---

## 🔄 Pasos de Resolución

### **Paso 1: Verificar Servidor**
```bash
# Terminal 1
node server.js

# Terminal 2
curl http://localhost:3001/api
```

### **Paso 2: Probar API Manualmente**
```bash
curl -X POST http://localhost:3001/api/jugadores \
  -H "Content-Type: application/json" \
  -d '{
    "NOMBRE": "Test",
    "APELLIDO1": "Usuario",
    "DNI": "12345678T",
    "EQUIPO": "FOREVER YOUNG",
    "DORSAL": 99
  }'
```

### **Paso 3: Revisar Logs del Navegador**
1. Abrir DevTools
2. Ir a Console
3. Intentar crear jugador
4. Revisar todos los logs añadidos

### **Paso 4: Revisar Logs del Servidor**
Buscar errores en la terminal donde corre `node server.js`

---

## 📞 Información para Soporte

Si el problema persiste, proporcionar:

1. **Logs del navegador** (todos los console.log)
2. **Logs del servidor** (errores en terminal)
3. **Response status** y **content-type**
4. **Datos enviados** (jugadorData)
5. **Respuesta completa** del servidor

---

## ✅ Resultado Esperado

Cuando funcione correctamente:
```
Console logs:
- Enviando datos: {NOMBRE: "Juan", ...}
- Response status: 201
- Response headers: application/json
- Response text: {"message": "Jugador creado con éxito", ...}

UI:
- Mensaje: "Jugador guardado con éxito"
- Modal se cierra
- Lista se actualiza con nuevo jugador
```

---

**Con estos logs detallados podremos identificar exactamente dónde está el problema.** 🔍

---

**Última actualización**: 3 de Diciembre de 2025