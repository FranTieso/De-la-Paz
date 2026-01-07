const { db } = require('../config/firebase');

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

function normalizeTeamName(x) {
  return (x ?? '').toString().trim();
}

function compareTeams(a, b) {
  // PTS desc
  if (b.pts !== a.pts) return b.pts - a.pts;
  // DG desc
  const dga = a.gf - a.gc;
  const dgb = b.gf - b.gc;
  if (dgb !== dga) return dgb - dga;
  // GF desc
  if (b.gf !== a.gf) return b.gf - a.gf;
  // Nombre asc
  return a.equipo.localeCompare(b.equipo, 'es', { sensitivity: 'base' });
}

/**
 * Calcula la clasificación a partir de PARTIDOS (solo partidos con marcador).
 * Devuelve array: [{ equipo, pj, pg, pe, pp, gf, gc, dg, pts }]
 */
async function obtenerClasificacionPorLiga(ligaId) {
  if (!ligaId) throw new Error('ligaId es obligatorio');

  const snapshot = await db.collection('PARTIDOS')
    .where('ligaId', '==', ligaId)
    .get();

  if (snapshot.empty) return [];

  const partidos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const tabla = {};

  for (const p of partidos) {
    if (!hasScore(p)) continue;

    const local = normalizeTeamName(p.local ?? p.LOCAL ?? p.equipo1);
    const visitante = normalizeTeamName(p.visitante ?? p.VISITANTE ?? p.equipo2);
    if (!local || !visitante) continue;

    const gl = getScoreLocal(p);
    const gv = getScoreVisitante(p);

    if (!tabla[local]) tabla[local] = { equipo: local, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    if (!tabla[visitante]) tabla[visitante] = { equipo: visitante, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };

    // PJ + GF/GC
    tabla[local].pj++; tabla[local].gf += gl; tabla[local].gc += gv;
    tabla[visitante].pj++; tabla[visitante].gf += gv; tabla[visitante].gc += gl;

    // Resultado
    if (gl > gv) {
      tabla[local].pg++; tabla[local].pts += 3;
      tabla[visitante].pp++;
    } else if (gl < gv) {
      tabla[visitante].pg++; tabla[visitante].pts += 3;
      tabla[local].pp++;
    } else {
      tabla[local].pe++; tabla[local].pts += 1;
      tabla[visitante].pe++; tabla[visitante].pts += 1;
    }
  }

  const clasificacion = Object.values(tabla).map(t => ({
    ...t,
    dg: t.gf - t.gc
  }));

  clasificacion.sort(compareTeams);

  // Añadimos posición (1..n)
  return clasificacion.map((row, idx) => ({ pos: idx + 1, ...row }));
}

module.exports = {
  obtenerClasificacionPorLiga
};
