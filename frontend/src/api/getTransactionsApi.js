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

{/* we are assuming 'recent' transactions are transactions of higher ID numbers*/ }
export async function getRecentTransactions() {
  try {
    const res = await api.get("/users/me/transactions", { params: { page: 1, limit: 10 } });
    const all_transactions = res.data?.results || [];
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

// Create a purchase transaction
export async function createPurchase({ utorid, spent, promotionIds = [], remark = "" }) {
  const payload = {
    type: "purchase",
    utorid,
    spent,
    promotionIds,
    remark,
  };
  const resp = await api.post("/transactions", payload);
  return resp.data;
}

// Lookup a redemption by transaction id (cashier-safe)
export async function getRedeemableById(transactionId) {
  const resp = await api.get(`/transactions/${transactionId}/redeemable`);
  return resp.data;
}

// Process a redemption
export async function processRedemption(transactionId) {
  const resp = await api.patch(`/transactions/${transactionId}/processed`, { processed: true });
  return resp.data;
}
