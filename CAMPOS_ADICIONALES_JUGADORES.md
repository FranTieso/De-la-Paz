# ⚽ Campos Adicionales - Jugadores

**Fecha**: 3 de Diciembre de 2025
**Estado**: ✅ COMPLETADO

---

## 🎯 Campos Añadidos

### **✅ Nuevos Campos Implementados:**
- **DOCUMENTO** *(obligatorio)* - DNI, NIE, Pasaporte...
- **MOVIL** *(voluntario)* - Número de teléfono
- **MAIL** *(voluntario)* - Correo electrónico

---

## 📋 Estructura Final Completa

### **Campos del Jugador:**
```javascript
{
  NOMBRE: "Juan",                    // * Obligatorio
  APELLIDO1: "Pérez",               // * Obligatorio
  APELLIDO2: "García",              // Voluntario
  ALIAS: "Juanito",                 // Voluntario
  DOCUMENTO: "12345678A",           // * Obligatorio ✅ NUEVO
  MOVIL: "600123456",               // Voluntario ✅ NUEVO
  MAIL: "juan@email.com",           // Voluntario ✅ NUEVO
  CATEGORIA: "Prebenjamin",         // Heredado del equipo
  DORSAL: 10,                       // * Obligatorio
  EQUIPO: "PELOTEROS",              // * Obligatorio
  ESTADO: "Activo",                 // Por defecto "Activo"
  FECHA_NACIMIENTO: "1995-05-15T10:00:00", // * Obligatorio
  POSICION: "Delantero",            // Voluntario
  SEXO: "Masculino"                 // Heredado del equipo
}
```

---

## 🔧 Cambios Implementados

### **1. Frontend (`public/jugadores.html`)**

#### **Formulario Actualizado:**
```html
<!-- Datos Personales -->
<input id="jugador-nombre" required>           <!-- NOMBRE * -->
<input id="jugador-apellido1" required>        <!-- APELLIDO1 * -->
<input id="jugador-apellido2">                 <!-- APELLIDO2 -->
<input id="jugador-alias">                     <!-- ALIAS -->
<input id="jugador-documento" required>        <!-- ✅ DOCUMENTO * -->
<input id="jugador-movil">                     <!-- ✅ MOVIL -->
<input id="jugador-mail">                      <!-- ✅ MAIL -->
<input id="jugador-fecha-nacimiento" required> <!-- FECHA_NACIMIENTO * -->

<!-- Datos del Equipo -->
<select id="jugador-equipo" required>          <!-- EQUIPO * -->
<input id="jugador-categoria" readonly>        <!-- CATEGORIA (heredado) -->
<input id="jugador-sexo" readonly>             <!-- SEXO (heredado) -->
<input id="jugador-dorsal" required>           <!-- DORSAL * -->
<select id="jugador-posicion">                 <!-- POSICION -->
<select id="jugador-estado">                   <!-- ESTADO -->
```

#### **Datos Enviados al Servidor:**
```javascript
const jugadorData = {
    NOMBRE: document.getElementById('jugador-nombre').value.trim(),
    APELLIDO1: document.getElementById('jugador-apellido1').value.trim(),
    APELLIDO2: document.getElementById('jugador-apellido2').value.trim(),
    ALIAS: document.getElementById('jugador-alias').value.trim(),
    DOCUMENTO: document.getElementById('jugador-documento').value.trim(), // ✅ NUEVO
    MOVIL: document.getElementById('jugador-movil').value.trim(),         // ✅ NUEVO
    MAIL: document.getElementById('jugador-mail').value.trim(),           // ✅ NUEVO
    // ... resto de campos
};
```

### **2. Backend (`api/controllers/jugadoresController.js`)**

#### **Validación Actualizada:**
```javascript
// Campos obligatorios actualizados
if (!NOMBRE || !APELLIDO1 || !DOCUMENTO || !EQUIPO || !DORSAL || !FECHA_NACIMIENTO) {
  return res.status(400).json({ 
    error: 'Los campos NOMBRE, APELLIDO1, DOCUMENTO, EQUIPO, DORSAL y FECHA_NACIMIENTO son obligatorios.' 
  });
}
```

#### **Validación de Documento Único:**
```javascript
// Verificar si ya existe un jugador con ese documento
const existsDocumento = await db.collection('JUGADORES')
  .where('DOCUMENTO', '==', documentoSanitized)
  .get();

if (!existsDocumento.empty) {
  return res.status(409).json({ 
    error: 'Ya existe un jugador con ese documento.' 
  });
}
```

