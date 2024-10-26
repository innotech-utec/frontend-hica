import backend from "@/backend.js";

export class AnimalService {

    static async all(page) {
        return (await backend.get(`animal?page=${page}`)).data ?? [];
    }

}