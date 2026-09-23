// Middleware de autorización por rol. Se usa DESPUÉS de verificarToken,
// porque depende de que req.usuario ya exista (con el rol incluido en el JWT).
function requireRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta acción' });
    }
    next();
  };
}

module.exports = requireRol;
