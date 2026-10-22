// Tests de CARACTÉRISATION fournis : ils figent le comportement actuel du rapport.
// Ils doivent rester verts pendant TOUT le refactoring.
// Lancer : node --test seance3-solid/tp3-NYAMSI-Cesaire/*.test.js
// Après refactoring : seule la CONSTRUCTION du service change, les valeurs attendues jamais.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReportService } from './main.js';

// Logger muet : plus de lignes [2026-…] qui polluent la sortie des tests.
const build = () => buildReportService({ logger: { info() {} } });
const newService = () => build().service;

const CSV_SEPT = 'categorie;montant_ht\ninformatique;416\nlivres;135\n' +
  'TOTAL HT;551\nTVA;110.2\nTOTAL TTC;661.2\n';

test('CSV de septembre 2026 (commande annulée exclue)', () => {
  assert.equal(newService().generate('2026-09', 'csv'), CSV_SEPT);
});

test('HTML de septembre 2026', () => {
  assert.equal(newService().generate('2026-09', 'html'),
    '<h1>Ventes 2026-09</h1><p>3 commande(s), panier moyen 183.67 €</p><ul>' +
    '<li>informatique : 416 €</li><li>livres : 135 €</li></ul><p><b>Total TTC : 661.2 €</b></p>');
});

test('JSON de septembre 2026', () => {
  assert.deepEqual(JSON.parse(newService().generate('2026-09', 'json')), {
    month: '2026-09', count: 3, revenueHT: 551, vat: 110.2, revenueTTC: 661.2,
    average: 183.67, byCategory: { informatique: 416, livres: 135 },
  });
});

test('mois sans commande : totaux à zéro', () => {
  assert.equal(newService().generate('2026-01', 'csv'),
    'categorie;montant_ht\nTOTAL HT;0\nTVA;0\nTOTAL TTC;0\n');
});

test('format inconnu refusé', () => {
  assert.throws(() => newService().generate('2026-09', 'pdf'), /Format non supporté/);
});

test('envoi par e-mail : un message dans la boîte d’envoi', () => {
  const { service, mailer } = build();
  service.generate('2026-09', 'csv', 'direction@shoplite.fr');
  assert.equal(mailer.outbox.length, 1);
  assert.equal(mailer.outbox[0].to, 'direction@shoplite.fr');
  assert.equal(mailer.outbox[0].body, CSV_SEPT);
});

test('adresse e-mail invalide refusée', () => {
  assert.throws(() => newService().generate('2026-09', 'csv', 'direction'), /Adresse invalide/);
});

test('CSV d’octobre 2026', () => {
  assert.equal(newService().generate('2026-10', 'csv'),
    'categorie;montant_ht\ninformatique;57\nTOTAL HT;57\nTVA;11.4\nTOTAL TTC;68.4\n');
});
