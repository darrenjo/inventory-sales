import { getMembershipLevel } from "../config/membership.js";

export const calculateDiscountAndPoints = (totalPrice, totalSpentBefore) => {
  const membership = getMembershipLevel(totalSpentBefore + totalPrice);

  const discount = totalPrice * membership.discount;
  const finalPrice = totalPrice - discount;
  const pointsEarned =
    Math.floor(finalPrice / 100_000) * membership.pointsPer100k;

  return { membership, discount, finalPrice, pointsEarned };
};
