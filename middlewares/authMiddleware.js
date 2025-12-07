// middlewares/authMiddleware.js

// Verifica que el usuario haya iniciado sesión
function ensureAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }

  req.flash('error', 'Debes iniciar sesión para acceder a esta sección');
  return res.redirect('/auth/login');
}

// Verifica que el usuario sea administrador
function ensureAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.rol === 'admin') {
    return next();
  }

  req.flash('error', 'No tienes permisos para realizar esta acción');
  return res.redirect('/');
}

module.exports = {
  ensureAuth,
  ensureAdmin
};
