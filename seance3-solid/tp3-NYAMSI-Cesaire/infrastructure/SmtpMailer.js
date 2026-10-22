// Adaptateur d'envoi : simule un serveur SMTP (les messages restent dans une boîte d'envoi).
// Contrat d'un mailer : { send({ to, subject, body }) }.
// La configuration (et le mot de passe) est privée et vient de l'extérieur (variables d'environnement).
export class SmtpMailer {
  #config;
  #outbox = [];

  constructor({ host, port, user, password }) {
    this.#config = { host, port, user, password };
  }

  send({ to, subject, body }) {
    this.#outbox.push({ via: `${this.#config.host}:${this.#config.port}`, to, subject, body });
  }

  get outbox() {
    return [...this.#outbox];
  }
}
