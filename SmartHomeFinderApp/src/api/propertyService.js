import api from "./api";

export const fetchAdminProperties = async ({ page = 1, limit = 10, search = "" }) => {
	const params = new URLSearchParams({ page: String(page), limit: String(limit) });
	if (search) params.append("q", search);

	const res = await api.get(`/api/admin/properties?${params.toString()}`);

	return res.data;
};

// Public: fetch approved & published properties for the home screen
export const fetchPublicProperties = async () => {
	const res = await api.get("/api/users/properties");
	return res.data.properties || [];
};

// Public: search properties with filters and pagination
export const searchProperties = async ({ q = "", purpose = "", minPrice = "", maxPrice = "", page = 1, limit = 12 } = {}) => {
	const params = new URLSearchParams();
	if (q) params.append("q", q);
	if (purpose && purpose !== "any") params.append("purpose", purpose);
	if (minPrice) params.append("minPrice", minPrice);
	if (maxPrice) params.append("maxPrice", maxPrice);
	params.append("page", String(page));
	params.append("limit", String(limit));

	const res = await api.get(`/api/users/properties?${params.toString()}`);
	return res.data;
};

// Public: fetch a single approved & published property by id
export const fetchPublicProperty = async (id) => {
	const res = await api.get(`/api/users/properties/${id}`);
	return res.data.property || null;
};

// Landlord: fetch own properties history
export const fetchMyProperties = async () => {
	const res = await api.get("/api/users/properties/mine");
	return res.data.properties || [];
};

export const updateVerifyLocation = async (id, { latitude, longitude }) => {
	const res = await api.patch(
		`/api/users/properties/${id}/verify-location`,
		{ latitude, longitude }
	);
	return res.data.property;
};

export const approveProperty = async (id) => {
	const res = await api.put(`/api/admin/properties/${id}/approve`);
	return res.data.property;
};

export const rejectProperty = async (id) => {
	const res = await api.put(`/api/admin/properties/${id}/reject`);
	return res.data.property;
};

export const togglePublish = async (id) => {
	const res = await api.put(`/api/admin/properties/${id}/toggle-publish`);
	return res.data.property;
};

export const deletePropertyAdmin = async (id) => {
	const res = await api.delete(`/api/admin/properties/${id}`);
	return res.data;
};
