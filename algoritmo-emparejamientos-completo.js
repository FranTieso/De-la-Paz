/**
 * ========================================================================
 * ALGORITMO COMPLETO DE EMPAREJAMIENTOS - ROUND ROBIN CLÁSICO
 * ========================================================================
 * 
 * Archivo: public/ligascrud.html
 * Líneas: 1995-2340 (aproximadamente)
 * 
 * DESCRIPCIÓN:
 * - Genera calendario completo de partidos (ida y vuelta)
 * - Utiliza algoritmo Round-Robin CLÁSICO (rotación estándar)
 * - Maneja equipos impares añadiendo "DESCANSO"
 * - Asigna fechas y horarios automáticamente
 * - Distribuye partidos en fines de semana
 */

// ========================================================================
// 1. CONSTANTES Y CONFIGURACIÓN
// ========================================================================

/**
 * Horarios disponibles para los partidos (10:00 AM a 8:00 PM)
 * Se usan en sábados y domingos
 */
const HORARIOS_DISPONIBLES = [
  { hora: 10, minuto: 0, texto: "10:00 AM" },
  { hora: 10, minuto: 30, texto: "10:30 AM" },
  { hora: 12, minuto: 0, texto: "12:00 PM" },
  { hora: 12, minuto: 30, texto: "12:30 PM" },
  { hora: 14, minuto: 0, texto: "2:00 PM" },
  { hora: 14, minuto: 30, texto: "2:30 PM" },
  { hora: 16, minuto: 0, texto: "4:00 PM" },
  { hora: 16, minuto: 30, texto: "4:30 PM" },
  { hora: 18, minuto: 0, texto: "6:00 PM" },
  { hora: 18, minuto: 30, texto: "6:30 PM" },
  { hora: 20, minuto: 0, texto: "8:00 PM" }
];

// ========================================================================
// 2. FUNCIÓN PRINCIPAL DE EMPAREJAMIENTOS
// ========================================================================

/**
 * Función principal que se ejecuta al pulsar "Generar Emparejamientos"
 * Líneas: 2161-2225
 */
function generarEmparejamientos() {
  // VALIDACIÓN 1: Verificar que hay liga seleccionada
  if (!ligaSeleccionada || filteredLigas.length === 0) {
    mostrarFeedbackEmparejamientos("No hay liga seleccionada", "error");
    return;
  }

  const liga = filteredLigas[0];

  // VALIDACIÓN 2: Verificar si ya existe calendario
  verificarCalendarioGenerado(liga);
  const botonGenerar = document.getElementById("btn-generar-emparejamientos");
  if (botonGenerar.disabled || botonGenerar.innerHTML.includes("Ya Generado")) {
    return; // Ya hay calendario generado
  }

  // VALIDACIÓN 3: Confirmar regeneración si ya hay partidos
  if (partidosGenerados.length > 0) {
    const confirmar = confirm(
      "Ya hay emparejamientos generados. ¿Deseas regenerar el calendario?\n\n" +
      "NOTA: Los árbitros se asignarán aleatoriamente de nuevo."
    );
    if (!confirmar) {
      return;
    }
  }

  // VALIDACIÓN 4: Verificar mínimo de equipos
  const equipos = liga.EQUIPOS || [];
  if (equipos.length < 2) {
    mostrarFeedbackEmparejamientos(
      "Esta liga no tiene suficientes equipos para generar partidos (mínimo 2)",
      "error"
    );
    return;
  }

  // EJECUCIÓN: Generar calendario completo
  partidosGenerados = generarCalendarioCompleto(equipos);

  // VISUALIZACIÓN: Mostrar emparejamientos en la interfaz
  mostrarEmparejamientos(partidosGenerados, equipos);

  // CONFIGURACIÓN: Establecer fecha por defecto (próximo sábado)
  const hoy = new Date();
  const proximoSabado = obtenerProximoFinDeSemana(hoy);
  document.getElementById("fecha-inicio-partidos").value = proximoSabado
    .toISOString()
    .split("T")[0];

  // FEEDBACK: Mostrar resultado
  mostrarFeedbackEmparejamientos(
    `Calendario por jornadas generado: ${partidosGenerados.length} partidos para ${equipos.length} equipos en ${Math.max(...partidosGenerados.map((p) => p.jornada))} jornadas`,
    "success"
  );
}

