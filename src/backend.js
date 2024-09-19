import axios from "axios";
import { API_BASE_URL } from "./config";
import { TokenService } from "./auth/services/TokenService";

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

export default backend;

