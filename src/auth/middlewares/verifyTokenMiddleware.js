// auth/middlewares/verifyTokenMiddleware.js
import { AuthService } from '../services/AuthService';

export const verifyTokenMiddleware = async (to, from, next) => {
  console.log('Verificando middleware...');
  
  // Si va a login, permitir
  if (to.path === '/login') {
    next();
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    next('/login');
    return;
  }

  const user = AuthService.getLoggedUser();
  console.log('Usuario actual:', user);
  console.log('Aceptó términos:', user?.aceptoTerminos);

  // Si está logueado pero no aceptó términos
  if (user && !user.aceptoTerminos && to.path !== '/terminos') {
    console.log('Redirigiendo a términos...');
    next('/terminos');
    return;
  }

  next();
};