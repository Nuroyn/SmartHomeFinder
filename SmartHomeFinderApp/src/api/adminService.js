import api from "./api";

// ── Stats ──
export const fetchAdminStats = async () => {
	const res = await api.get("/api/admin/stats");
	return res.data;
};

// ── Users ──
export const fetchAdminUsers = async ({ page = 1, limit = 20, search = "", role = "" } = {}) => {
	const params = new URLSearchParams({ page: String(page), limit: String(limit) });
	if (search) params.append("q", search);
	if (role) params.append("role", role);
	const res = await api.get(`/api/admin/users?${params.toString()}`);
	return res.data;
};

export const updateUserRole = async (userId, role) => {
	const res = await api.put(`/api/admin/users/${userId}/role`, { role });
	return res.data.user;
};

// ── Transactions ──
export const fetchAdminTransactions = async ({ page = 1, limit = 20, status = "", paymentStatus = "" } = {}) => {
	const params = new URLSearchParams({ page: String(page), limit: String(limit) });
	if (status) params.append("status", status);
	if (paymentStatus) params.append("payment_status", paymentStatus);
	const res = await api.get(`/api/admin/transactions?${params.toString()}`);
	return res.data;
};

// ── Audit Logs ──
export const fetchAuditLogs = async ({ page = 1, limit = 30, action = "" } = {}) => {
	const params = new URLSearchParams({ page: String(page), limit: String(limit) });
	if (action) params.append("action", action);
	const res = await api.get(`/api/admin/audit-logs?${params.toString()}`);
	return res.data;
};
