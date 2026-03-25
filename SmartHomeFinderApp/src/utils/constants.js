// User roles
export const ROLES = {
  TENANT: "tenant",
  LANDLORD: "landlord",
  ADMIN: "admin",
};

// Property purpose
export const PURPOSE = {
  RENT: "Rent",
  SELL: "Sell",
};

// Property status labels
export const PROPERTY_STATUS = {
  PUBLISHED: "Published",
  APPROVED: "Approved",
  PENDING: "Pending / Rejected",
};

// Transaction types
export const TX_TYPE = {
  CREDIT: "credit",
  DEBIT: "debit",
};

// Commission rates (must match backend commission_settings defaults)
export const COMMISSION = {
  BUYER_RATE: 0.05,
  SELLER_RATE_SELL: 0.05,
  SELLER_RATE_RENT: 0,
};

// Currency
export const CURRENCY = "₦";
export const CURRENCY_CODE = "NGN";

// localStorage keys
export const LS_KEYS = {
  TOKEN: "token",
  USER: "user",
  IS_LOGGED_IN: "isLoggedIn",
  PROPERTIES_CACHE: "app_properties_v1",
  IMG_CARDS_CACHE: "app_img_cards_v1",
};

// Contact emails
export const EMAILS = {
  SUPPORT: "support@smarthomefinder.com",
  PRIVACY: "privacy@smarthomefinder.com",
  HELLO: "hello@smarthome.ng",
};
