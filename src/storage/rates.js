export async function fetchRates(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch rates (${res.status})`);
  }
  const data = await res.json();
  validateRates(data);
  return data;
}

export function validateRates(data) {
  const required = ["USD", "ILS", "GBP", "EURO"];
  required.forEach((k) => {
    if (
      typeof data?.[k] !== "number" ||
      !Number.isFinite(data[k]) ||
      data[k] <= 0
    ) {
      throw new Error(`Invalid rate for ${k}`);
    }
  });
}

/**
 * Convert amount from one currency to another using rates object.
 * rates[c] is: 1 USD = rates[c] units of currency c.
 */
export function convert(amount, from, to, rates) {
  if (from === to) return amount;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (!fromRate || !toRate) {
    throw new Error("Unsupported currency");
  }
  const usd = amount / fromRate;
  return usd * toRate;
}
