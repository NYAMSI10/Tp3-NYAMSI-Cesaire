# TP 3 · Diagnostic des violations SOLID (`seance3-solid/tp3/ReportService.js`)

| # | Principe | Ligne(s) | Problème | Conséquence concrète |
|---|----------|----------|----------|----------------------|
| 1 | **S** (SRP) | 20-73 | `generate()` fait cinq métiers : lecture des commandes (22), calcul (25-39), mise en forme (42-55), journalisation (58-60), envoi d'e-mail (63-71). | Le comptable (règle de TVA), le marketing (gabarit HTML), l'exploitation (logs) et l'admin mail modifient tous la même méthode : conflits de fusion, et une retouche du HTML peut casser le calcul sans qu'on s'en aperçoive. |
| 2 | **O** (OCP) | 43-55 | Une chaîne de `if / else if` sur `format`. | Ajouter un format (PDF, Markdown) oblige à rouvrir et re-tester une méthode qui marche déjà ; la chaîne grandit à chaque format. |
| 3 | **L** (LSP) | 77-82 | `FreeReportService` hérite de `ReportService` mais lève une exception pour `html`, `json` et l'e-mail, que le parent accepte. | Un code écrit pour `ReportService` (ex. `service.generate(m, 'html', mail)`) plante dès qu'on lui passe un `FreeReportService` : le sous-type ne tient pas les promesses du parent. |
| 4 | **D** (DIP / DI) | 4, 7-12, 16 | Le service crée lui-même ses dépendances concrètes : `import fs`, `new URL('./orders.json')`, objet SMTP, `outbox`. | Impossible de tester le calcul sans le fichier `orders.json`, de lire les commandes depuis une base, ou de remplacer le SMTP par un faux : chaque test touche le disque. |
| 5 | **D** + autre (testabilité) | 58-59 | `new Date()` et `console.log` codés en dur dans la logique. | La sortie change d'une exécution à l'autre (horodatage), les tests polluent la console et on ne peut pas vérifier la ligne de journal sans capturer `stdout`. |
| 6 | **Autre** (sécurité) | 10 | Mot de passe SMTP en clair dans le code (`password: '…'`). | Le secret part dans le dépôt Git et son historique : toute personne ayant accès au code (ou à une fuite du dépôt) peut envoyer des e-mails au nom de ShopLite ; changer le mot de passe impose un nouveau déploiement. |
| 7 | **S** + autre (encapsulation) | 11-12, 64 | `outbox`, `history`, `smtp` sont des champs publics ; la règle de validité d'une adresse (`includes('@')`) est enfouie dans l'envoi. | N'importe quel appelant peut lire la config SMTP (et le mot de passe) ou vider la boîte d'envoi ; la règle d'adresse ne peut pas être réutilisée ni durcie à un seul endroit. |
| 8 | **O** + autre (valeurs magiques) | 29, 37 | Taux de TVA `0.2` et statut `'CANCELLED'` en dur dans le calcul. | Un changement de taux ou un nouveau statut (`REFUNDED`) oblige à modifier la méthode de calcul elle-même. |

## Réponses aux pistes

- **Qui viendra demander de modifier `generate()` ?** Finance (calcul), produit/marketing (formats), exploitation (logs), infra (SMTP) → au moins 4 raisons de changer → SRP.
- **Ajouter un PDF ?** Rouvrir le `if/else` (lignes 43-55) → OCP.
- **Passer un `FreeReportService` à du code `ReportService` ?** Exception à l'exécution → LSP.
- **Tester le calcul sans `orders.json` ?** Impossible : le chemin et `fs` sont créés dans le constructeur → DIP.
- **Sortie différente d'une exécution à l'autre ?** `new Date()` ligne 58.
- **Jamais dans Git ?** Le mot de passe SMTP ligne 10.
