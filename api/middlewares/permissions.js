// api/middlewares/permissions.js

// Normaliza nombres legacy: "administrador" -> "admin"
const normalizeRole = (r) => {
  const role = String(r || "").toLowerCase().trim();
  if (role === "administrador") return "admin";
  return role;
};

// Devuelve roles como array ["admin","delegado","entrenador"] aunque roles sea objeto
const getRoles = (user) => {
  if (!user) return [];

  // roles como ARRAY
  if (Array.isArray(user.roles)) return user.roles.map(normalizeRole);

  // roles como OBJETO { admin: true, delegado: {equipoId:...} }
  if (user.roles && typeof user.roles === "object") {
    return Object.keys(user.roles).map(normalizeRole);
  }

  // rol como STRING (legacy): admite "rol" (castellano) y "role" (inglés)
  const single = user.rol || user.role;
  if (typeof single === "string") return [normalizeRole(single)];

  return [];
};

// Devuelve los equipoId asociados al usuario (delegado y/o entrenador)
const getTeamIds = (user) => {
  if (!user || !user.roles || typeof user.roles !== "object") return [];

  const ids = [];
  const delegadoId = user.roles?.delegado?.equipoId;
  const entrenadorId = user.roles?.entrenador?.equipoId;

  if (delegadoId) ids.push(delegadoId);
  if (entrenadorId) ids.push(entrenadorId);

  return ids;
};

const requireAnyRole = (...allowed) => {
  const allowedNorm = allowed.map(normalizeRole);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Token no proporcionado" });
    }

    const roles = getRoles(req.user);
    const ok = roles.some((r) => allowedNorm.includes(r));

    if (!ok) {
      return res.status(403).json({ success: false, error: "No autorizado" });
    }
    next();
  };
};

// Admin = "admin" (y aceptamos "administrador" por normalización)
const requireAdmin = requireAnyRole("admin", "administrador");

// Intenta extraer equipoId desde params/body de forma genérica
const getTeamIdFromReq = (req) => {
  return (
    req.params?.equipoId ||
    req.params?.teamId ||
    req.body?.equipoId ||
    req.body?.teamId ||
    null
  );
};

// Permite si es admin o si el equipo del token coincide con el equipo del recurso
const requireOwnTeamOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Token no proporcionado" });
  }

  const roles = getRoles(req.user);
  if (roles.includes("admin")) return next();

  const targetTeamId = getTeamIdFromReq(req);
  const myTeamIds = getTeamIds(req.user);

  if (!targetTeamId || !myTeamIds.includes(targetTeamId)) {
    return res.status(403).json({ success: false, error: "Not allowed for this team" });
  }

  next();
};

module.exports = {
  getRoles,
  getTeamIds,
  requireAdmin,
  requireAnyRole,
  requireOwnTeamOrAdmin,
};

