// middlewares/permissions.js

// Devuelve roles como array ["admin","delegado","entrenador"] aunque roles sea objeto
const getRoles = (user) => {
  if (!user) return [];

  // roles como ARRAY
  if (Array.isArray(user.roles)) return user.roles;

  // role como STRING (legacy)
  if (typeof user.role === "string") return [user.role];

  // roles como OBJETO
  if (user.roles && typeof user.roles === "object") {
    return Object.keys(user.roles);
  }

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

  // Si decidimos soportar varios equipos por rol, aquí se ampliaría.
  return ids;
};

// Require: usuario sea admin
/*
const requireAdmin = (req, res, next) => {
  // Acepta el nuevo formato
  const isAdmin = req.user?.roles?.admin === true;

  // Compatibilidad por si aún hay docs antiguos o tokens viejos con "administrador"
  const isAdministrador = req.user?.roles?.administrador === true;

  if (isAdmin || isAdministrador) return next();

  return res.status(403).json({ success: false, error: 'Forbidden' });
};
*/

// Require: usuario tenga al menos uno de los roles permitidos
const requireAnyRole = (...allowed) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Unauthorized" });

  const roles = getRoles(req.user);
  const ok = allowed.some((r) => roles.includes(r));

  if (!ok) return res.status(403).json({ success: false, error: "Forbidden" });
  next();
};

// Require: admin o que el equipoId del usuario coincida con el equipoId “objetivo”
const requireOwnTeamOrAdmin = (getTeamIdFromReq) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, error: "Unauthorized" });

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
  requireOwnTeamOrAdmin
};
