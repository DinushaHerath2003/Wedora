export type BudgetUser = {
  id?: string | number;
  email?: string;
};

export type BudgetSourceItem = {
  id?: string;
  packageId?: string;
  category?: string;
  name?: string;
  title?: string;
  vendorName?: string;
  price?: number;
  quantity?: number;
  image?: string;
};

export function getBudgetScope(user: BudgetUser | null) {
  if (!user) {
    return 'guest';
  }

  const normalizedId = user.id !== undefined && user.id !== null && String(user.id).trim() !== ''
    ? String(user.id)
    : (user.email || 'guest');

  return `user:${normalizedId}`;
}

export function getBudgetStorageKeys(user: BudgetUser | null) {
  const scope = getBudgetScope(user);
  return {
    budgetPackages: `${scope}:budgetPackages`,
    budgetPackageDetails: `${scope}:budgetPackageDetails`,
    budgetItems: `${scope}:budgetItems`,
  };
}

export function safeParseArray<T>(value: string | null): T[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}
