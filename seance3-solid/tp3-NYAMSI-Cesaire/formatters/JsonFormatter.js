// Format JSON : on sérialise les statistiques telles quelles.
export class JsonFormatter {
  format({ month, count, revenueHT, vat, revenueTTC, average, byCategory }) {
    return JSON.stringify({ month, count, revenueHT, vat, revenueTTC, average, byCategory });
  }
}
