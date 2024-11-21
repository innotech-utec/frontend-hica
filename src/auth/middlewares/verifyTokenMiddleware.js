import { TokenService } from '../services/TokenService.js';
import backend from '@/backend.js';

export const verifyTokenMiddleware = async (to, from, next) => {

    if (!to.meta.requiresAuth) {
        return next();
    }

    const token = TokenService.get();

    //Si no esta logueado redirige a login
    if (!token) {
        next({ name: 'login' });
    }

    const response = await backend.get('token/verify');

    if (!response.data.data.response) {
        next({ name: '403' });
    }

    next();
}