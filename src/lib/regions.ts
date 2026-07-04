// State-level pricing indices relative to the national baseline (1.00),
// derived from published labor-cost and cost-of-living indices. Onsite
// service estimates are adjusted by the job state's index at quote time;
// digital and professional services are priced nationally and unadjusted.
//
// col/row place each state on the tile-grid heat map (12 columns).

export interface Region {
  code: string;
  name: string;
  /** Price index relative to the national baseline of 1.00. */
  index: number;
  col: number;
  row: number;
}

export const regions: Region[] = [
  { code: "AK", name: "Alaska", index: 1.21, col: 0, row: 0 },
  { code: "ME", name: "Maine", index: 1.01, col: 11, row: 0 },
  { code: "VT", name: "Vermont", index: 1.03, col: 10, row: 1 },
  { code: "NH", name: "New Hampshire", index: 1.04, col: 11, row: 1 },
  { code: "WA", name: "Washington", index: 1.11, col: 1, row: 2 },
  { code: "ID", name: "Idaho", index: 0.97, col: 2, row: 2 },
  { code: "MT", name: "Montana", index: 0.96, col: 3, row: 2 },
  { code: "ND", name: "North Dakota", index: 0.93, col: 4, row: 2 },
  { code: "MN", name: "Minnesota", index: 1.02, col: 5, row: 2 },
  { code: "IL", name: "Illinois", index: 1.04, col: 6, row: 2 },
  { code: "WI", name: "Wisconsin", index: 0.98, col: 7, row: 2 },
  { code: "MI", name: "Michigan", index: 0.96, col: 8, row: 2 },
  { code: "NY", name: "New York", index: 1.18, col: 9, row: 2 },
  { code: "RI", name: "Rhode Island", index: 1.08, col: 10, row: 2 },
  { code: "MA", name: "Massachusetts", index: 1.15, col: 11, row: 2 },
  { code: "OR", name: "Oregon", index: 1.07, col: 1, row: 3 },
  { code: "NV", name: "Nevada", index: 1.02, col: 2, row: 3 },
  { code: "WY", name: "Wyoming", index: 0.95, col: 3, row: 3 },
  { code: "SD", name: "South Dakota", index: 0.92, col: 4, row: 3 },
  { code: "IA", name: "Iowa", index: 0.92, col: 5, row: 3 },
  { code: "IN", name: "Indiana", index: 0.93, col: 6, row: 3 },
  { code: "OH", name: "Ohio", index: 0.94, col: 7, row: 3 },
  { code: "PA", name: "Pennsylvania", index: 1.0, col: 8, row: 3 },
  { code: "NJ", name: "New Jersey", index: 1.12, col: 9, row: 3 },
  { code: "CT", name: "Connecticut", index: 1.1, col: 10, row: 3 },
  { code: "CA", name: "California", index: 1.22, col: 1, row: 4 },
  { code: "UT", name: "Utah", index: 0.99, col: 2, row: 4 },
  { code: "CO", name: "Colorado", index: 1.05, col: 3, row: 4 },
  { code: "NE", name: "Nebraska", index: 0.93, col: 4, row: 4 },
  { code: "MO", name: "Missouri", index: 0.93, col: 5, row: 4 },
  { code: "KY", name: "Kentucky", index: 0.92, col: 6, row: 4 },
  { code: "WV", name: "West Virginia", index: 0.88, col: 7, row: 4 },
  { code: "VA", name: "Virginia", index: 1.02, col: 8, row: 4 },
  { code: "MD", name: "Maryland", index: 1.06, col: 9, row: 4 },
  { code: "DE", name: "Delaware", index: 1.01, col: 10, row: 4 },
  { code: "AZ", name: "Arizona", index: 1.0, col: 2, row: 5 },
  { code: "NM", name: "New Mexico", index: 0.93, col: 3, row: 5 },
  { code: "KS", name: "Kansas", index: 0.92, col: 4, row: 5 },
  { code: "AR", name: "Arkansas", index: 0.89, col: 5, row: 5 },
  { code: "TN", name: "Tennessee", index: 0.94, col: 6, row: 5 },
  { code: "NC", name: "North Carolina", index: 0.96, col: 7, row: 5 },
  { code: "SC", name: "South Carolina", index: 0.94, col: 8, row: 5 },
  { code: "DC", name: "Washington, DC", index: 1.17, col: 9, row: 5 },
  { code: "OK", name: "Oklahoma", index: 0.89, col: 3, row: 6 },
  { code: "LA", name: "Louisiana", index: 0.92, col: 4, row: 6 },
  { code: "MS", name: "Mississippi", index: 0.88, col: 5, row: 6 },
  { code: "AL", name: "Alabama", index: 0.9, col: 6, row: 6 },
  { code: "GA", name: "Georgia", index: 0.96, col: 7, row: 6 },
  { code: "HI", name: "Hawaii", index: 1.26, col: 0, row: 7 },
  { code: "TX", name: "Texas", index: 0.98, col: 3, row: 7 },
  { code: "FL", name: "Florida", index: 1.0, col: 8, row: 7 },
];

export function regionByCode(code: string): Region | undefined {
  return regions.find((r) => r.code === code);
}

/** "+22% vs. national" / "−12% vs. national" / "At the national baseline" */
export function indexDeltaLabel(index: number): string {
  const pct = Math.round((index - 1) * 100);
  if (pct === 0) return "At the national baseline";
  return `${pct > 0 ? "+" : "−"}${Math.abs(pct)}% vs. national`;
}

export function adjustedPrice(basePrice: number, index: number): number {
  return Math.round(basePrice * index);
}
