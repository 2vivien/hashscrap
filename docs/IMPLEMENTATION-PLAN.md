# HashScrap — Plan d'implémentation et index des issues

Référence produit : [PRD v0.1](PRD.md)  
Contrat pour agents IA : [AI Agent Issue Guide](AI-AGENT-ISSUE-GUIDE.md)  
Dépôt : https://github.com/digitaleflex/hashscrap

> Les issues sont rédigées pour être exécutées séparément par un agent de code. L'agent doit lire le PRD et le guide avant toute modification, respecter les dépendances et ne pas élargir le périmètre sans accord.

## Ordre d'exécution

| Ordre | Issue | Priorité | Dépendances |
|---:|---|---|---|
| 1 | [#1 Initialiser le paquet Python](https://github.com/digitaleflex/hashscrap/issues/1) | P0 | Aucune |
| 2 | [#2 CI et contrôles qualité](https://github.com/digitaleflex/hashscrap/issues/2) | P0 | #1 |
| 3 | [#3 Configuration et registre de sources](https://github.com/digitaleflex/hashscrap/issues/3) | P0 | #1 |
| 4 | [#4 Sécurité URL et destinations réseau](https://github.com/digitaleflex/hashscrap/issues/4) | P0 | #3 |
| 5 | [#5 Corpus de test local](https://github.com/digitaleflex/hashscrap/issues/5) | P0 | #1, #2 |
| 6 | [#6 Crawler HTTP borné avec Scrapy](https://github.com/digitaleflex/hashscrap/issues/6) | P0 | #3, #4, #5 |
| 7 | [#7 Extraction et provenance](https://github.com/digitaleflex/hashscrap/issues/7) | P0 | #5, #6 |
| 8 | [#8 Empreintes, déduplication et exports](https://github.com/digitaleflex/hashscrap/issues/8) | P0 | #7 |
| 9 | [#9 Schéma PostgreSQL et migrations](https://github.com/digitaleflex/hashscrap/issues/9) | P1 | #7, #8 |
| 10 | [#10 Tâches persistantes et idempotence](https://github.com/digitaleflex/hashscrap/issues/10) | P1 | #6, #9 |
| 11 | [#11 Corrélation exacte d'entités](https://github.com/digitaleflex/hashscrap/issues/11) | P1 | #9, #10 |
| 12 | [#12 Rapports sourcés Markdown/JSON](https://github.com/digitaleflex/hashscrap/issues/12) | P1 | #9, #10, #11 |
| 13 | [#13 Déploiement Docker Compose](https://github.com/digitaleflex/hashscrap/issues/13) | P1 | #1, #9 |
| 14 | [#14 Benchmark 10k/100k](https://github.com/digitaleflex/hashscrap/issues/14) | P2 | #6, #7, #8, #9 |
| 15 | [#35 Pipeline d'orchestration](https://github.com/digitaleflex/hashscrap/issues/35) ([spec locale](ISSUE-35-PIPELINE-ORCHESTRATION.md)) | P0 | #6, #7, #8, #9, #10 |

> L'état réel des fonctions livrées et le manque de chaîne de bout en bout sont documentés dans [STATUS.md](STATUS.md).

## Jalons proposés

### Milestone A — Fondations sûres
Issues #1 à #5. Résultat : paquet installable, CI, configuration bornée, garde-fous réseau et corpus local déterministe.

### Milestone B — Collecte utile
Issues #6 à #8. Résultat : crawl HTTP contrôlé, extraction avec provenance, empreintes, déduplication et exports.

### Milestone C — Persistance et intelligence minimale
Issues #9 à #12. Résultat : tâches persistantes, corrélation exacte et rapports reproductibles.

### Milestone D — Exploitation et capacité
Issues #13 et #14. Résultat : déploiement reproductible et benchmark de capacité.

Ces jalons sont des regroupements documentaires. Aucun milestone GitHub n'est supposé avoir été créé.

## Règles de pilotage

- Traiter les dépendances avant de lancer une issue.
- Ne pas lancer en parallèle deux agents sur les mêmes fichiers ou migrations.
- Un agent par issue ; PR focalisée et relue avant fusion.
- Les issues P0 sont nécessaires au premier MVP.
- Ne pas démarrer le benchmark à 100k avant d'avoir une extraction et une persistance correctes.
- Ne pas ajouter Playwright, Redis, Kafka, Kubernetes, un graphe dédié ou des agents autonomes sans issue approuvée.
- Les objectifs de performance seront fixés après les premières mesures, pas inventés à l'avance.

## Contrat de fin d'issue

L'agent doit fournir :
1. Résumé de l'implémentation.
2. Fichiers modifiés.
3. Critères d'acceptation avec preuves.
4. Commandes de tests/lint/type-check exécutées et résultats.
5. Revue des risques de sécurité.
6. Limites restantes et issues de suivi justifiées.
