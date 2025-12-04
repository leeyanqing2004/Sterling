import api from "./api";

export async function getAllUsers(filters = {}) {
    try {
      const res = await api.get("/users", { params: filters });
      return res.data; 
    } catch (err) {
      console.error("Failed to fetch users:", err);
      return {
        count: 0,
        results: []
    }
    }
}