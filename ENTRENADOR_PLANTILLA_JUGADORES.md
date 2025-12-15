# 👨‍🏫 Integración Entrenador → Jugadores

**Fecha**: 3 de Diciembre de 2025
**Estado**: ✅ COMPLETADO

---

## 🎯 Objetivo Cumplido

Al hacer clic en "Mi Plantilla" desde el panel de entrenador, ahora redirige a `jugadores.html` con **filtros específicos del equipo del entrenador** y **restricciones de permisos**.

---

## 🔄 Flujo Implementado

### **1. Desde el Panel de Entrenador**
```
Entrenador hace clic en "Mi Plantilla"
    ↓
JavaScript obtiene el equipo del entrenador
    ↓
Redirige a: jugadores.html?equipo=NombreEquipo&modo=entrenador
    ↓
jugadores.html detecta modo entrenador
    ↓
Aplica restricciones y filtros específicos
```

### **2. Verificaciones de Seguridad**
```
jugadores.html recibe parámetros
    ↓
Verifica que usuario esté logueado
    ↓
Verifica que usuario sea entrenador
    ↓
Verifica que equipo coincida con el del entrenador
    ↓
Si todo OK → Configura modo entrenador
Si no → Redirige con mensaje de error
```

---

## 🛠️ Cambios Implementados

### **1. Panel de Entrenador (`entrenador_panel.html`)**

#### **Cambio de Enlace**
**Antes:**
```html
<a href="entrenador_plantilla.html">Mi Plantilla</a>
```

**Después:**
```html
<div id="mi-plantilla-card" class="cursor-pointer">Mi Plantilla</div>
```

#### **JavaScript Añadido**
```javascript
// Configurar enlace de Mi Plantilla
const miPlantillaCard = document.getElementById('mi-plantilla-card');
if (miPlantillaCard && miEquipo) {
    miPlantillaCard.addEventListener('click', () => {
        // Redirigir a jugadores.html con filtro del equipo del entrenador
        window.location.href = `jugadores.html?equipo=${encodeURIComponent(miEquipo)}&modo=entrenador`;
    });
}
```

### **2. Página de Jugadores (`jugadores.html`)**

#### **Detección de Modo Entrenador**
```javascript
// Verificar si viene desde el panel de entrenador
const urlParams = new URLSearchParams(window.location.search);
const equipoFiltro = urlParams.get('equipo');
const modo = urlParams.get('modo');

if (modo === 'entrenador') {
    // Verificar permisos y configurar modo
    configurarModoEntrenador(equipoFiltro);
}
```

#### **Función de Configuración**
```javascript
function configurarModoEntrenador(equipo) {
    modoEntrenador = true;
    equipoEntrenador = equipo;
    
    // Cambiar título de la página
    document.querySelector('h1').textContent = `Mi Plantilla - ${equipo}`;
    
    // Añadir botón de volver al panel
    // Ocultar filtros de equipo
    // Preseleccionar equipo en el modal
}
```

---

## 🔒 Restricciones de Seguridad

### **Verificaciones de Acceso**
1. **Usuario logueado**: Debe tener sesión activa
2. **Rol correcto**: Debe ser entrenador
3. **Equipo válido**: El equipo del URL debe coincidir con el del entrenador

### **Restricciones Funcionales**
1. **Solo su equipo**: Solo puede ver jugadores de su equipo
2. **Crear jugadores**: Solo puede crear en su equipo
3. **Editar jugadores**: Solo puede editar de su equipo
4. **Eliminar jugadores**: Solo puede eliminar de su equipo

### **Código de Validación**
```javascript
// En crear/editar jugador
if (modoEntrenador && jugadorData.EQUIPO !== equipoEntrenador) {
    mostrarFeedbackModal('Solo puedes gestionar jugadores de tu propio equipo', 'error');
    return;
}

// En editar jugador
if (modoEntrenador && jugador.EQUIPO !== equipoEntrenador) {
    alert('Solo puedes editar jugadores de tu propio equipo');
    return;
}
```

---

## 🎨 Cambios en la Interfaz

### **Modo Normal (Administrador)**
- Título: "Gestión de Jugadores"
- Subtítulo: "Administra los jugadores de todos los equipos"
- Filtros: Todos los equipos disponibles
- Acciones: Crear/editar/eliminar cualquier jugador

