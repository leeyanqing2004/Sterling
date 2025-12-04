import api from "./api";

export async function registerUser(payload) {
    const response = await api.post("/users", payload);
    return response.data;
}


