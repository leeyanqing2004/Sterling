import api from "./api";

export async function getPromotions(filters = {}) {
    // this api call will automatically only get AVAILABLE promotions if user is regular/cashier,
    // and will automatically get ALL promotions if user is manager/superuser.
    try {
      const res = await api.get("/promotions", { params: filters });
      return res.data; 
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      return {
        count: 0,
        results: []
    };
    }
}