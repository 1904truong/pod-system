
const REGIONAL_PRICING_TEMPLATE = [
  { destination: "UNITED STATES",   code: "US", ratioS: 4.99 / 7.98 },
  { destination: "EUROPEAN UNION",  code: "EU", ratioS: 6.99 / 7.98 },
  { destination: "UNITED KINGDOM",  code: "GB", ratioS: 6.99 / 7.98 },
  { destination: "CANADA",          code: "CA", ratioS: 8.99 / 7.98 },
  { destination: "OCEANIA",         code: "OC", ratioS: 12.99 / 7.98 },
];

const getRegionMaxShipping = (productBasePrice, selectedRegions) => {
  const baseShipping = Number(productBasePrice || 6.98) + 1.0;
  const regionToCodes = {
    'NORTH_AMERICA': ['US', 'CA'],
    'EUROPE': ['EU', 'GB'],
    'OCEANIA': ['OC'],
  };

  let activeCodes = new Set();
  if (Array.isArray(selectedRegions)) {
    selectedRegions.forEach(r => {
      const normalizedRegion = String(r || '').toUpperCase().replace(/\s+/g, '_');
      const codes = regionToCodes[normalizedRegion] || [];
      codes.forEach(c => activeCodes.add(c));
    });
  }

  if (activeCodes.size === 0) activeCodes.add('US');

  let maxFee = 0;
  activeCodes.forEach(code => {
    let row = REGIONAL_PRICING_TEMPLATE.find(t => t.code === code);
    if (row) {
      const fee = baseShipping * row.ratioS;
      if (fee > maxFee) maxFee = fee;
    }
  });

  return maxFee;
};

const analyzeProfit = (retailPrice, baseCost, shippingFee) => {
  const profit = retailPrice - (baseCost + shippingFee);
  const isSafe = profit >= 5.0;
  return { profit: profit.toFixed(2), isSafe };
};

console.log("=== Profitability Logic Test ===\n");

const tests = [
  { name: "US Free Shipping (Retail $20)", retail: 20, cost: 13, regions: ["NORTH_AMERICA"] },
  { name: "Oceania Free Shipping (Retail $25)", retail: 25, cost: 13, regions: ["OCEANIA"] },
  { name: "Europe Free Shipping (Retail $35)", retail: 35, cost: 13, regions: ["EUROPE"] }
];

tests.forEach(t => {
  const ship = getRegionMaxShipping(t.cost - 6.02, t.regions); // Adjusted base estimate
  const result = analyzeProfit(t.retail, t.cost, ship);
  console.log(`Test: ${t.name}`);
  console.log(`  - Shipping Fee: $${ship.toFixed(2)}`);
  console.log(`  - Profit: $${result.profit}`);
  console.log(`  - Status: ${result.isSafe ? "✅ SAFE (Profit > $5)" : "❌ UNPROFITABLE (Conflict triggered)"}`);
  console.log("-----------------------------------");
});
