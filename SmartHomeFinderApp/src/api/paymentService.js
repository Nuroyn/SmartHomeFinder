import api from "./api";

// Initialize Paystack payment and return authorization URL plus fee breakdown
export async function initiatePaystackPayment(propertyId) {
  const res = await api.post("/api/payments/paystack/initiate", {
    property_id: propertyId,
  });
  return res.data;
}

// Verify a Paystack payment by reference
export async function verifyPaystackPayment(reference) {
  const res = await api.get("/api/payments/verify", {
    params: { reference },
  });
  return res.data;
}

// Provision or fetch a dedicated Paystack virtual account for the current user
export async function provisionVirtualAccount(preferredBank) {
  const res = await api.post(
    "/api/payments/paystack/virtual-account",
    preferredBank ? { preferred_bank: preferredBank } : {}
  );
  return res.data;
}

// Fetch recent transactions for the authenticated user
export async function fetchMyTransactions() {
  const res = await api.get("/api/v1/transactions/my");
  return res.data?.transactions || [];
}
