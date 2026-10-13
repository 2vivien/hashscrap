# Issue #35 — [P0][PIPELINE] Relier collecte, extraction, persistance, corrélation et rapport

> Issue ouverte sur GitHub : https://github.com/digitaleflex/hashscrap/issues/35 (numéro attribué à l'ouverture, les PR #16 à #34 ayant consommé les identifiants précédents).
> Le corps de l'issue GitHub reprend ce document, rédigé selon le format imposé par [AI Agent Issue Guide](AI-AGENT-ISSUE-GUIDE.md).

## Problème

Les modules #4 à #12 sont développés, testés et cohérents avec le PRD, mais aucun orchestrateur ne les relie. Constats vérifiés dans `docs/STATUS.md` §4 :

- `BoundedSpider.parse` renvoie des dictionnaires bruts et n'appelle jamais `extract_html` ; le corps de la réponse n'est pas transmis.
- Aucun module n'écrit dans `documents`, `observations`, `entities`, `entity_relationships`. `hashscrap crawl` collecte et imprime du JSON, rien n'est persisté.
- Aucun ordonnanceur ne consomme `crawl_jobs` : `create_job`, `transition_job`, `recover_stale_jobs` n'ont aucun appelant en production.
- `render_report_json` / `render_report_markdown` n'ont aucun producteur de `InvestigationReport`.

Conséquence : la collecte ne produit aucune preuve exploitable, et les exports/rapports/corrélation ne sont atteignables que par appel direct à la bibliothèque.

## Objectif

Introduire un module d'orchestration (`hashscrap/pipeline.py`) et un ordonnanceur borné qui transforment une source configurée en preuves persistées et exportables, sans refondre aucun module existant et sans nouvelle dépendance.

## Périmètre (in scope)

