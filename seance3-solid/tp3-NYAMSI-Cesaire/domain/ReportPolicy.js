// Offre commerciale = politique INJECTÉE dans ReportService, connue de l'appelant (correction LSP).
// Il n'y a plus de sous-classe qui refuse ce que le parent accepte : le contrat de
// ReportService dit dès le départ « je respecte la politique que l'on m'a donnée ».
// Contrat d'une politique : { assertAllowed({ format, recipient }) }.
export class ProPolicy {
  assertAllowed() {}
}

export class FreePolicy {
  assertAllowed({ format, recipient }) {
    if (format !== 'csv') throw new Error('Format réservé aux comptes Pro');
    if (recipient) throw new Error('Envoi par e-mail réservé aux comptes Pro');
  }
}
