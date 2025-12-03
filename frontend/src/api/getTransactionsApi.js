import api from "./api";

export async function getMyTransactions(filters = {}) {
    try {
      const res = await api.get("/users/me/transactions", { params: filters });
      return res.data; 
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      return {
        count: 0,
        results: []
    };
    }
}

{/* we are assuming 'recent' transactions are transactions of higher ID numbers*/}
export async function getRecentTransactions() {
    try {
        const res = await api.get("/users/me/transactions");
        const all_transactions = res.data.results;
        const sorted_transactions = all_transactions.sort((a, b) => b.id - a.id);
        const recent_ten = sorted_transactions.slice(0, 10);
        return {
          count: recent_ten.length,
          results: recent_ten
        }
    } catch (err) {
        console.error("failed to get recent transactions.", err);
        return {
            count: 0,
            results: []
        };
    }
}

export async function getAllTransactions(filters = {}) {
  try {
    const res = await api.get("/transactions", { params: filters });
    return res.data; 
  } catch (err) {
    console.error("Failed to fetch transactions:", err);
    return {
      count: 0,
      results: []
  };
  }
}