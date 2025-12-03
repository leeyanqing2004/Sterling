import api from "./api";

export async function getMyPoints() {
    try {
      const res = await api.get("/users/me");
      return res.data.points; 
    } catch (err) {
      console.error("Failed to fetch current user's points:", err);
      return 0;
    }
}