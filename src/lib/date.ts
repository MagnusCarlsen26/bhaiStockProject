export const asIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

export const localMidnight = (date: Date): Date => {
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  return midnight;
};

export const dayOfYear = (date: Date): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};
