/**
 * Top Indian health insurers (private + PSU).
 * Used in the intake form dropdown.
 */
export const INDIAN_HEALTH_INSURERS = [
  "Star Health",
  "HDFC ERGO",
  "ICICI Lombard",
  "Niva Bupa (Max Bupa)",
  "Care Health (Religare)",
  "Bajaj Allianz",
  "Reliance General",
  "SBI General",
  "Tata AIG",
  "Cholamandalam MS",
  "Kotak General",
  "Aditya Birla Health",
  "Manipal Cigna",
  "Acko",
  "Go Digit",
  "Future Generali",
  "Iffco Tokio",
  "Royal Sundaram",
  "Magma HDI",
  "Liberty General",
  "Universal Sompo",
  "New India Assurance",
  "United India Insurance",
  "National Insurance",
  "Oriental Insurance",
  "Other",
] as const;

export type InsurerName = (typeof INDIAN_HEALTH_INSURERS)[number];