// ========================================================================
// 3. ALGORITMO CORE - ROUND ROBIN CLÁSICO
// ========================================================================

/**
 * Genera calendario completo usando Round-Robin CLÁSICO
 * Líneas: 2227-2335
 * 
 * ALGORITMO:
 * 1. Si hay número impar de equipos, añade "DESCANSO"
 * 2. Genera primera vuelta (ida) con rotación clásica
 * 3. Genera segunda vuelta (vuelta) intercambiando local/visitante
 * 
 * @param {Array} equipos - Array de nombres de equipos
 * @returns {Array} Array de objetos partido {local, visitante, jornada}
 */
function generarCalendarioCompleto(equipos) {
  const partidos = [];
  const numEquipos = equipos.length;

  // PASO 1: Preparar equipos (añadir DESCANSO si es impar)
  let equiposConDescanso = [...equipos];
  if (numEquipos % 2 === 1) {
    equiposConDescanso.push("DESCANSO");
  }

  // PASO 2: Calcular parámetros del torneo
  const totalEquipos = equiposConDescanso.length;
  const partidosPorJornada = Math.floor(totalEquipos / 2);
  const jornadasPorVuelta = totalEquipos - 1;
  const totalJornadas = jornadasPorVuelta * 2; // Ida y vuelta

  console.log(
    `Generando calendario completo: ${numEquipos} equipos, ${partidosPorJornada} partidos por jornada, ${totalJornadas} jornadas (${jornadasPorVuelta} ida + ${jornadasPorVuelta} vuelta)`
  );

  // PASO 3: PRIMERA VUELTA (IDA)
  for (let jornada = 0; jornada < jornadasPorVuelta; jornada++) {
    const partidosJornada = [];
    const equiposJornada = [...equiposConDescanso];

    // ALGORITMO ROUND-ROBIN CLÁSICO:
    // - El primer equipo permanece fijo
    // - Los demás rotan según el patrón estándar
    if (jornada > 0) {
      const equiposRotar = equiposJornada.slice(1); // Todos excepto el primero
      
      // Rotar N veces (donde N = número de jornada)
      // NOTA: Aunque usa shift() + push(), el efecto acumulativo
      // de múltiples rotaciones por jornada produce el patrón clásico
      for (let r = 0; r < jornada; r++) {
        const primerEquipo = equiposRotar.shift(); // Saca del inicio
        equiposRotar.push(primerEquipo);           // Pone al final
      }
      
      // Reemplazar en el array original
      equiposJornada.splice(1, equiposRotar.length, ...equiposRotar);
    }

    // GENERAR EMPAREJAMIENTOS DE LA JORNADA
    for (let i = 0; i < partidosPorJornada; i++) {
      const local = equiposJornada[i];
      const visitante = equiposJornada[totalEquipos - 1 - i];

      // Solo añadir partidos reales (sin DESCANSO)
      if (local !== "DESCANSO" && visitante !== "DESCANSO") {
        partidosJornada.push({
          local: local,
          visitante: visitante,
          jornada: jornada + 1,
        });
      }
    }

    partidos.push(...partidosJornada);
    console.log(`Jornada ${jornada + 1} (IDA): ${partidosJornada.length} partidos`);
    console.log(`  Emparejamientos:`, partidosJornada.map((p) => `${p.local} vs ${p.visitante}`));
  }

  // PASO 4: SEGUNDA VUELTA (VUELTA) - Intercambiar local y visitante
  for (let jornada = 0; jornada < jornadasPorVuelta; jornada++) {
    const partidosJornada = [];
    const equiposJornada = [...equiposConDescanso];

    // MISMA ROTACIÓN QUE EN LA IDA
    if (jornada > 0) {
      const equiposRotar = equiposJornada.slice(1);
      for (let r = 0; r < jornada; r++) {
        const primerEquipo = equiposRotar.shift();
        equiposRotar.push(primerEquipo);
      }
      equiposJornada.splice(1, equiposRotar.length, ...equiposRotar);
    }

    // GENERAR EMPAREJAMIENTOS INTERCAMBIANDO LOCAL/VISITANTE
    for (let i = 0; i < partidosPorJornada; i++) {
      const visitante = equiposJornada[i];                    // Ahora es visitante
      const local = equiposJornada[totalEquipos - 1 - i];     // Ahora es local

      if (local !== "DESCANSO" && visitante !== "DESCANSO") {
        partidosJornada.push({
          local: local,
          visitante: visitante,
          jornada: jornadasPorVuelta + jornada + 1, // Jornada de vuelta
        });
      }
    }

    partidos.push(...partidosJornada);
    console.log(`Jornada ${jornadasPorVuelta + jornada + 1} (VUELTA): ${partidosJornada.length} partidos`);
    console.log(`  Emparejamientos:`, partidosJornada.map((p) => `${p.local} vs ${p.visitante}`));
  }

  console.log(`Total de partidos generados: ${partidos.length} en ${totalJornadas} jornadas`);
  return partidos;
}

