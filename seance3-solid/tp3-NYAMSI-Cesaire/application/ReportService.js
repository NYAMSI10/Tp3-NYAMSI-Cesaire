// Cas d'usage « rapport mensuel des ventes » : il ORCHESTRE, il ne crée AUCUNE dépendance.
// Tout arrive par le constructeur (DIP) ; il ne connaît que des contrats :
//   orders.all() · formatters.get(nom).format(stats) · mailer.send({ to, subject, body })
//   logger.info(message) · policy.assertAllowed({ format, recipient })
import { computeStats } from '../domain/salesStats.js';
import { EmailAddress } from '../domain/EmailAddress.js';

export class ReportService {
  #orders;
  #formatters;
  #mailer;
  #logger;
  #policy;

  constructor({ orders, formatters, mailer, logger, policy }) {
    this.#orders = orders;
    this.#formatters = formatters;
    this.#mailer = mailer;
    this.#logger = logger;
    this.#policy = policy;
  }

  generate(month, format, recipient) {
    this.#policy.assertAllowed({ format, recipient });

    const stats = computeStats(this.#orders.all(), month);
    const output = this.#formatters.get(format).format(stats);

    this.#logger.info(`rapport ${month} (${format}) : ${stats.count} commande(s)`);

    if (recipient) {
      const to = EmailAddress.parse(recipient);
      this.#mailer.send({ to: to.toString(), subject: `Rapport des ventes ${month}`, body: output });
    }
    return output;
  }
}
