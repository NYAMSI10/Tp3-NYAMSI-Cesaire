// Registre des formats (OCP) : ajouter un format = register(), sans toucher à ReportService.
// Contrat d'un formatter : { format(stats) -> string }.
export class FormatterRegistry {
  #formatters = new Map();

  register(name, formatter) {
    this.#formatters.set(name, formatter);
    return this;
  }

  get(name) {
    const formatter = this.#formatters.get(name);
    if (!formatter) throw new Error(`Format non supporté : ${name}`);
    return formatter;
  }

  names() {
    return [...this.#formatters.keys()];
  }
}
