// Calcul PUR des ventes d'un mois : aucune lecture de fichier, aucune date, aucun effet de bord.
// Réutilisable tel quel par un tableau de bord, un export, un test…
export const VAT_RATE = 0.2;
export const EXCLUDED_STATUSES = ['CANCELLED'];

const round2 = n => Math.round(n * 100) / 100;

export function computeStats(orders, month) {
  let revenueHT = 0;
  let count = 0;
  const byCategory = {};
  for (const o of orders) {
    if (!o.date.startsWith(month) || EXCLUDED_STATUSES.includes(o.status)) continue;
    count++;
    for (const l of o.lines) {
      const amount = l.qty * l.unitPrice;
      revenueHT += amount;
      byCategory[l.category] = (byCategory[l.category] || 0) + amount;
    }
  }
  const vat = round2(revenueHT * VAT_RATE);
  const revenueTTC = revenueHT + vat;
  const average = count === 0 ? 0 : round2(revenueHT / count);
  return { month, count, revenueHT, vat, revenueTTC, average, byCategory };
}
