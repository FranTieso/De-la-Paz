// CRUD de Ligas - JavaScript
document.addEventListener('DOMContentLoaded', async () => {
  const loadingState = document.getElementById('loading-state');
  const errorState = document.getElementById('error-state');
  const errorMessage = document.getElementById('error-message');
  const ligasContainer = document.getElementById('ligas-container');
  const emptyState = document.getElementById('empty-state');
  const modal = document.getElementById('modal-liga');
  const closeModal = document.getElementById('close-modal');
  
  let ligaActual = null;
  let equiposNuevos = [];
  let allLigas = []; // Variable para almacenar todas las ligas

  // Función para verificar si el usuario está autenticado
  function verificarAutenticacion() {
    const userSession = localStorage.getItem('userSession');
    
    if (!userSession) {
      console.warn('No hay sesión de usuario');
      return false;
    }
    
    try {
      const user = JSON.parse(userSession);
      if (!window.hasRole(user, 'admin')) {
        console.warn('Usuario no es administrador');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      return false;
    }
  }

  // Cargar todas las ligas (optimizado)
  async function cargarLigas() {
    try {
      loadingState.classList.remove('hidden');
      errorState.classList.add('hidden');
      ligasContainer.classList.add('hidden');
      emptyState.classList.add('hidden');

      const response = await fetch('/api/ligas');
      if (!response.ok) throw new Error('Error al cargar ligas');
      
      const ligas = await response.json();
      
      loadingState.classList.add('hidden');
      
      if (ligas.length === 0) {
        emptyState.classList.remove('hidden');
        return;
      }
      
      // Guardar las ligas globalmente
      allLigas = ligas;
      
      ligasContainer.classList.remove('hidden');
      ligasContainer.innerHTML = '';
      
      // Crear tarjetas de forma más eficiente
      ligas.forEach(liga => {
        const card = crearTarjetaLiga(liga);
        ligasContainer.appendChild(card);
      });
      
    } catch (error) {
      console.error('Error al cargar ligas:', error);
      loadingState.classList.add('hidden');
      errorState.classList.remove('hidden');
      errorMessage.textContent = 'Error al cargar las ligas: ' + error.message;
    }
  }

  // Crear tarjeta de liga
  function crearTarjetaLiga(liga) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-xl shadow-lg border-2 border-primary hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden';
    
    const numEquipos = liga.EQUIPOS ? liga.EQUIPOS.length : (liga.NUM_EQUIPOS || 0);
    
    div.innerHTML = `
      <div class="bg-gradient-to-r from-primary to-blue-600 p-4 text-white">
        <h3 class="text-xl font-bold mb-1">
          <i class="fas fa-trophy mr-2"></i>${liga.NOMBRE || 'Sin nombre'}
        </h3>
        <p class="text-sm opacity-90">
          <i class="fas fa-calendar-alt mr-1"></i>${liga.TEMPORADA || 'Sin temporada'}
        </p>
      </div>
      
      <div class="p-4 space-y-3">
        <div class="flex items-center text-gray-700">
          <i class="fas fa-layer-group w-6 text-primary"></i>
          <span class="font-medium">${liga.CATEGORIA || 'Sin categoría'}</span>
        </div>
        
        <div class="flex items-center text-gray-700">
          <i class="fas fa-venus-mars w-6 text-primary"></i>
          <span class="font-medium">${liga.TIPO || 'Sin tipo'}</span>
        </div>
        
        <div class="flex items-center text-gray-700">
          <i class="fas fa-users w-6 text-primary"></i>
          <span class="font-medium">${numEquipos} equipo${numEquipos !== 1 ? 's' : ''}</span>
        </div>
        
        <button class="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-800 transition font-semibold mt-4">
          <i class="fas fa-eye mr-2"></i>Ver Detalles
        </button>
      </div>
    `;
    
    div.querySelector('button').addEventListener('click', () => abrirModal(liga));
    
    return div;
  }

  // Verificar si existe calendario para la liga usando el campo CALENDARIO
  function verificarCalendario(ligaId) {
    const btnCalendario = document.getElementById('btn-calendario');
    const calendarioIcon = document.getElementById('calendario-icon');
    const calendarioText = document.getElementById('calendario-text');
    const calendarioDescription = document.getElementById('calendario-description');
    
    try {
      // Obtener la liga para verificar el campo CALENDARIO
      const liga = allLigas.find(l => l.id === ligaId);
      if (!liga) {
        throw new Error('Liga no encontrada');
      }
      
      // Usar el campo CALENDARIO en lugar de hacer llamadas a la API
      if (liga.CALENDARIO === true) {
        // Ya existe calendario - mostrar botón "Ver Calendario"
        calendarioIcon.className = 'fas fa-calendar-check text-xl';
        calendarioText.textContent = 'Ver Calendario';
        calendarioDescription.textContent = 'Calendario generado y disponible para consulta';
        
        btnCalendario.className = 'bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transition transform hover:-translate-y-1 flex items-center gap-3';
        
        // Cambiar la acción del botón para ir a calendarioinfo.html
        btnCalendario.onclick = function() {
          window.location.href = `calendarioinfo.html?liga=${liga.id}`;
        };
      } else {
        // No existe calendario - mostrar botón "Generar Calendario"
        calendarioIcon.className = 'fas fa-calendar-plus text-xl';
        calendarioText.textContent = 'Generar Calendario';
        calendarioDescription.textContent = 'Crea el calendario completo de la liga';
        btnCalendario.className = 'bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transition transform hover:-translate-y-1 flex items-center gap-3';
        
        // Cambiar la acción del botón para ir a ligascrud.html
        btnCalendario.onclick = function() {
          window.location.href = `ligascrud.html?liga=${ligaId}`;
        };
      }
    } catch (error) {
      console.error('Error verificando calendario:', error);
      // En caso de error, mostrar opción de generar
      calendarioIcon.className = 'fas fa-calendar-plus text-xl';
      calendarioText.textContent = 'Generar Calendario';
      calendarioDescription.textContent = 'Crea el calendario completo de la liga';
      btnCalendario.className = 'bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow-lg transition transform hover:-translate-y-1 flex items-center gap-3';
      
      // Acción por defecto para generar
      btnCalendario.onclick = function() {
        window.location.href = `ligascrud.html?liga=${ligaId}`;
      };
    }
  }

  // Abrir modal con detalles de la liga
  function abrirModal(liga) {
    ligaActual = liga;
    
    document.getElementById('modal-nombre').value = liga.NOMBRE || '';
    document.getElementById('modal-categoria').textContent = liga.CATEGORIA || '-';
    document.getElementById('modal-tipo').textContent = liga.TIPO || '-';
    document.getElementById('modal-temporada').textContent = liga.TEMPORADA || '-';
    
    const numEquipos = liga.EQUIPOS ? liga.EQUIPOS.length : (liga.NUM_EQUIPOS || 0);
    document.getElementById('modal-num-equipos').textContent = numEquipos;
    
    // Mostrar fechas si existen
    const modalFechas = document.getElementById('modal-fechas');
    if (liga.FECHA_INICIO || liga.FECHA_FIN) {
      modalFechas.classList.remove('hidden');
      document.getElementById('modal-fecha-inicio').textContent = 
        liga.FECHA_INICIO ? formatearFecha(liga.FECHA_INICIO) : '-';
      document.getElementById('modal-fecha-fin').textContent = 
        liga.FECHA_FIN ? formatearFecha(liga.FECHA_FIN) : '-';
    } else {
      modalFechas.classList.add('hidden');
    }
    
    mostrarEquiposLiga(liga.EQUIPOS || []);
    
    // Verificar calendario cuando se abre el modal
    verificarCalendario(liga.id);
    
    modal.classList.remove('hidden');
  }

  // Formatear fecha
  function formatearFecha(fecha) {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // Mostrar equipos de la liga
  function mostrarEquiposLiga(equipos) {
    const listaEquipos = document.getElementById('lista-equipos-modal');
    const noEquipos = document.getElementById('no-equipos');
    
    if (!equipos || equipos.length === 0) {
      listaEquipos.classList.add('hidden');
      noEquipos.classList.remove('hidden');
      return;
    }
    
    listaEquipos.classList.remove('hidden');
    noEquipos.classList.add('hidden');
    listaEquipos.innerHTML = '';
    
    // Verificar si la liga tiene calendario para deshabilitar botones
    const tieneCalendario = ligaActual.CALENDARIO === true;
    
    equipos.forEach((equipo, index) => {
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition';
      
      // Si tiene calendario, deshabilitar el botón de eliminar
      const botonEliminar = tieneCalendario 
        ? `<button class="text-gray-400 cursor-not-allowed" disabled title="No se puede eliminar: la liga tiene calendario generado">
             <i class="fas fa-lock"></i>
           </button>`
        : `<button class="text-red-500 hover:text-red-700 transition" onclick="eliminarEquipo('${equipo}')" title="Eliminar equipo">
             <i class="fas fa-trash"></i>
           </button>`;
      
      div.innerHTML = `
        <div class="flex items-center">
          <span class="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
            ${index + 1}
          </span>
          <span class="font-medium">${equipo}</span>
          ${tieneCalendario ? '<span class="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full"><i class="fas fa-calendar-check mr-1"></i>Protegido</span>' : ''}
        </div>
        ${botonEliminar}
      `;
      listaEquipos.appendChild(div);
    });
    
    // También deshabilitar visualmente el botón de añadir equipo si tiene calendario
    const btnAnadirEquipo = document.getElementById('btn-anadir-equipo');
    if (tieneCalendario) {
      btnAnadirEquipo.className = 'bg-gray-400 text-white px-4 py-2 rounded-lg cursor-not-allowed font-semibold text-sm';
      btnAnadirEquipo.innerHTML = '<i class="fas fa-lock mr-2"></i>Calendario Generado';
      btnAnadirEquipo.title = 'No se pueden añadir equipos: la liga tiene calendario generado';
    } else {
      btnAnadirEquipo.className = 'bg-secondary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition font-semibold text-sm';
      btnAnadirEquipo.innerHTML = '<i class="fas fa-plus-circle mr-2"></i>Añadir Equipo';
      btnAnadirEquipo.title = 'Añadir equipo a la liga';
    }
  }

  // Eliminar equipo de la liga
  window.eliminarEquipo = async function(nombreEquipo) {
    // Verificar autenticación antes de proceder
    if (!verificarAutenticacion()) {
      alert('No tienes permisos para realizar esta acción.');
      return;
    }
    
    // Verificar si la liga tiene calendario generado
    if (ligaActual.CALENDARIO === true) {
      alert('No se pueden eliminar equipos de una liga que ya tiene calendario generado.\n\nPara modificar los equipos, primero debes eliminar el calendario existente.');
      return;
    }
    
    if (!confirm(`¿Estás seguro de eliminar "${nombreEquipo}" de la liga?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Tu sesión ha expirado. Por favor, cierra sesión y vuelve a iniciar sesión.');
        return;
      }
      
      const equiposActualizados = ligaActual.EQUIPOS.filter(eq => eq !== nombreEquipo);
      
      const response = await fetch(`/api/ligas/${ligaActual.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          EQUIPOS: equiposActualizados,
          NUM_EQUIPOS: equiposActualizados.length
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        let errorMessage = 'Error al eliminar equipo';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          
          // Manejo específico de errores de autenticación
          if (response.status === 401) {
            alert('Tu sesión ha expirado. Por favor, cierra sesión y vuelve a iniciar sesión.');
            return;
          } else if (response.status === 403) {
            alert('No tienes permisos para realizar esta acción. Solo los administradores pueden gestionar ligas.');
            return;
          }
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      ligaActual.EQUIPOS = equiposActualizados;
      ligaActual.NUM_EQUIPOS = equiposActualizados.length;
      mostrarEquiposLiga(equiposActualizados);
      cargarLigas();
      
      alert('Equipo eliminado correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el equipo: ' + error.message);
    }
  };

  // Guardar nombre de la liga
  document.getElementById('btn-guardar-nombre').addEventListener('click', async () => {
    // Verificar autenticación antes de proceder
    if (!verificarAutenticacion()) {
      alert('No tienes permisos para realizar esta acción.');
      return;
    }
    
    const nuevoNombre = document.getElementById('modal-nombre').value.trim();
    
    if (!nuevoNombre) {
      alert('El nombre no puede estar vacío');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('Tu sesión ha expirado. Por favor, cierra sesión y vuelve a iniciar sesión.');
        return;
      }
      
      const response = await fetch(`/api/ligas/${ligaActual.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ NOMBRE: nuevoNombre })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        let errorMessage = 'Error al actualizar nombre';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          
          // Manejo específico de errores de autenticación
          if (response.status === 401) {
            alert('Tu sesión ha expirado. Por favor, cierra sesión y vuelve a iniciar sesión.');
            return;
          } else if (response.status === 403) {
            alert('No tienes permisos para realizar esta acción. Solo los administradores pueden gestionar ligas.');
            return;
          }
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      ligaActual.NOMBRE = nuevoNombre;
      alert('Nombre actualizado correctamente');
      cargarLigas();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el nombre: ' + error.message);
    }
  });

  // Botón añadir equipo
  document.getElementById('btn-anadir-equipo').addEventListener('click', async () => {
    // Verificar si la liga tiene calendario generado
    if (ligaActual.CALENDARIO === true) {
      alert('No se pueden añadir equipos a una liga que ya tiene calendario generado.\n\nPara modificar los equipos, primero debes eliminar el calendario existente.');
      return;
    }
    
    const seccion = document.getElementById('seccion-anadir-equipos');
    seccion.classList.toggle('hidden');
    
    if (!seccion.classList.contains('hidden')) {
      await cargarEquiposDisponibles();
    }
  });

  // Cargar equipos disponibles de la categoría
  async function cargarEquiposDisponibles() {
    const container = document.getElementById('equipos-disponibles');
    
    try {
      container.innerHTML = '<p class="text-gray-500 text-center">Cargando equipos...</p>';
      
      const response = await fetch('/api/equipos');
      if (!response.ok) throw new Error('Error al cargar equipos');
      
      const todosEquipos = await response.json();
      
      // Filtrar equipos de la misma categoría que no estén ya en la liga
      const equiposCategoria = todosEquipos.filter(eq => 
        eq.CATEGORIA === ligaActual.CATEGORIA && 
        !ligaActual.EQUIPOS?.includes(eq.EQUIPO)
      );
      
      if (equiposCategoria.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">No hay equipos disponibles para añadir en la categoría "' + ligaActual.CATEGORIA + '"</p>';
        return;
      }
      
      container.innerHTML = '';
      equiposNuevos = [];
      
      equiposCategoria.forEach(equipo => {
        const div = document.createElement('div');
        div.className = 'flex items-center p-2 hover:bg-gray-100 rounded cursor-pointer';
        div.innerHTML = `
          <input type="checkbox" id="eq-${equipo.id}" value="${equipo.EQUIPO}" 
            class="mr-3 h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded">
          <label for="eq-${equipo.id}" class="flex-1 cursor-pointer font-medium">
            ${equipo.EQUIPO} <span class="text-xs text-gray-500">(${equipo.CATEGORIA})</span>
          </label>
        `;
        
        const checkbox = div.querySelector('input');
        checkbox.addEventListener('change', (e) => {
          if (e.target.checked) {
            equiposNuevos.push(equipo.EQUIPO);
          } else {
            equiposNuevos = equiposNuevos.filter(eq => eq !== equipo.EQUIPO);
          }
          
          // Actualizar contador visual
          const selectedCount = equiposNuevos.length;
          const confirmBtn = document.getElementById('btn-confirmar-equipos');
          confirmBtn.innerHTML = `<i class="fas fa-check mr-2"></i>Confirmar (${selectedCount})`;
        });
        
        container.appendChild(div);
      });
      
    } catch (error) {
      console.error('Error:', error);
      container.innerHTML = '<p class="text-red-500 text-center">Error al cargar equipos: ' + error.message + '</p>';
    }
  }

  // Confirmar añadir equipos
  document.getElementById('btn-confirmar-equipos').addEventListener('click', async () => {
    // Verificar autenticación antes de proceder
    if (!verificarAutenticacion()) {
      alert('No tienes permisos para realizar esta acción.');
      return;
    }
    
    if (equiposNuevos.length === 0) {
      alert('Selecciona al menos un equipo');
      return;
    }
    
    console.log('Equipos a añadir:', equiposNuevos);
    console.log('Liga actual:', ligaActual);
    
    try {
      const equiposActualizados = [...(ligaActual.EQUIPOS || []), ...equiposNuevos];
      console.log('Equipos actualizados:', equiposActualizados);
      
      const token = localStorage.getItem('token');
      console.log('Token disponible:', !!token);
      
      if (!token) {
        alert('Tu sesión ha expirado. Por favor, cierra sesión y vuelve a iniciar sesión.');
        return;
      }
      
      const requestBody = {
        EQUIPOS: equiposActualizados,
        NUM_EQUIPOS: equiposActualizados.length
      };
      console.log('Datos a enviar:', requestBody);
      
      const response = await fetch(`/api/ligas/${ligaActual.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        let errorMessage = 'Error al añadir equipos';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
          
          // Manejo específico de errores de autenticación
          if (response.status === 401) {
            alert('Tu sesión ha expirado. Por favor, cierra sesión y vuelve a iniciar sesión.');
            return;
          } else if (response.status === 403) {
            alert('No tienes permisos para realizar esta acción. Solo los administradores pueden gestionar ligas.');
            return;
          }
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      console.log('Success response:', result);
      
      ligaActual.EQUIPOS = equiposActualizados;
      ligaActual.NUM_EQUIPOS = equiposActualizados.length;
      mostrarEquiposLiga(equiposActualizados);
      document.getElementById('seccion-anadir-equipos').classList.add('hidden');
      
      // Resetear el botón
      const confirmBtn = document.getElementById('btn-confirmar-equipos');
      confirmBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Confirmar';
      
      cargarLigas();
      
      alert(`${equiposNuevos.length} equipo(s) añadido(s) correctamente`);
      equiposNuevos = [];
    } catch (error) {
      console.error('Error completo:', error);
      alert('Error al añadir equipos: ' + error.message);
    }
  });

  // Cancelar añadir equipos
  document.getElementById('btn-cancelar-equipos').addEventListener('click', () => {
    document.getElementById('seccion-anadir-equipos').classList.add('hidden');
    equiposNuevos = [];
    
    // Resetear el botón de confirmar
    const confirmBtn = document.getElementById('btn-confirmar-equipos');
    confirmBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Confirmar';
    
    // Desmarcar todos los checkboxes
    const checkboxes = document.querySelectorAll('#equipos-disponibles input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
  });

  // Cerrar modal
  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    document.getElementById('seccion-anadir-equipos').classList.add('hidden');
  });

  // Cerrar modal al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      document.getElementById('seccion-anadir-equipos').classList.add('hidden');
    }
  });

  // Verificación inicial de autenticación y carga de ligas
  const userSession = localStorage.getItem('userSession');
  
  if (!userSession) {
    alert('Debes iniciar sesión para acceder a esta página.');
    window.location.href = 'index.html';
    return;
  }
  
  try {
    const user = JSON.parse(userSession);
    if (!window.hasRole(user, 'admin')) {
      alert('No tienes permisos para acceder a esta página. Solo los administradores pueden gestionar ligas.');
      window.location.href = 'index.html';
      return;
    }
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    alert('Error en la sesión. Por favor, inicia sesión nuevamente.');
    window.location.href = 'index.html';
    return;
  }
  
  // Cargar ligas al inicializar
  await cargarLigas();
});
