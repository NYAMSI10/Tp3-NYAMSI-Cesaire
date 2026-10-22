// COMPOSITION ROOT : le seul fichier qui fait des `new` d'infrastructure et assemble le graphe.
// Lancer la démo : node seance3-solid/tp3-NYAMSI-Cesaire/main.js   (même sortie que tp3/demo.js)
// Configuration SMTP : variables d'environnement SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD.
import { pathToFileURL } from 'node:url';
import { ReportService } from './application/ReportService.js';
import { ProPolicy, FreePolicy } from './domain/ReportPolicy.js';
import { FormatterRegistry } from './formatters/FormatterRegistry.js';
import { CsvFormatter } from './formatters/CsvFormatter.js';
import { HtmlFormatter } from './formatters/HtmlFormatter.js';
import { JsonFormatter } from './formatters/JsonFormatter.js';
import { JsonFileOrderRepository } from './infrastructure/JsonFileOrderRepository.js';
import { SmtpMailer } from './infrastructure/SmtpMailer.js';
import { ConsoleLogger } from './infrastructure/ConsoleLogger.js';

const POLICIES = { pro: () => new ProPolicy(), free: () => new FreePolicy() };

export function smtpConfigFromEnv(env = process.env) {
  return {
    host: env.SMTP_HOST ?? 'smtp.shoplite.fr',
    port: Number(env.SMTP_PORT ?? 587),
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD, // jamais dans le code : fourni par l'environnement
  };
}

export function buildFormatterRegistry() {
  return new FormatterRegistry()
    .register('csv', new CsvFormatter())
    .register('html', new HtmlFormatter())
    .register('json', new JsonFormatter());
}

// Chaque dépendance peut être remplacée (tests, autre stockage, autre offre…).
export function buildReportService({
  plan = 'pro',
  env = process.env,
  orders = new JsonFileOrderRepository(new URL('./orders.json', import.meta.url)),
  formatters = buildFormatterRegistry(),
  mailer = new SmtpMailer(smtpConfigFromEnv(env)),
  logger = new ConsoleLogger(),
} = {}) {
  const policy = POLICIES[plan]();
  const service = new ReportService({ orders, formatters, mailer, logger, policy });
  return { service, formatters, mailer, logger };
}

// Démonstration (équivalent de tp3/demo.js), seulement si ce fichier est lancé directement.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { service, mailer } = buildReportService();
  console.log(service.generate('2026-09', 'csv'));
  console.log(service.generate('2026-09', 'html', 'direction@shoplite.fr'));
  console.log('E-mails envoyés :', mailer.outbox.length);
}
