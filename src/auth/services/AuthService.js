import backend from "@/backend.js";
import { token } from "@/auth/helpers/token.js";

export class AuthService {
  static async login(email, password) {
    const response = await backend.post("login", { email, password });

    // Guardar el token
    token(response.data.data.token);

    // Guardar la información del usuario en localStorage
    const user = {
      nombre: response.data.data.nombre,
      apellido: response.data.data.apellido,
      isAdmin: response.data.data.isAdmin, // Admin o Veterinario
    };
    localStorage.setItem("user", JSON.stringify(user)); // Guardamos al usuario logueado

    return response.data.data;
  }

  // Obtener los datos del usuario logueado
  static getLoggedUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
}