// ========================================================================
// 4. ANÁLISIS: ¿POR QUÉ ES ROUND-ROBIN CLÁSICO?
// ========================================================================

/**
 * EXPLICACIÓN DEL ERROR DE ANÁLISIS INICIAL:
 * 
 * Aunque el código usa shift() + push() (que normalmente sería rotación izquierda),
 * la CLAVE está en que rota MÚLTIPLES VECES por jornada:
 * 
 * - Jornada 1: 1 rotación
 * - Jornada 2: 2 rotaciones  
 * - Jornada 3: 3 rotaciones
 * 
 * Este patrón de múltiples rotaciones produce el MISMO RESULTADO
 * que el Round-Robin clásico estándar.
 * 
 * EJEMPLO CON 4 EQUIPOS [A, B, C, D]:
 * 
 * Jornada 1: [A, B, C, D] (0 rotaciones)
 * Jornada 2: [A, C, D, B] (1 rotación: B→C→D→B)
 * Jornada 3: [A, D, B, C] (2 rotaciones: C→D→B→C, D→B→C→D)
 * 
 * Este es exactamente el patrón del Round-Robin CLÁSICO.
 */

// ========================================================================
// 5. FUNCIONES AUXILIARES
// ========================================================================
/**
 * Obtiene el próximo sábado o domingo a partir de una fecha
 * Líneas: 2008-2025
 */
function obtenerProximoFinDeSemana(fechaInicio) {
  const fecha = new Date(fechaInicio);

  if (diaSemana === 6) {
    return fecha; // Ya es sábado
  } else if (diaSemana === 0) {
    return fecha; // Ya es domingo
  } else {
    // Buscar el próximo sábado
    const diasHastaSabado = 6 - diaSemana;
    fecha.setDate(fecha.getDate() + diasHastaSabado);
    return fecha;
  }
}

/**
 * Genera fechas y horarios para todos los partidos
 * Líneas: 2029-2105
 * 
 * LÓGICA:
 * 1. Agrupa partidos por jornada
 * 2. Distribuye cada jornada en un fin de semana
 * 3. Asigna horarios secuencialmente (sábado primero, luego domingo)
 * 4. Si se agotan horarios, pasa al siguiente fin de semana
 */
