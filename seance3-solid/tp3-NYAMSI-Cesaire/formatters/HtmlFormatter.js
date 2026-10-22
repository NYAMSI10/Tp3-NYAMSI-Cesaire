// Format HTML : une seule raison de changer (le gabarit HTML).
export class HtmlFormatter {
  format({ month, count, average, revenueTTC, byCategory }) {
    let output = `<h1>Ventes ${month}</h1><p>${count} commande(s), panier moyen ${average} €</p><ul>`;
    for (const c of Object.keys(byCategory).sort()) output += `<li>${c} : ${byCategory[c]} €</li>`;
    output += `</ul><p><b>Total TTC : ${revenueTTC} €</b></p>`;
    return output;
  }
}
