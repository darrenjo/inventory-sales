import Customer from "../models/customer.js";
import { Transaction } from "../models/product.js";

export const updateMembership = async (customerId) => {
  const customer = await Customer.findByPk(customerId);
  if (!customer) return;

  // Hitung total belanja
  const totalSpent = await Transaction.sum("total_price", {
    where: { customer_id: customerId },
  });

  // Tentukan membership baru
  let newTier = "Default";
  if (totalSpent >= 1_000_000_000) newTier = "Platinum";
  else if (totalSpent >= 500_000_000) newTier = "Gold";
  else if (totalSpent >= 300_000_000) newTier = "Silver";
  else if (totalSpent >= 100_000_000) newTier = "Bronze";
  else if (totalSpent >= 50_000_000) newTier = "Regular";
  else if (totalSpent >= 10_000_000) newTier = "Starter";

  // Update database
  await customer.update({
    total_spent: totalSpent,
    membership_tier: newTier,
    last_transaction_at: new Date(),
  });

  return newTier;
};

export const downgradeMemberships = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const customers = await Customer.findAll();

  for (const customer of customers) {
    if (
      !customer.last_transaction_at ||
      customer.last_transaction_at < sixMonthsAgo
    ) {
      let downgradedTier = downgradeTier(customer.membership_tier);
      await customer.update({ membership_tier: downgradedTier });
    }
  }
};

const downgradeTier = (currentTier) => {
  const tiers = [
    "Platinum",
    "Gold",
    "Silver",
    "Bronze",
    "Regular",
    "Starter",
    "Default",
  ];
  const index = tiers.indexOf(currentTier);
  return index > 0 ? tiers[index - 1] : "Default";
};
