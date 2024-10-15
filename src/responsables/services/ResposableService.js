import backend from "@/backend.js";

export class ResponsableService {

    static async all(page) {
        return (await backend.get(`responsable?page=${page}`)).data ?? [];
    }

}