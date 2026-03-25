import api from "./api";

export const fetchWishlist = async () => {
  const res = await api.get("/api/users/wishlist");
  return res.data.wishlist || [];
};

export const fetchWishlistIds = async () => {
  const res = await api.get("/api/users/wishlist/ids");
  return res.data.ids || [];
};

export const addToWishlist = async (propertyId) => {
  const res = await api.post("/api/users/wishlist", { property_id: propertyId });
  return res.data;
};

export const removeFromWishlist = async (propertyId) => {
  const res = await api.delete(`/api/users/wishlist/${propertyId}`);
  return res.data;
};
