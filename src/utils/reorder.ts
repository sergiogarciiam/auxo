export const swapItems = <T>(arr: T[], i: number, j: number) => {
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
};