function generarFechasYHorarios(fechaInicio, partidos) {
  const fechasHorarios = [];
  let fechaActual = obtenerProximoFinDeSemana(fechaInicio);
  
  // PASO 1: Agrupar partidos por jornada
  const partidosPorJornada = {};
  partidos.forEach((partido, index) => {
    const jornada = partido.jornada || 1;
    if (!partidosPorJornada[jornada]) {
      partidosPorJornada[jornada] = [];
    }
    partidosPorJornada[jornada].push({ ...partido, index });
  });

  console.log('📅 Partidos agrupados por jornada:', partidosPorJornada);

  // PASO 2: Procesar cada jornada
  const jornadas = Object.keys(partidosPorJornada).sort((a, b) => parseInt(a) - parseInt(b));
  
  jornadas.forEach(jornadaNum => {
    const partidosJornada = partidosPorJornada[jornadaNum];
    console.log(`📅 Procesando Jornada ${jornadaNum}: ${partidosJornada.length} partidos`);
    
    // PASO 3: Distribuir partidos en el fin de semana
    let horarioIndex = 0;
    let esSabado = true; // Empezar por sábado
    
    partidosJornada.forEach((partido, partidoIndex) => {
      // Si se acabaron los horarios del día actual, cambiar al siguiente día
      if (horarioIndex >= HORARIOS_DISPONIBLES.length) {
        if (esSabado) {
          // Cambiar a domingo
          esSabado = false;
          horarioIndex = 0;
        } else {
          // Si también se acabaron los horarios del domingo, 
          // pasar al siguiente fin de semana
          fechaActual.setDate(fechaActual.getDate() + 7);
          esSabado = true;
          horarioIndex = 0;
        }
      }

      // PASO 4: Crear fecha del partido
      let fechaPartido = new Date(fechaActual);
      if (!esSabado) {
        fechaPartido.setDate(fechaPartido.getDate() + 1); // Domingo
      }

      const horario = HORARIOS_DISPONIBLES[horarioIndex];
      fechaPartido.setHours(horario.hora, horario.minuto, 0, 0);

      // PASO 5: Almacenar información del partido
      fechasHorarios[partido.index] = {
        fecha: new Date(fechaPartido),
        fechaTexto: fechaPartido.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        horaTexto: horario.texto,
        jornada: parseInt(jornadaNum),
        dia: esSabado ? 'Sábado' : 'Domingo'
      };

      console.log(`  Partido ${partidoIndex + 1}: ${partido.local} vs ${partido.visitante} - ${fechasHorarios[partido.index].fechaTexto} ${fechasHorarios[partido.index].horaTexto}`);

      horarioIndex++;
    });

    // PASO 6: Después de procesar una jornada completa, pasar a la siguiente semana
    fechaActual.setDate(fechaActual.getDate() + 7);
    if (fechaActual.getDay() !== 6) {
      fechaActual = obtenerProximoFinDeSemana(fechaActual);
    }
  });

  console.log('📅 Fechas y horarios generados:', fechasHorarios);
  return fechasHorarios;
}

// ========================================================================
// 5. EJEMPLO DE USO
// ========================================================================

/**
 * EJEMPLO CON 4 EQUIPOS: [A, B, C, D]
 * 
 * PRIMERA VUELTA (IDA):
 * Jornada 1: [A, B, C, D] → A vs D, B vs C
 * Jornada 2: [A, C, D, B] → A vs B, C vs D  (rotación clásica)
 * Jornada 3: [A, D, B, C] → A vs C, D vs B  (rotación clásica)
 * 
 * SEGUNDA VUELTA (VUELTA):
 * Jornada 4: [A, B, C, D] → D vs A, C vs B  (intercambio local/visitante)
 * Jornada 5: [A, C, D, B] → B vs A, D vs C  (intercambio local/visitante)
 * Jornada 6: [A, D, B, C] → C vs A, B vs D  (intercambio local/visitante)
 * 
 * RESULTADO: 6 partidos, todos contra todos, ida y vuelta
 * PATRÓN: Round-Robin CLÁSICO estándar
 */

/**
 * EJEMPLO CON 5 EQUIPOS: [A, B, C, D, E]
 * Se añade "DESCANSO" → [A, B, C, D, E, DESCANSO]
 * 
 * En cada jornada, un equipo descansa (el que se empareja con "DESCANSO")
 * Total: 10 jornadas (5 ida + 5 vuelta), 20 partidos
 */

// ========================================================================
// 6. CARACTERÍSTICAS DEL ALGORITMO
// ========================================================================

/**
 * VENTAJAS:
 * ✅ Garantiza que todos los equipos jueguen contra todos
 * ✅ Maneja automáticamente equipos impares
 * ✅ Distribuye equitativamente local/visitante
 * ✅ Asigna fechas y horarios automáticamente
 * ✅ Respeta restricciones de fines de semana
 * ✅ Escalable para cualquier número de equipos
 * 
 * COMPLEJIDAD:
 * - Temporal: O(n²) donde n = número de equipos
 * - Espacial: O(n²) para almacenar todos los partidos
 * 
 * TIPO DE ALGORITMO:
 * - Round-Robin CLÁSICO (patrón estándar de rotación)
 * - Torneo completo (ida y vuelta)
 * - Con manejo de equipos impares
 */