1. **`hashscrap/pipeline.py` — nouveau module**
   - `persist_extraction(session, result, *, source_id, run_id)` : écrit `Document` (avec `content_sha256`, `first_seen_at` / `last_seen_at`) puis chaque `Observation` en conservant `evidence_ref`, `extractor`+version et `raw_value`. Idempotent sur `(original_url, content_sha256)` : réécrire le même document met à jour `last_seen_at` et n'ajoute pas d'observation dupliquée.
   - `correlate_observations(session, observations)` : pour chaque observation éligible (champ `domain`, `ip`, `url`, nom d'organisation), appelle `correlation.normalize_identifier`, puis `correlation.decide_match` ; crée ou rattache l'entité, la liaison `entity_observations` avec `matching_method` + `review_status`, et la relation `entity_relationships` uniquement en cas de correspondance exacte acceptée. **Aucune fusion automatique d'une organisation ni d'un cas multi-correspondance.**
   - `build_report(session, investigation_id, …)` : assemble un `InvestigationReport` depuis les lignes persistées (couverture par source, observations avec `evidence_ref`, relations sourcées, erreurs, limites non vides), puis renvoie JSON et Markdown via `reports`.
   - `export_artifacts(…)` : appelle `fingerprints.DeduplicationIndex`, `exports.export_jsonl`, `exports.export_csv` sur les résultats de la collecte.
2. **Adaptation minimale du contrat d'item du spider** pour transporter le corps borné et l'horodatage de récupération jusqu'à l'extraction, sans modifier les politiques de sécurité ni les bornes de `_settings`.
3. **CLI** : sous-commande `hashscrap run --config … --source …` qui enchaîne collecte → persistance → corrélation → export/rapport, journalisant un `crawl_run` et transitionnant le `crawl_job` correspondant ; conservation de `hashscrap crawl` (sans base) pour un usage purement local.
4. **Ordonnanceur** : `hashscrap.worker` consommant `crawl_jobs` par lots bornés, transitionnant via `jobs.transition_job` et appelant `jobs.recover_stale_jobs` au démarrage. Pas de boucle infinie : un lot par invocation, avec une limite de tentatives déjà portée par `max_attempts`.
5. **Tests** d'intégration sur `tests/fixture_server.py` + `tests/fixtures/corpus/`, sans PostgreSQL réel ni Internet.

## Hors périmètre (non-goals)

- Playwright, rendu JavaScript, Redis, Kafka, Kubernetes, base graphe, base vectorielle, agents autonomes.
- API HTTP pour le web, contrats d'API, refonte de `apps/web` (dépend de cette issue et reste #15).
- Réécriture de `url_policy`, du schéma ou des modules existants.
- Amélioration de la couverture du benchmark (restituée dans `benchmark-results/`).

## Découpage proposé

Le périmètre est trop large pour une seule PR relue. Proposer deux PR empilées :

- **PR A (cette issue, base `main`)** — `pipeline.persist_extraction`, adaptation du contrat d'item, CLI `hashscrap run`, tests d'intégration extraction → persistance sur corpus local.
- **PR B (issue #36 à ouvrir, base PR A)** — corrélation, `build_report`, exports, ordonnanceur de jobs, transitions de job bout en bout.

Ne pas élargir la PR A au-delà de la persistance : la corrélation et le rendu de rapport sont réanalysables indépendamment.

## Étapes d'implémentation (PR A)

1. Lire `docs/PRD.md`, `docs/DATABASE.md`, `docs/CRAWLER.md`, `docs/CONFIGURATION.md` et ce guide.
2. Inspecter `hashscrap/crawler.py`, `hashscrap/spiders/bounded.py`, `hashscrap/extraction.py`, `hashscrap/models.py`.
3. Définir le contrat d'item (champs named, types, provenance obligatoire) et le faire accepter par mypy strict.
4. Écrire les tests : chemin nominal, body non-HTML, document répété (idempotence), `evidence_ref` conservée, charset non UTF-8, limite de taille du corps.
5. Implémenter `pipeline.persist_extraction` et la sous-commande CLI.
6. Mettre à jour `docs/DATABASE.md` et `docs/CRAWLER.md` si le comportement change.
7. Exécuter la séquence complète des quality gates et rapporter les résultats réels.

## Critères d'acceptation

- [ ] `hashscrap run --config … --source …` collecte, persiste et renvoie un récapitulatif JSON ; code de sortie 0/1/2 conforme à `crawl`.
- [ ] Chaque observation persistée conserve `document_id`, `evidence_ref`, `extractor`, `extractor_version`, `raw_value`, `normalized_value` et un horodatage UTC.
- [ ] Réexécuter la même collecte ne duplique ni document ni observation, et met à jour `last_seen_at`.
- [ ] `content_sha256` est renseigné via `fingerprints.fingerprint_content` et l'index d'URL canonique est respecté.
- [ ] Aucune écriture en base hors transaction explicite ; le commit appartient à l'appelant.
- [ ] Aucune nouvelle dépendance, aucun nouvel accès réseau hors périmètre des sources configurées.
- [ ] `ruff check`, `ruff format --check`, `mypy` (strict) et `pytest` passent ; aucune régression sur les 96 tests existants.
- [ ] Documentation à jour (`docs/DATABASE.md`, `docs/STATUS.md` §4).

## Scénarios de test

| # | Scénario | Attendu |
|---|---|---|
| 1 | Corpus local, page HTML valide | document + observations écrits, `evidence_ref` non vide |
| 2 | `content_type` non HTML | document écrit, zéro observation, aucun échec de collecte |
| 3 | Même URL et même corps joués deux fois | un seul document, `last_seen_at` mis à jour, aucune observation dupliquée |
| 4 | Même URL, corps différent | un seul document mis à jour, sha256 changé, observations cumulées |
| 5 | Corps au-delà de la limite | refus avant écriture, aucun document partiel |
| 6 | HTML malformé | extraction best-effort, pas d'exception |
| 7 | Charset latin-1 | valeurs décodées sans `UnicodeDecodeError` |
| 8 | URL hors périmètre de la source | refus par `collect`, exit 2, aucune écriture |
| 9 | Destination privée / loopback / metadata | refus par la politique URL, rien n'est écrit |
| 10 | Base absente / `HASHSCRAP_DATABASE_URL` invalide | message d'erreur sans secret, exit 2 |

## Dépendances

#6 (crawler), #7 (extraction), #8 (empreintes), #9 (schéma), #10 (jobs). Aucun blocage amont. Bloque #15 pour la partie données.

## Considérations de sécurité

- Aucune nouvelle surface réseau : la collecte reste bornée par `url_policy` et les middlewares existants ; ne pas appeler `extract_html` sur un contenu non borné en octets.
- Le contenu collecté reste non fiable : jamais exécuté, jamais interprété, seulement stocké.
- Écrire uniquement via des paramètres liés SQLAlchemy ; aucune concaténation d'identifiant dans du SQL.
- Ne pas journaliser d'URL complète ni de corps ; s'appuyer sur `error_code` et les motifs de `CrawlResult`.
- Les `evidence_ref` sont des sélecteurs fournis par la source : les traiter comme non fiables, les tronquer à 500 caractères (contrainte déjà présente) et ne pas les évaluer.
- L'idempotence doit reposer sur une contrainte de base, pas sur une vérification applicative seule.

## Preuves attendues à la completion

Résumé, fichiers modifiés, critères d'acceptation → preuves, commandes exactes et résultats, revue de sécurité, limites restantes, issues de suivi (dont #36).