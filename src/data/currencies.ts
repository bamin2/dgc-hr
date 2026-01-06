export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "BHD", symbol: "BD", name: "Bahraini Dinar" },
  { code: "SAR", symbol: "SAR", name: "Saudi Riyal" },
  { code: "AED", symbol: "AED", name: "UAE Dirham" },
  { code: "KWD", symbol: "KD", name: "Kuwaiti Dinar" },
  { code: "QAR", symbol: "QAR", name: "Qatari Riyal" },
  { code: "OMR", symbol: "OMR", name: "Omani Rial" },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound" },
  { code: "JOD", symbol: "JD", name: "Jordanian Dinar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "PKR", symbol: "Rs", name: "Pakistani Rupee" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
];

export const countryCurrencyMap: Record<string, string> = {
  "Bahrain": "BHD",
  "Saudi Arabia": "SAR",
  "United Arab Emirates": "AED",
  "Kuwait": "KWD",
  "Qatar": "QAR",
  "Oman": "OMR",
  "Egypt": "EGP",
  "Jordan": "JOD",
  "United States": "USD",
  "United Kingdom": "GBP",
  "Canada": "CAD",
  "Australia": "AUD",
  "India": "INR",
  "Pakistan": "PKR",
  "Philippines": "PHP",
  "Japan": "JPY",
  "China": "CNY",
  "Germany": "EUR",
  "France": "EUR",
  "Italy": "EUR",
  "Spain": "EUR",
  "Netherlands": "EUR",
};

export function getCurrencyByCode(code: string): Currency | undefined {
  return currencies.find((c) => c.code === code);
}

export function getCurrencyForCountry(country: string): string {
  return countryCurrencyMap[country] || "USD";
}
