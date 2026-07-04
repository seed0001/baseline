export const providerMemoryCategories = [
  "business",
  "preferences",
  "customers",
  "pricing",
  "other",
] as const;

export type ProviderMemoryCategory = (typeof providerMemoryCategories)[number];

export type ProviderMemory = {
  id: string;
  category: string;
  content: string;
  source: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};
