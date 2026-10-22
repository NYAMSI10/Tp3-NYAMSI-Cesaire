// Format CSV : une seule raison de changer (le gabarit CSV).
export class CsvFormatter {
  format({ revenueHT, vat, revenueTTC, byCategory }) {
    let output = 'categorie;montant_ht\n';
    for (const c of Object.keys(byCategory).sort()) output += `${c};${byCategory[c]}\n`;
    output += `TOTAL HT;${revenueHT}\nTVA;${vat}\nTOTAL TTC;${revenueTTC}\n`;
    return output;
  }
}
