export const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") return "Price on request";
  const num = Number(value);
  if (Number.isNaN(num)) return `${value}`;
  return `₦${num.toLocaleString("en-NG")}`;
};
