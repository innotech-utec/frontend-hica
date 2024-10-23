import { TokenService } from '../services/TokenService.js';
import backend from '@/backend.js';

export const verifyTokenMiddleware = async (to, from, next) => {
    // Si la ruta no requiere autenticación, continuar.
    if (!to.meta.requiresAuth) {
        return next();
    }

    const token = TokenService.get();

    // Si no hay token, redirige inmediatamente al login.
    if (!token) {
        return next({ name: 'login' });
    }

    try {
        // Verifica el token con el backend
        const response = await backend.get('token/verify');

        if (response.data.data.response) {
            // Si el token es válido, permitir el acceso.
            return next();
        } else {
            // Si el token no es válido, redirigir al login.
            TokenService.remove();  // Remover token inválido.
            return next({ name: 'login' });
        }
    } catch (error) {
        // Si ocurre un error en la verificación, redirigir al login.
        TokenService.remove();  // Remover cualquier token inválido.
        return next({ name: 'login' });
    }
};
