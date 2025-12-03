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

  // Cargar todas las ligas
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
      
      ligasContainer.classList.remove('hidden');
      ligasContainer.innerHTML = '';
      
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
    
    equipos.forEach((equipo, index) => {
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition';
      div.innerHTML = `
        <div class="flex items-center">
          <span class="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
            ${index + 1}
          </span>
          <span class="font-medium">${equipo}</span>
        </div>
        <button class="text-red-500 hover:text-red-700 transition" onclick="eliminarEquipo('${equipo}')">
          <i class="fas fa-trash"></i>
        </button>
      `;
      listaEquipos.appendChild(div);
    });
  }

  // Eliminar equipo de la liga
  window.eliminarEquipo = async function(nombreEquipo) {
    if (!confirm(`¿Estás seguro de eliminar "${nombreEquipo}" de la liga?`)) return;
    
    try {
      const equiposActualizados = ligaActual.EQUIPOS.filter(eq => eq !== nombreEquipo);
      
      const response = await fetch(`/api/ligas/${ligaActual.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EQUIPOS: equiposActualizados,
          NUM_EQUIPOS: equiposActualizados.length
        })
      });
      
      if (!response.ok) throw new Error('Error al eliminar equipo');
      
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
    const nuevoNombre = document.getElementById('modal-nombre').value.trim();
    
    if (!nuevoNombre) {
      alert('El nombre no puede estar vacío');
      return;
    }
    
    try {
      const response = await fetch(`/api/ligas/${ligaActual.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ NOMBRE: nuevoNombre })
      });
      
      if (!response.ok) throw new Error('Error al actualizar nombre');
      
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
      const equiposCategoria = todosEquipos.filter(eq => 
        eq.CATEGORIA === ligaActual.CATEGORIA && 
        !ligaActual.EQUIPOS?.includes(eq.EQUIPO)
      );
      
      if (equiposCategoria.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center">No hay equipos disponibles para añadir</p>';
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
            ${equipo.EQUIPO}
          </label>
        `;
        
        const checkbox = div.querySelector('input');
        checkbox.addEventListener('change', (e) => {
          if (e.target.checked) {
            equiposNuevos.push(equipo.EQUIPO);
          } else {
            equiposNuevos = equiposNuevos.filter(eq => eq !== equipo.EQUIPO);
          }
        });
        
        container.appendChild(div);
      });
      
    } catch (error) {
      console.error('Error:', error);
      container.innerHTML = '<p class="text-red-500 text-center">Error al cargar equipos</p>';
    }
  }

  // Confirmar añadir equipos
  document.getElementById('btn-confirmar-equipos').addEventListener('click', async () => {
    if (equiposNuevos.length === 0) {
      alert('Selecciona al menos un equipo');
      return;
    }
    
    try {
      const equiposActualizados = [...(ligaActual.EQUIPOS || []), ...equiposNuevos];
      
      const response = await fetch(`/api/ligas/${ligaActual.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          EQUIPOS: equiposActualizados,
          NUM_EQUIPOS: equiposActualizados.length
        })
      });
      
      if (!response.ok) throw new Error('Error al añadir equipos');
      
      ligaActual.EQUIPOS = equiposActualizados;
      ligaActual.NUM_EQUIPOS = equiposActualizados.length;
      mostrarEquiposLiga(equiposActualizados);
      document.getElementById('seccion-anadir-equipos').classList.add('hidden');
      cargarLigas();
      
      alert(`${equiposNuevos.length} equipo(s) añadido(s) correctamente`);
      equiposNuevos = [];
    } catch (error) {
      console.error('Error:', error);
      alert('Error al añadir equipos: ' + error.message);
    }
  });

  // Cancelar añadir equipos
  document.getElementById('btn-cancelar-equipos').addEventListener('click', () => {
    document.getElementById('seccion-anadir-equipos').classList.add('hidden');
    equiposNuevos = [];
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

  // Cargar ligas al iniciar
  await cargarLigas();
});
