import axios from "axios";
import { API_BASE_URL } from "./config";
import { TokenService } from "./auth/services/TokenService";
import { router } from './router';

const backend = axios.create({
    baseURL: API_BASE_URL
});

// Interceptor para añadir el token en las cabeceras de cada solicitud
backend.interceptors.request.use((config) => {
    const token = TokenService.get();  // Obtener el token

    if (token) {
        // Añadir el token a la cabecera de autorización con "Bearer"
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Añadir interceptor para manejar errores de respuesta
backend.interceptors.response.use(
    (response) => response,
    (error) => {
       
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Eliminar el token
            TokenService.remove();
            // Redirigir a login
            router.push({ name: 'login' });
        }
        return Promise.reject(error);
    }
);

export default backend;

