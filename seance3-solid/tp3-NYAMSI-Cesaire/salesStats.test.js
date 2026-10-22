// Le calcul est une fonction PURE : testable sans fichier, sans e-mail, sans console.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeStats } from './domain/salesStats.js';
import { EmailAddress } from './domain/EmailAddress.js';

test('computeStats : filtre le mois, exclut les commandes annulées, arrondit', () => {
  const orders = [
    { date: '2026-09-01', status: 'PAID', lines: [{ category: 'a', qty: 1, unitPrice: 10 }] },
    { date: '2026-09-02', status: 'PAID', lines: [{ category: 'b', qty: 1, unitPrice: 0.05 }] },
    { date: '2026-09-03', status: 'CANCELLED', lines: [{ category: 'a', qty: 9, unitPrice: 99 }] },
    { date: '2026-10-01', status: 'PAID', lines: [{ category: 'a', qty: 1, unitPrice: 1000 }] },
  ];
  assert.deepEqual(computeStats(orders, '2026-09'), {
    month: '2026-09', count: 2, revenueHT: 10.05, vat: 2.01, revenueTTC: 12.06,
    average: 5.03, byCategory: { a: 10, b: 0.05 },
  });
});

test('computeStats : aucune commande, aucune division par zéro', () => {
  assert.equal(computeStats([], '2026-01').average, 0);
});

test('EmailAddress : la règle de validité est en un seul endroit', () => {
  assert.equal(EmailAddress.parse('a@b.fr').toString(), 'a@b.fr');
  assert.throws(() => EmailAddress.parse('direction'), /Adresse invalide : direction/);
});
