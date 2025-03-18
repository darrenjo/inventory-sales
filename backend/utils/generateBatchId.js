export const generateBatchId = (productName, productId) => {
  const currentYear = new Date().getFullYear().toString().slice(-2); // 25
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0"); // 03
  const shortName = productName.substring(0, 3).toUpperCase(); // KAT
  const timestamp = Math.floor(Date.now() / 1000); // Detik UNIX

  return `${shortName}${currentYear}_${currentMonth}${timestamp}`;
};
