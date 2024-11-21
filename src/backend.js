import axios from "axios";
import { API_BASE_URL } from "./config";
import { TokenService } from "./auth/services/TokenService";

const backend = axios.create({
    baseURL: API_BASE_URL
});

backend.interceptors.request.use((config) => {
    const token = TokenService.get();

    if (token) {
        config.headers.Authorization = token;
    }

    return config;
});

export default backend;