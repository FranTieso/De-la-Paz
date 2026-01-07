const { db } = require('../config/firebase');

/**
 * Helpers para detectar si un partido tiene marcador
 */
function getScoreLocal(p) {
  const v = (p.GOLESLOCAL ?? p.goles_local ?? p.goles1 ?? p.homeScore ?? p.golesLocal);
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function getScoreVisitante(p) {
  const v = (p.GOLESVISITANTE ?? p.goles_visitante ?? p.goles2 ?? p.awayScore ?? p.golesVisitante);
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function hasScore(p) {
  const gl = getScoreLocal(p);
  const gv = getScoreVisitante(p);
  return gl !== null && gv !== null;
}

function toDate(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate(); // Firestore Timestamp
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Devuelve resultados (partidos con marcador) desde la colección PARTIDOS.
 * - Si ligaId viene informado, filtra por ligaId.
 * - Ordena por fecha DESC (y por jornada DESC si aplica) en JavaScript para evitar índices compuestos.
 */
async function obtenerResultados({ ligaId = null, limit = null } = {}) {
  let query = db.collection('PARTIDOS');

  if (ligaId) {
    query = query.where('ligaId', '==', ligaId);
  }

  const snapshot = await query.get();
  if (snapshot.empty) return [];

  const partidos = snapshot.docs.map(doc => {
    const data = doc.data();
    return { id: doc.id, ...data };
  });

  const resultados = partidos
    .map(p => {
      const fecha = toDate(p.fecha ?? p.FECHA ?? p.fechaPartido);
      const jornada = p.jornada ?? p.JORNADA ?? null;

      // Normalizamos nombres de equipos
      const local = p.local ?? p.LOCAL ?? p.equipo1 ?? null;
      const visitante = p.visitante ?? p.VISITANTE ?? p.equipo2 ?? null;

      const golesLocal = getScoreLocal(p);
      const golesVisitante = getScoreVisitante(p);

      return {
        ...p,
        id: p.id,
        ligaId: p.ligaId ?? null,
        jornada,
        fecha,
        local,
        visitante,
        golesLocal,
        golesVisitante,
        estado: p.estado ?? p.ESTADO ?? null
      };
    })
    .filter(p => p.local && p.visitante && hasScore(p) && p.fecha);

  resultados.sort((a, b) => {
    // Por fecha DESC
    const fa = new Date(a.fecha).getTime();
    const fb = new Date(b.fecha).getTime();
    if (fb !== fa) return fb - fa;

    // Por jornada DESC si existe
    const ja = Number(a.jornada ?? 0);
    const jb = Number(b.jornada ?? 0);
    return jb - ja;
  });

  if (limit && Number(limit) > 0) {
    return resultados.slice(0, Number(limit));
  }

  return resultados;
}

module.exports = {
  obtenerResultados
};
