export const membershipLevels = [
  { level: "Default", minSpent: 0, discount: 0, pointsPer100k: 1 },
  { level: "Starter", minSpent: 10_000_000, discount: 0.005, pointsPer100k: 1 },
  { level: "Regular", minSpent: 50_000_000, discount: 0.01, pointsPer100k: 1 },
  { level: "Bronze", minSpent: 100_000_000, discount: 0.03, pointsPer100k: 1 },
  { level: "Silver", minSpent: 300_000_000, discount: 0.06, pointsPer100k: 2 },
  { level: "Gold", minSpent: 500_000_000, discount: 0.08, pointsPer100k: 2 },
  {
    level: "Platinum",
    minSpent: 1_000_000_000,
    discount: 0.1,
    pointsPer100k: 2,
  },
];

export const getMembershipLevel = (totalSpent) => {
  return membershipLevels
    .slice() // Clone array agar tidak terpengaruh mutasi
    .reverse()
    .find((level) => totalSpent >= level.minSpent);
};
