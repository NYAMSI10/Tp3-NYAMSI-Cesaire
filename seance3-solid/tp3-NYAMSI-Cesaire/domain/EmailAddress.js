// Objet valeur : la règle de validité d'une adresse vit à UN seul endroit.
// (Règle volontairement identique au code de départ pour préserver le comportement.)
export class EmailAddress {
  #value;

  constructor(value) {
    if (typeof value !== 'string' || !value.includes('@')) {
      throw new Error(`Adresse invalide : ${value}`);
    }
    this.#value = value;
  }

  static parse(value) {
    return new EmailAddress(value);
  }

  toString() {
    return this.#value;
  }
}
