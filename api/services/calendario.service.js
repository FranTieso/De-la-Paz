const partidosService = require('./partidos.service');

function toDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate(); // Firestore Timestamp
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function normalizeMatch(p) {
  const jornada = Number(p.jornada ?? p.JORNADA ?? 0) || 0;
  const fecha = toDate(p.fecha ?? p.FECHA ?? null);

  const home = (p.local ?? p.LOCAL ?? p.equipo1 ?? '').toString().trim();
  const away = (p.visitante ?? p.VISITANTE ?? p.equipo2 ?? '').toString().trim();

  return { jornada, fecha, home, away };
}

/**
 * Devuelve el calendario agrupado por jornadas:
 * [{ number: 1, date: <Date|null>, matches: [{home, away}, ...] }, ...]
 */
async function obtenerCalendarioPorLiga(ligaId) {
  const partidos = await partidosService.obtenerPartidosPorLiga(ligaId);

  const normalizados = (Array.isArray(partidos) ? partidos : [])
    .map(normalizeMatch)
    .filter(m => m.jornada > 0 && m.home && m.away);

  // Agrupar por jornada
  const map = new Map();
  for (const m of normalizados) {
    if (!map.has(m.jornada)) map.set(m.jornada, []);
    map.get(m.jornada).push(m);
  }

  // Construir rounds
  const rounds = Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([jornada, matches]) => {
      // fecha "representativa": la primera con fecha válida
      const date = matches.map(x => x.fecha).find(Boolean) || null;

      return {
        number: jornada,
        date, // Date o null
        matches: matches.map(x => ({ home: x.home, away: x.away }))
      };
    });

  return rounds;
}

module.exports = { obtenerCalendarioPorLiga };
