/** Ordered product-detail fields editable in admin and shown on the shop PDP. */
export const DETAIL_FIELD_KEYS = [
  "Style Number",
  "Availability",
  "Production note",
  "Measurements",
  "Content",
  "No. of Components",
  "Wash Care",
  "Country of Origin",
  "Manufacturer",
  "Set Includes",
  "Fabric",
  "Pattern",
  "Occasion",
  "Fit",
  "Sleeve",
  "Neck",
  "Material",
  "Care",
] as const;

export const DEFAULT_MANUFACTURER =
  "Reena Rathore Atelier Private Limited, Mehrauli Flagship, New Delhi 110030, India";

export function emptyDetailAttributes(): Record<string, string> {
  return {
    "Style Number": "",
    Availability: "Ready to ship",
    "Production note": "",
    Measurements: "",
    Content: "",
    "No. of Components": "",
    "Wash Care": "Dry clean only.",
    "Country of Origin": "India",
    Manufacturer: DEFAULT_MANUFACTURER,
    "Set Includes": "",
    Fabric: "",
    Pattern: "",
    Occasion: "",
    Fit: "",
    Sleeve: "",
    Neck: "",
    Material: "",
    Care: "Dry clean only.",
  };
}

export function mergeDetailAttributes(existing: Record<string, string>): Record<string, string> {
  const base = emptyDetailAttributes();
  const merged = { ...base, ...existing };
  if (!merged["Wash Care"] && merged.Care) merged["Wash Care"] = merged.Care;
  if (!merged["Style Number"] && existing["Style Number"] === undefined) {
    // leave blank — editor can mirror SKU on save if desired
  }
  return merged;
}
