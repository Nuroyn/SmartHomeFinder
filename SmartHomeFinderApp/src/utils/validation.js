const EMAIL_REGEX = /\S+@\S+\.\S+/;
const PHONE_REGEX = /^(\+?234|0)[789]\d{9}$/;
const MIN_PASSWORD_LENGTH = 6;

export const validateEmail = (email) => {
  if (!email) return "Email is required";
  if (!EMAIL_REGEX.test(email)) return "Email is invalid";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  return "";
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) return "Passwords must match";
  return "";
};

export const validateRequired = (value, fieldName = "This field") => {
  if (!value || (typeof value === "string" && !value.trim()))
    return `${fieldName} is required`;
  return "";
};

export const validatePhone = (phone) => {
  if (!phone) return "Phone is required";
  if (!PHONE_REGEX.test(phone.replace(/\s/g, "")))
    return "Enter a valid Nigerian phone number";
  return "";
};

export const validateImages = (images) => {
  if (!images || images.length === 0)
    return "Upload at least one image before submitting.";
  return "";
};

// Run a map of { fieldName: validatorResult } and return only non-empty errors
export const collectErrors = (checks) => {
  const errors = {};
  for (const [key, message] of Object.entries(checks)) {
    if (message) errors[key] = message;
  }
  return errors;
};

export const hasErrors = (errorObj) => Object.keys(errorObj).length > 0;
