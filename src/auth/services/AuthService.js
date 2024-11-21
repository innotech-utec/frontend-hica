import backend from "@/backend.js";
import {token} from "@/auth/helpers/token.js"

export class AuthService {

    static async login(email, password) {
        const response = await backend.post("login", {
            email,
            password
        });

        token(response.data.data.token);

        return response.data.data;
    }

}