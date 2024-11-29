import backend from "@/backend.js";
import { token } from "@/auth/helpers/token.js";

export class AuthService {
  static async login(email, password) {
    const response = await backend.post("login", { email, password });

    // Guardar el token
    token(response.data.data.token);
    //console.log(response.data.user.id);
    console.log(response.data.data.token);
    console.log(response.data.data.user);

    // Guardar la información del usuario en localStorage
    const user = response.data.data.user
    localStorage.setItem("user", JSON.stringify(user)); // Guardamos al usuario logueado

    return response.data.data;
  }

  // Obtener los datos del usuario logueado
  static getLoggedUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  static verificarTerminos() {
    const user = this.getLoggedUser();
    return user?.aceptoTerminos || false;
  }
  static async aceptarTerminos() {
    const response = await backend.post("users/aceptar-terminos");
    const user = this.getLoggedUser();
    if (user) {
      user.aceptoTerminos = true;
      localStorage.setItem("user", JSON.stringify(user));
    }
    return response.data;
  

  }
}