#### **Estructura de Datos Completa:**
```javascript
const jugadorData = {
  NOMBRE: nombreSanitized,
  APELLIDO1: apellido1Sanitized,
  APELLIDO2: apellido2Sanitized || '',
  ALIAS: aliasSanitized || '',
  DOCUMENTO: documentoSanitized,     // ✅ NUEVO - Obligatorio
  MOVIL: MOVIL || '',                // ✅ NUEVO - Voluntario
  MAIL: MAIL || '',                  // ✅ NUEVO - Voluntario
  CATEGORIA: equipoCategoria,
  DORSAL: parseInt(DORSAL),
  EQUIPO: EQUIPO,
  ESTADO: ESTADO || 'Activo',
  FECHA_NACIMIENTO: FECHA_NACIMIENTO,
  POSICION: POSICION || '',
  SEXO: equipoSexo
};
```

---

## 📊 Campos por Tipo

### **🔴 Obligatorios (6):**
1. **NOMBRE**
2. **APELLIDO1**
3. **DOCUMENTO** ✅ NUEVO
4. **EQUIPO**
5. **DORSAL**
6. **FECHA_NACIMIENTO**

### **🟡 Voluntarios (8):**
1. **APELLIDO2**
2. **ALIAS**
3. **MOVIL** ✅ NUEVO
4. **MAIL** ✅ NUEVO
5. **POSICION**
6. **ESTADO** (por defecto "Activo")
7. **CATEGORIA** (heredado automáticamente)
8. **SEXO** (heredado automáticamente)

---

## 🔍 Validaciones Implementadas

### **Campo DOCUMENTO:**
- **Obligatorio**: No se puede crear jugador sin documento
- **Único**: No puede haber dos jugadores con el mismo documento
- **Sanitizado**: Se limpia de caracteres especiales
- **Flexible**: Acepta DNI, NIE, Pasaporte, etc.

### **Campo MOVIL:**
- **Voluntario**: Puede estar vacío
- **Tipo**: `tel` para teclado numérico en móviles
- **Placeholder**: "Número de teléfono"

### **Campo MAIL:**
- **Voluntario**: Puede estar vacío
- **Tipo**: `email` para validación automática
- **Placeholder**: "Correo electrónico"

---

## 🧪 Casos de Prueba

### **1. Crear Jugador con Todos los Campos**
```
Datos obligatorios:
- Nombre: "Juan"
- Apellido1: "Pérez"
- Documento: "12345678A"
- Equipo: "PELOTEROS" (heredado)
- Dorsal: 10
- Fecha Nacimiento: "1995-05-15"

Datos voluntarios:
- Apellido2: "García"
- Alias: "Juanito"
- Móvil: "600123456"
- Mail: "juan@email.com"
- Posición: "Delantero"
```

### **2. Crear Jugador Solo con Obligatorios**
```
Datos mínimos:
- Nombre: "Ana"
- Apellido1: "López"
- Documento: "87654321B"
- Equipo: "PELOTEROS" (heredado)
- Dorsal: 7
- Fecha Nacimiento: "1998-03-20"

Resultado: Jugador creado correctamente
```

### **3. Intentar Documento Duplicado**
```
Crear jugador con documento "12345678A" (ya existe)
Resultado: Error 409 - "Ya existe un jugador con ese documento"
```

---

## 📱 Experiencia de Usuario

### **Formulario Mejorado:**
- **Campos claramente marcados**: * para obligatorios
- **Placeholders informativos**: Ayudan al usuario
- **Validación HTML5**: Email y teléfono con tipos específicos
- **Orden lógico**: Datos personales → Datos del equipo

### **Mensajes de Error Claros:**
- **Campos faltantes**: "Los campos X, Y, Z son obligatorios"
- **Documento duplicado**: "Ya existe un jugador con ese documento"
- **Dorsal duplicado**: "Ya existe un jugador con el dorsal X en el equipo Y"

---

## ✅ Resultado Final

### **Estructura Completa y Funcional:**
- ✅ **14 campos total** (6 obligatorios + 8 voluntarios)
- ✅ **Campo DOCUMENTO** obligatorio y único
- ✅ **Campos MOVIL y MAIL** voluntarios
- ✅ **Validaciones robustas** implementadas
- ✅ **Herencia automática** de categoría y sexo

### **Experiencia de Usuario Optimizada:**
- ✅ **Formulario claro** con campos bien organizados
- ✅ **Validación en tiempo real** con HTML5
- ✅ **Mensajes de error** informativos
- ✅ **Proceso fluido** para entrenadores

### **Base de Datos Consistente:**
- ✅ **Documentos únicos** por jugador
- ✅ **Estructura uniforme** en todos los registros
- ✅ **Datos completos** pero no excesivos
- ✅ **Validaciones en backend** para integridad

---

**¡Los campos DOCUMENTO (obligatorio), MOVIL y MAIL (voluntarios) han sido añadidos correctamente!** ⚽

**La estructura ahora está completa y lista para usar.**

---

**Última actualización**: 3 de Diciembre de 2025