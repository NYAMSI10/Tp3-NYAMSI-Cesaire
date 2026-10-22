// Adaptateur de stockage : lit les commandes dans un fichier JSON.
// Contrat d'un dépôt de commandes : { all() -> Order[] }.
import fs from 'node:fs';

export class JsonFileOrderRepository {
  #file;

  constructor(file) {
    this.#file = file;
  }

  all() {
    return JSON.parse(fs.readFileSync(this.#file, 'utf8'));
  }
}
