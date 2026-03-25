// Commission calculation helper
export const calculateFees = ({ purpose, price, buyerRate = 0.05, sellerRate = 0 }) => {
  const amount = Number(price) || 0;
  const isRent = purpose === "Rent";
  const isSell = purpose === "Sell";

  let buyerFee = 0;
  let sellerFee = 0;

  if (isRent) {
    buyerFee = amount * buyerRate;
    sellerFee = 0;
  }

  if (isSell) {
    buyerFee = amount * buyerRate;
    sellerFee = amount * sellerRate;
  }

  return {
    buyerFee,
    sellerFee,
    totalFee: buyerFee + sellerFee,
  };
};
