// Adaptateur de journal : horodate et écrit sur la console.
// Contrat d'un logger : { info(message) }. L'horloge et la sortie sont injectables (tests déterministes).
export class ConsoleLogger {
  #clock;
  #output;
  #history = [];

  constructor({ clock = () => new Date(), output = console } = {}) {
    this.#clock = clock;
    this.#output = output;
  }

  info(message) {
    const line = `[${this.#clock().toISOString()}] ${message}`;
    this.#output.log(line);
    this.#history.push(line);
  }

  get history() {
    return [...this.#history];
  }
}