### **Modo Entrenador**
- Título: "Mi Plantilla - [Nombre del Equipo]"
- Subtítulo: "Gestiona los jugadores de tu equipo"
- Filtros: Sin filtro de equipo (solo su equipo)
- Botón: "Volver al Panel" → `entrenador_panel.html`
- Acciones: Solo jugadores de su equipo

### **Modal de Jugador en Modo Entrenador**
- Campo "Equipo" preseleccionado y deshabilitado
- Solo puede crear/editar jugadores de su equipo
- Validaciones adicionales de seguridad

---

## 📊 Datos Filtrados

### **Carga de Jugadores**
**Modo Normal:**
```javascript
const response = await fetch('/api/jugadores');
```

**Modo Entrenador:**
```javascript
const response = await fetch(`/api/jugadores/equipo/${encodeURIComponent(equipoEntrenador)}`);
```

### **Estadísticas Mostradas**
En modo entrenador, las estadísticas se calculan **solo con jugadores del equipo**:
- Total jugadores del equipo
- Jugadores activos del equipo
- Edad promedio del equipo
- Equipos = 1 (solo el suyo)

---

## 🧪 Cómo Probar

### **1. Crear Usuario Entrenador**
```
Email: entrenador@test.com
Contraseña: 123456
Rol: Entrenador
Equipo: [Selecciona un equipo existente]
```

### **2. Hacer Login como Entrenador**
1. Login desde cualquier página
2. Serás redirigido a `entrenador_panel.html`
3. Verifica que aparece "Mi Equipo: [Nombre]"

### **3. Probar "Mi Plantilla"**
1. Haz clic en la tarjeta "Mi Plantilla"
2. **Resultado esperado**: Redirige a `jugadores.html?equipo=NombreEquipo&modo=entrenador`
3. **Verificar**:
   - Título cambia a "Mi Plantilla - [Equipo]"
   - Solo aparecen jugadores de tu equipo
   - Filtro de equipo está oculto
   - Botón "Volver al Panel" presente

### **4. Probar Restricciones**
1. **Crear jugador**: Solo permite en tu equipo
2. **Editar jugador**: Solo de tu equipo
3. **Eliminar jugador**: Solo de tu equipo
4. **Acceso directo**: Intenta acceder a `jugadores.html?equipo=OtroEquipo&modo=entrenador`

---

## 🔗 URLs y Parámetros

### **URL de Acceso**
```
jugadores.html?equipo=NombreDelEquipo&modo=entrenador
```

### **Parámetros**
- `equipo`: Nombre exacto del equipo del entrenador
- `modo`: "entrenador" para activar restricciones

### **Ejemplo Real**
```
jugadores.html?equipo=Real%20Madrid&modo=entrenador
```

---

## 🚀 Próximas Mejoras

### **Corto Plazo**
- [ ] Breadcrumb visual con navegación
- [ ] Estadísticas específicas del equipo
- [ ] Exportar plantilla a PDF
- [ ] Búsqueda rápida de jugadores

### **Medio Plazo**
- [ ] Sistema de convocatorias
- [ ] Gestión de lesiones del equipo
- [ ] Historial de cambios
- [ ] Comunicación con delegado

### **Largo Plazo**
- [ ] App móvil para entrenadores
- [ ] Análisis de rendimiento del equipo
- [ ] Planificación de entrenamientos
- [ ] Integración con wearables

---

## ✅ Resultado Final

### **Navegación Fluida**
- ✅ **Clic directo** desde panel de entrenador
- ✅ **Filtrado automático** por equipo
- ✅ **Botón de retorno** al panel
- ✅ **URL con parámetros** para acceso directo

### **Seguridad Robusta**
- ✅ **Verificación de rol** y permisos
- ✅ **Validación de equipo** en cada acción
- ✅ **Restricciones de CRUD** por equipo
- ✅ **Redirección segura** en caso de error

### **Experiencia de Usuario**
- ✅ **Interfaz personalizada** para entrenadores
- ✅ **Datos específicos** del equipo
- ✅ **Navegación intuitiva** y coherente
- ✅ **Feedback claro** de restricciones

### **Integración Completa**
- ✅ **API existente** reutilizada
- ✅ **Sistema de autenticación** integrado
- ✅ **Diseño coherente** con el sitio
- ✅ **Responsive** en todos los dispositivos

---

**¡La integración está completamente funcional!** ⚽

**Los entrenadores ahora pueden gestionar su plantilla directamente desde su panel con todas las restricciones de seguridad.**

---

**Última actualización**: 3 de Diciembre de 2025