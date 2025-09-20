export function haveItemsChangedById<T extends { id: string }>(
  prevItems: T[] | undefined,
  currentItems: T[]
): boolean {
  if (!prevItems) return currentItems.length > 0;
  if (prevItems.length !== currentItems.length) return true;

  const prevIds = new Set(prevItems.map((item) => item.id));
  for (const item of currentItems) {
    if (!prevIds.has(item.id)) {
      return true;
    }
  }

  return false;
}
