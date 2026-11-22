export function calculateEfficiency(kills, errors, attempts) {
  if (!attempts || attempts <= 0) return 0;
  return Number((((kills - errors) / attempts) * 100).toFixed(1));
}
