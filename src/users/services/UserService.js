import backend from "@/backend.js";

export class UserService {

    static async all(page) {
        return (await backend.get(`usuarios?page=${page}`)).data ?? [];
    }

}