// Tests unitaires du service refactoré : uniquement des FAUX injectés, aucun fichier, aucun SMTP.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReportService } from './application/ReportService.js';
import { ProPolicy, FreePolicy } from './domain/ReportPolicy.js';
import { buildReportService } from './main.js';
import { ConsoleLogger } from './infrastructure/ConsoleLogger.js';

const ORDERS = [
  { id: 'A', date: '2026-09-01', status: 'PAID', lines: [{ category: 'livres', qty: 2, unitPrice: 10 }] },
];

function fakes() {
  const sent = [];
  const logs = [];
  return {
    sent,
    logs,
    deps: {
      orders: { all: () => ORDERS },
      formatters: { get: () => ({ format: stats => `HT=${stats.revenueHT}` }) },
      mailer: { send: m => sent.push(m) },
      logger: { info: m => logs.push(m) },
      policy: new ProPolicy(),
    },
  };
}

test('un format Markdown s’ajoute sans modifier ReportService', () => {
  const { service, formatters } = buildReportService({ logger: { info() {} } });
  formatters.register('md', {
    format: s =>
      `# Ventes ${s.month}\n\n` +
      Object.keys(s.byCategory).sort().map(c => `- ${c} : ${s.byCategory[c]} €`).join('\n') +
      `\n\n**Total TTC : ${s.revenueTTC} €**\n`,
  });
  assert.equal(service.generate('2026-09', 'md'),
    '# Ventes 2026-09\n\n- informatique : 416 €\n- livres : 135 €\n\n**Total TTC : 661.2 €**\n');
});

test('toutes les dépendances sont remplaçables par injection', () => {
  const { deps, sent, logs } = fakes();
  const service = new ReportService(deps);
  assert.equal(service.generate('2026-09', 'peu-importe', 'a@b.fr'), 'HT=20');
  assert.deepEqual(sent, [{ to: 'a@b.fr', subject: 'Rapport des ventes 2026-09', body: 'HT=20' }]);
  assert.deepEqual(logs, ['rapport 2026-09 (peu-importe) : 1 commande(s)']);
});

test('offre gratuite : CSV autorisé, même comportement que Pro', () => {
  const { service } = buildReportService({ plan: 'free', logger: { info() {} } });
  assert.match(service.generate('2026-09', 'csv'), /^categorie;montant_ht\n/);
});

test('offre gratuite : HTML et e-mail refusés par la politique, avant tout effet de bord', () => {
  const { deps, sent, logs } = fakes();
  const service = new ReportService({ ...deps, policy: new FreePolicy() });
  assert.throws(() => service.generate('2026-09', 'html'), /réservé aux comptes Pro/);
  assert.throws(() => service.generate('2026-09', 'csv', 'a@b.fr'), /Envoi par e-mail réservé/);
  assert.equal(sent.length + logs.length, 0);
});

test('journal horodaté par une horloge injectée : sortie déterministe', () => {
  const lines = [];
  const logger = new ConsoleLogger({
    clock: () => new Date('2026-10-22T09:30:00.000Z'),
    output: { log: l => lines.push(l) },
  });
  buildReportService({ logger }).service.generate('2026-09', 'csv');
  assert.deepEqual(lines, ['[2026-10-22T09:30:00.000Z] rapport 2026-09 (csv) : 3 commande(s)']);
});

test('la configuration SMTP vient de l’environnement', () => {
  const env = { SMTP_HOST: 'smtp.test', SMTP_PORT: '2525', SMTP_PASSWORD: 'x' };
  const { service, mailer } = buildReportService({ env, logger: { info() {} } });
  service.generate('2026-09', 'csv', 'a@b.fr');
  assert.equal(mailer.outbox[0].via, 'smtp.test:2525');
});
