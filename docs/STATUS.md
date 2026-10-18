# État des fonctionnalités — relevé des fonctions développées et opérationnelles

Date du relevé : 2026-10-18 · Branche : `main` (`fc8f9c4`), commit qui précède cette mise à jour · Périmètre : issues #1 à #14 fusionnées, plus #15 (interface, partielle) et #35 (orchestration, partielle).

Ce document applique le « Expected completion report » de [AI Agent Issue Guide](AI-AGENT-ISSUE-GUIDE.md) à l'ensemble du dépôt plutôt qu'à une seule issue. Il ne remplace aucun rapport d'issue et ne revendique aucun contrôle qui n'a pas été exécuté. Chaque affirmation sur le code a été revérifiée dans les sources à la date du relevé.

---

## 1. Résumé

Quinze modules Python composent le paquet : sécurité réseau (`url_policy`), configuration (`config`, `source_registry`), collecte bornée (`crawler`, `middleware`, `spiders/bounded`), extraction (`extraction`), empreintes (`fingerprints`), exports (`exports`), corrélation (`correlation`), rapports (`reports`, `report_builder`), persistance (`models`, `db`, `jobs`), orchestration (`pipeline`), API (`api`), benchmark (`benchmark`) et CLI (`cli`).

La chaîne **collecte → extraction → persistance** existe désormais : `hashscrap run` collecte une source bornée, extrait chaque réponse avec provenance, écrit `documents` et `observations`, et enregistre un `crawl_job` + un `crawl_run`. Une API HTTP **lecture seule** versionnée `/api/v1` (`hashscrap serve`) expose ces données, et `hashscrap report` assemble un `InvestigationReport` (schéma 1.0) à partir des lignes persistées.

Deux manques structurels restent explicites et correspondent à des issues ouvertes :

- **#35 — inachevé.** La corrélation n'est pas câblée au pipeline : `decide_match` et `normalize_identifier` ne sont appelés que depuis les tests, et aucun code n'insère dans `entities`, `entity_observations` ou `entity_relationships`. Aucun ordonnanceur ne consomme `crawl_jobs` en boucle. Les générateurs d'`exports.py` ne sont pas câblés à la base.
- **#15 — partiel.** La vue d'ensemble, la section Sources et la page Collectes lisent l'API ; les autres sections restent des écrans « fonction non connectée ». Une couche de présentation reste dupliquée côté web.

Par ailleurs, `alembic upgrade head` sur une base vivante et `docker compose config`/`up` n'ont pas été exécutés dans cet environnement : leur conformité n'est pas revendiquée.

---

## 2. Fonctions opérationnelles (vérifiées par tests)

### 2.1 Sécurité réseau — `hashscrap/url_policy.py`

| Fonction | Rôle | Bornes |
|---|---|---|
| `validate_url(url, *, resolver, allowed_ports)` | Décision (pas de requête HTTP) sur syntaxe + **toutes** les réponses DNS | schémas `http`/`https`, ports 80/443, userinfo et fragment refusés, hostname `metadata*` bloqué |
| `require_allowed_url(url)` | Idem, mais lève `URLPolicyError` au motif stable | — |
| `validate_redirect(current_url, location)` | `urljoin` puis politique complète sur la cible | — |

`_public_destination()` exige `ipaddress.is_global` et exclut le multicast : IPv4 privés, loopback, link-local, plages réservées et versions IPv6 équivalentes sont rejetées, y compris quand le hostname est un littéral IP.

### 2.2 Configuration — `hashscrap/config.py`, `hashscrap/source_registry.py`

`load_config(path)` → `AppConfig` (Pydantic `extra="forbid"`). Bornes vérifiées dans `config.py` : `CrawlLimits` plafonne timeout ≤ `MAX_TIMEOUT_SECONDS` 120 s, concurrence ≤ `MAX_CONCURRENCY` 16, débit ≤ `MAX_REQUESTS_PER_SECOND` 5 req/s, profondeur ≤ `MAX_DEPTH` 10, pages ≤ `MAX_PAGES` 10 000, réponse ≤ `MAX_RESPONSE_BYTES` 10 Mo. `AppConfig.unique_source_ids` refuse une source dépassant les limites globales, les ids dupliqués, plus de 500 sources ; `Source.base_host_is_allowed` impose que l'hôte de `base_url` figure dans `allowed_hosts`. Les messages d'erreur ne réinjectent aucune valeur brute.

`SourceRegistry.list_enabled()` / `get_enabled(source_id)` refusent une source désactivée ou inconnue.

### 2.3 Collecte bornée — `hashscrap/middleware.py`, `hashscrap/spiders/bounded.py`, `hashscrap/crawler.py`

| Élément | Comportement |
|---|---|
| `URLSafetyMiddleware` (priorité 50) | `IgnoreRequest` si la politique URL/DNS refuse la requête ; relancée sur chaque redirection car `RedirectMiddleware` est à 600 |
| `RequestBudgetMiddleware` (40) | plafonne les **tentatives** sortantes (redirections et retries incluses) via `HASHSCRAP_MAX_REQUESTS` |
| `BoundedSpider` | `start_requests` / `parse` / `on_error` ; scope `allowed_domains`, arrêt à `max_pages` et `max_depth`, classement des échecs `http_429` / `http_5xx` / `request_failed` ; item = `source_id`, `url`, `status`, `content_type`, `body_bytes`, `title`, `links_count`, `fetched_at`, et **`body` uniquement si `include_body`** |
| `_settings(source, on_item)` | `ROBOTSTXT_OBEY`, `DOWNLOAD_DELAY = 1/requests_per_second`, `DOWNLOAD_MAXSIZE`, `DEPTH_LIMIT`, `RETRY_TIMES=2`, `DOWNLOAD_FAIL_ON_DATALOSS`, `TELNETCONSOLE_ENABLED=False`, `LOG_LEVEL=WARNING`, extension `ResultCollector`, callback `HASHSCRAP_ON_ITEM` |
| `collect(config, source_id, start_urls, *, on_item=None)` | refuse une liste vide ou une URL de départ hors périmètre, puis renvoie `CrawlResult`. Le corps n'est attaché à l'item que si `on_item` est fourni (`include_body=on_item is not None`), ce qui laisse le crawl CLI sans base à mémoire bornée |

### 2.4 Extraction avec provenance — `hashscrap/extraction.py`

`extract_html(url=…, status_code=…, content_type=…, body=…, fetched_at=…, max_body_bytes=10 Mo)` renvoie `ExtractionResult(document, observations)`.

- `DocumentRecord` : `original_url`, `canonical_url` (observé, jamais substitué), `status_code`, `content_type`, `fetched_at` UTC obligatoire, `parser_name`/`parser_version`.
- `Observation` : `field_name`, `raw_value`/`normalized_value` (≤ 20 000 caractères), `observed_at` UTC, `extractor`+version, **`evidence_ref` obligatoire**, `validation_status ∈ {unreviewed, validated, rejected}`.
- Champs extraits : `title`, `meta_description`, `canonical_url`, `link` + `link_url` avec index comme preuve (`css:a[href]:{index}`).
- Robustesse : charset HTTP sinon `utf-8`, `errors="replace"`, corps non-HTML → document sans observation, corps trop volumineux → `ValueError`.

### 2.5 Empreintes et doublons — `hashscrap/fingerprints.py`

`fingerprint_content(body)` = SHA-256 hex des octets exacts. `DeduplicationIndex.register(document, body)` → `DuplicateMatch(document_id, content_sha256, url_duplicate_of, content_duplicate_of)` : **signale, ne supprime jamais**. L'identité d'URL conserve la query string et retire les ports 80/443 par défaut.

### 2.6 Exports — `hashscrap/exports.py`

- `export_jsonl(results, source_ids=, fingerprints=)` : un document par ligne, clés triées, documents sans observation conservés, sortie identique octet pour octet à entrées égales.
- `export_csv(...)` : `CSV_FIELDS` compte **19 colonnes**, `csv.DictWriter` avec `extrasaction="raise"`, une ligne par observation (ligne dédiée pour un document sans observation). `_spreadsheet_safe()` neutralise l'injection de formule (`=`, `+`, `-`, `@` en tête, ou tabulation/CR/LF initiales) en préfixant `'`.

### 2.7 Corrélation exacte — `hashscrap/correlation.py` *(développée, non câblée)*

`normalize_identifier(entity_type, value)` : `organization` (espaces normalisés + `casefold`), `domain` (IDNA, `*.` retiré, labels ≤ 63), `ip` (`ipaddress.compressed`, **uniquement `is_global`**), `url` (absolue, sans credentials, port par défaut retiré, fragment retiré).
`decide_match(identifier, matching_entity_ids)` : 0 correspondance → `unmatched` ; 1 correspondance et type ≠ organisation → `accepted_exact` ; **organisation toujours `needs_review`** ; plusieurs correspondances exactes → `needs_review`. Aucun auto-merge ambigu.

Ces deux fonctions ne sont appelées **que depuis `tests/test_correlation.py`** : aucune écriture dans `entities`, `entity_observations` ou `entity_relationships` n'existe dans le paquet (voir §4).

### 2.8 Rapports sourcés — `hashscrap/reports.py`

`InvestigationReport` (`schema_version` `1.0` via `REPORT_SCHEMA_VERSION`, `extra="forbid"`, horodatages timezone-aware obligatoires, convertis en UTC) avec sources, observations, relations, erreurs, limites.
`render_report_json` : UTF-8, clés triées, indent 2, aucune valeur inventée.
`render_report_markdown` : couverture des sources, observations avec classification/preuve/validation, relations sourcées, erreurs, limites, plus deux mentions obligatoires sur la non-exhaustivité et le statut des hypothèses. Tri déterministe des cinq collections, échappement Markdown (`\`, `|`, CR, LF).

### 2.9 Persistance — `hashscrap/models.py`, `hashscrap/db.py`, `hashscrap/jobs.py`, `migrations/`

8 tables : `sources`, `crawl_jobs`, `crawl_runs`, `documents`, `observations`, `entities`, `entity_observations`, `entity_relationships`.
Contraintes : `CHECK` sur les statuts de job/run, `attempts ≥ 0 ∧ attempts ≤ max_attempts`, `status_code ∈ [100,599]`, `length(content_sha256) = 64`, `entity_type ∈ {organization, domain, ip, url}`, `review_status ∈ {unreviewed, accepted_exact, needs_review, rejected}`, unicité `(entity_id, observation_id)`, `idempotency_key` unique. Index sur `documents(canonical_url)`, `documents(content_sha256)`, `documents(source_id, last_seen_at)`, `entities(entity_type, normalized_identifier)`, `crawl_jobs(status, created_at)`, `crawl_runs(job_id, started_at)`.
Deux migrations : `0001_initial_schema` (`down_revision = None`) → `0002_entity_correlation` (`down_revision = "0001_initial_schema"`), chaîne vérifiée statiquement.

`database_url()` refuse une URL absente (`HASHSCRAP_DATABASE_URL is required`) ou non PostgreSQL (`must target PostgreSQL`) ; `create_database_engine()` ajoute `pool_pre_ping`.

`create_job(session, …)` est idempotent sur `idempotency_key`, refuse la réutilisation d'une clé avec un payload différent, et insère sous **savepoint**. `transition_job()` applique le graphe `queued → running → succeeded/failed/cancelled`, `failed → queued`, sous `SELECT … FOR UPDATE`, incrémente `attempts` au passage en `running`, refuse de dépasser `max_attempts`, et valide `error_code` contre `^[a-z0-9_]{1,80}$` — désormais **appelé en production par le pipeline**. `recover_stale_jobs(session, *, older_than=…)` sélectionne les jobs `running` dont `updated_at < older_than` avec `FOR UPDATE SKIP LOCKED` ; il les remet en `queued`, ou en `failed` quand `attempts` a atteint `max_attempts`, avec `error_code="worker_interrupted"`.

### 2.10 Pipeline de bout en bout — `hashscrap/pipeline.py` *(nouveau)*

| Fonction | Rôle | Bornes / garanties |
|---|---|---|
| `ensure_source(session, source)` | Insère ou met à jour la ligne `sources` d'une source configurée | écrit `policy_config` (`base_url`, `allowed_hosts`, `limits`) ; l'appelant committe |
| `extract_from_item(item, *, max_body_bytes=10 Mo)` | Convertit un item scrapé en `(ExtractionResult, sha256)` | `KeyError` → `ValueError` ; corps non-`bytes` ou > `max_body_bytes` → `ValueError` **avant** parsing ; `fetched_at` absent → `datetime.now(UTC)` |
| `persist_extraction(session, result, *, content_sha256, source_id, run_id)` | Écrit un `Document` et ses nouvelles `Observation`, provenance conservée | idempotent sur `original_url` (met à jour `last_seen_at` et l'empreinte, ne duplique ni document ni observation) ; exige un digest de 64 caractères |
| `collect_and_persist(session, config, source_id, start_urls)` | Chaîne collecte → extraction → persistance sur **une** source bornée | crée un `crawl_job` (clé unique par invocation) et un `crawl_run`, transitionne le job ; un document rejeté est isolé dans un savepoint (`session.begin_nested()`) et n'avorte pas le run ; renvoie `CollectionSummary` |

La collecte transmet le corps : `collect(...)` est appelé avec `on_item`, donc le corps de réponse parvient à `extract_from_item` (il n'est plus seulement compté en octets). `CollectionSummary.to_dict()` (JSON trié) est la sortie de `hashscrap run`.

### 2.11 Assembleur de rapport — `hashscrap/report_builder.py` *(nouveau)*

`build_report(session, *, investigation_id, title, scope, source_key=None, max_observations=1000, max_relationships=1000)` assemble un `InvestigationReport` (schéma 1.0) depuis les lignes persistées. Lecture seule : aucune écriture, aucun commit, aucun accès réseau. `ORDER BY` + `LIMIT` sur les observations et les relations. Provenance obligatoire : une observation sans `evidence_ref` ou sans URL d'origine, une relation sans `evidence_ref`, est **écartée** et comptée dans les limitations, jamais complétée par une valeur inventée. Horodatages forcés en UTC ; les limites sont explicites (troncature à `max_observations`/`max_relationships`, périmètre restreint à une source, `unreviewed`). `_source_status` mappe les statuts de run vers `succeeded` / `failed` / `partial` / `unavailable` sans inventer de couverture.

### 2.12 API read-only — `hashscrap/api.py` *(nouveau)*

`create_api(engine=None)` construit une application FastAPI (`version="1.0"`) sans **aucune route d'écriture**. Préfixe `API_PREFIX = /api/v1`, `MAX_LIMIT = 100` ; toute réponse est bornée et paginée.

| Route | Réponse |
|---|---|
| `GET /api/v1/health` | `{status, schema_version}` |
| `GET /api/v1/summary` | compteurs `sources`, `documents`, `observations`, `entities`, `runs_total`, `runs_succeeded`, `runs_failed`, `observations_pending_review`, `last_run_at` |
| `GET /api/v1/sources` | sources configurées, hôtes autorisés, limites lues dans `policy_config` |
| `GET /api/v1/runs?limit=` | dernières collectes (état, compteurs, volumétrie), `limit` 1..100, défaut 20 |
| `GET /api/v1/documents?limit=&offset=` | `{total, items[]}`, `observations_count` par document |
| `GET /api/v1/documents/{id}` | document + observations ; `404` si inconnu |
| `GET /api/v1/entities?limit=` | entités normalisées, statut de revue, nombre d'observations |

Les modèles Pydantic sont `extra="forbid"` ; `_aware()` impose des horodatages UTC en sortie (SQLite peut renvoyer des datetimes naïfs). Les réponses dérivent des modèles persistés, pas d'une invention.

### 2.13 CLI — `hashscrap/cli.py`

`hashscrap --version`, `crawl --config <json> --source <id> [--url …]`, `run --config … --source … [--url …]`, `serve [--host --port]`, `jobs status <uuid>`, `jobs recover [--stale-after <s>]` (défaut `DEFAULT_STALE_AFTER_SECONDS = 3600`, refus si négatif), `report [--format markdown|json] [--investigation-id --title --scope --source --output --max-observations --max-relationships]`.

Codes de sortie : `0` succès (`run` renvoie `1` si des échecs sont enregistrés), `1` échec de collecte/rapport ou erreur inattendue, `2` usage / configuration / job introuvable / base absente ou non PostgreSQL. Les erreurs n'impriment ni URL complète, ni corps de réponse, ni trace d'exception.

### 2.14 Benchmark — `hashscrap/benchmark.py`

`run_benchmark(count=10_000, duplicate_every=100)` : corpus synthétique en mémoire, réseau désactivé, `tracemalloc` pour la mémoire de pointe, métriques d'exactitude des titres, de taux de doublons et de volume d'export. CLI `--count 1..100000`, `--duplicate-every`, `--output`. Résultats mesurés archivés dans `benchmark-results/10k.json` et `100k.json` (`docs/BENCHMARK.md`). C'est le seul appelant non-test des générateurs d'`exports.py`.

### 2.15 Infrastructure

`compose.yaml` : service `db` (postgres:16-alpine, healthcheck, `mem_limit` 1 Go, 1 CPU), service `app` (`read_only: true`, tmpfs, 768 Mo, 1 CPU), réseau `database` **interne** et réseau `egress` séparé. `Dockerfile`, `docker/wait-for-postgres.py`, `scripts/backup-db.sh` et `scripts/restore-db.sh` existent. Aucun de ces artefacts n'a été exécuté dans cet environnement (voir §6).

---

## 3. État de l'interface web (`apps/web`)

Shell TanStack Start/Router + Tailwind 4 (vite 7, vitest 3), design system fusionné : l'API de base de `EmptyState`, `ErrorState`, `LoadingSkeleton` et `StatusBadge` est conservée.

| Élément | État vérifié |
|---|---|
| `routes/index.tsx` (Vue d'ensemble) | Lit l'API via server function : `fetchSummary`, `fetchRuns(5)`, `fetchDocuments(5)` |
| `routes/$section.tsx` | Lit `fetchSources()` **uniquement** quand `section === "sources"` ; toutes les autres sections affichent « Fonction non connectée » + « Aucune donnée chargée » |
| `routes/collectes.tsx` + `components/CollectesView.tsx` | Branchée sur `GET /api/v1/runs` (`fetchRuns`, `RUNS_LIMIT = 20`) ; états **chargement / erreur / vide distincts**, bouton de retry, filtre par état, répartition par état |
| `lib/run-status.ts` | `describeRunStatus(status)` → `{ label, variant, known, description }` et `statusTone(status)` → ton visuel ; un statut hors contrat est affiché tel quel, jamais interprété |
| Sections restantes | `investigations`, `entites`, `chronologie`, `preuves`, `rapports`, `parametres` : écrans d'attente, aucune donnée d'exemple présentée comme réelle |
| `prototypes/hashscrap-ui/index.html` | Maquette statique, données fictives assumées, jamais câblée sur les API |

Aucune donnée d'exemple n'est présentée comme réelle : une valeur absente n'est jamais remplacée par un zéro ou un littéral inventé (enveloppe `ApiResult` avec `data: null` + `problem`).

Duplication de présentation encore présente (à résorber lors de #15) : `lib/run-status.ts` (`describeRunStatus`/`statusTone`) double `lib/api-format.ts` (`runLabel`/`runTone`) ; `lib/run-format.ts` (`formatBytes`/`formatDateTime`) double aussi `lib/api-format.ts` ; `lib/api.ts` (client navigateur) double `lib/api.server.ts` (client serveur).

---

## 4. Manques structurels restants

Ces manques sont vérifiés par recherche d'appels sur l'ensemble du paquet, pas déduits.

### 4.1 Issue #35 — corrélation et ordonnanceur non câblés

1. **Corrélation non branchée.** `decide_match` et `normalize_identifier` ne sont référencés que par `tests/test_correlation.py`. Aucun code du paquet n'insère dans `entities`, `entity_observations` ou `entity_relationships`. `build_report` sait *lire* ces tables, mais rien ne les alimente.
2. **Pas d'ordonnanceur en boucle.** `create_job` et `transition_job` ont maintenant un appelant de production (`pipeline.collect_and_persist`) et `recover_stale_jobs` est appelé par `hashscrap jobs recover`. Mais aucun processus ne consomme `crawl_jobs` en continu : chaque `hashscrap run` est une invocation ponctuelle.
3. **Exports non câblés.** `export_csv` / `export_jsonl` ne sont appelés que par les tests et par `benchmark.py` : aucun chemin ne les alimente depuis la base.
4. **DNS rebinding** entre validation et connexion : toujours couvert par la séparation réseau du déploiement (`docs/URL-SECURITY.md`), pas par le code.

### 4.2 Issue #15 — interface partiellement connectée

La Vue d'ensemble, la section Sources et la page Collectes lisent l'API. Les six autres sections restent des écrans d'attente, et la couche de présentation reste dupliquée (§3). Le contrat de lancement/arrêt de collecte n'est pas exposé : l'API est en lecture seule par conception.

### 4.3 Mesures non vérifiées en conditions réelles

- **#9** : les deux migrations existent et s'enchaînent (`0001` → `0002`), mais `alembic upgrade head` n'a pas été exécuté sur une base PostgreSQL vivante. Les tests d'intégration PostgreSQL (`tests/test_jobs_pg.py`) sont ignorés sans `HASHSCRAP_TEST_DATABASE_URL`.
- **#13** : `compose.yaml`, `Dockerfile`, `docker/wait-for-postgres.py`, `scripts/backup-db.sh`, `scripts/restore-db.sh` existent, mais `docker compose config` et `docker compose up` n'ont pas été exécutés ici.

---

## 5. Critères → preuves

| Critère | Verdict | Preuve |
|---|---|---|
| Paquet installable, CLI exposée | Conforme | `python -m hashscrap.cli --version` ; `[project.scripts]` dans `pyproject.toml` |
| Qualité : lint, format, types stricts | Conforme | `ruff check .` → `All checks passed!` ; `ruff format --check .` → `64 files already formatted` ; `mypy hashscrap tests` → `Success: no issues found in 41 source files` |
| Suite de tests verte et hors réseau | Conforme | `pytest -q` → `131 passed, 9 skipped, 1 warning` (les 9 ignorés = `tests/test_jobs_pg.py`, opt-in) |
| Politique URL/DNS testée sur les frontières | Conforme | `tests/test_url_policy.py` |
| Corpus local déterministe | Conforme | `tests/fixtures/corpus/` + `tests/fixture_server.py` |
| Schéma et migrations cohérents | Conforme (statique) | `migrations/versions/0001_initial_schema.py` → `0002_entity_correlation.py` ; chaîne `down_revision` vérifiée dans le code, `alembic upgrade` **non exécuté** |
| Docker Compose configurable | Non vérifié | `compose.yaml` présent ; `docker compose config` **non exécuté** |
| Chaîne collecte → extraction → persistance | Conforme | `pipeline.collect_and_persist`, `persist_extraction`, `extract_from_item` ; `tests/test_pipeline.py`, `tests/test_cli_run.py` |
| API HTTP lecture seule et bornée | Conforme | `hashscrap/api.py` (aucune route d'écriture, `MAX_LIMIT = 100`) ; `tests/test_api.py` |
| Rendu d'un rapport à partir de données collectées | Conforme | `report_builder.build_report` → `render_report_*` ; `tests/test_report_builder.py` + tests CLI `report` |
| Interface web raccordée à l'API | Partiel | Vue d'ensemble, Sources et Collectes branchées ; autres sections en attente (§3) |
| Interface web : tests et types | Conforme | vitest 8 fichiers / 49 tests, build vite + `tsc --noEmit` sans erreur (binaires lancés directement, §6) |
| Corrélation câblée au pipeline | **Non satisfait** | §4.1 |
| Ordonnanceur de jobs consommant `crawl_jobs` | **Non satisfait** | §4.1 |
| Exports depuis la base | **Non satisfait** | §4.1 |

---

## 6. Commandes exécutées et résultats

Environnement : Windows, Python 3.11 via le dépôt-local `.venv` (le Python système n'a ni ruff, ni mypy, ni pytest).

| Commande | Résultat |
|---|---|
| `.\.venv\Scripts\python.exe -m ruff check .` | `All checks passed!` |
| `.\.venv\Scripts\python.exe -m ruff format --check .` | `64 files already formatted` |
| `.\.venv\Scripts\python.exe -m mypy hashscrap tests` | `Success: no issues found in 41 source files` |
| `.\.venv\Scripts\python.exe -m pytest -q` | `131 passed, 9 skipped, 1 warning`, exit 0 |
| `node node_modules/vitest/vitest.mjs run --root apps/web` | `Test Files 8 passed (8)`, `Tests 49 passed (49)` |
| `node node_modules/vite/bin/vite.js build` (cwd `apps/web`) | build client (185 modules) + SSR (77 modules), `✓ built in 4.63s` |
| `node node_modules/typescript/bin/tsc --noEmit` (cwd `apps/web`) | aucune erreur |

**Pourquoi les binaires sont invoqués directement :** dans l'environnement de revue, le wrapper `npm` n'est pas invocable (erreur de relais WSL), donc `npm run test` et `npm run typecheck` ne peuvent pas être lancés tels quels. Les scripts déclarés dans `apps/web/package.json` sont `test: vitest run`, `typecheck: vite build && tsc --noEmit`, `build: vite build` ; leurs équivalents ont été exécutés directement, binaire par binaire, sans passer par `npm`. `npm run test` et `npm run typecheck` (via le wrapper) **n'ont pas été exécutés** et ne sont donc pas revendiqués.

Non exécutés et donc non revendiqués :

- `alembic upgrade head` sur une base PostgreSQL réelle ;
- `docker compose config`, `docker compose up` (et tout `docker compose run … alembic upgrade head`) ;
- toute collecte contre un site réel (les tests utilisent le corpus local et n'accèdent pas à Internet) ;
- `npm run test` / `npm run typecheck` via le wrapper `npm` ;
- les tests `tests/test_jobs_pg.py` (ignorés faute de `HASHSCRAP_TEST_DATABASE_URL`).

---

## 7. Revue de sécurité

- **SSRF** : la politique est appliquée dans le downloader, donc sur chaque redirection, et pas seulement sur les URL de départ. Elle valide la résolution DNS entière, pas la seule forme de l'URL.
- **Ranges sensibles** : `is_global` exclut privé, loopback, link-local, multicast, non spécifié et réservé ; les littéraux IPv6 entre crochets sont gérés ; `%zone` est retiré avant analyse.
- **Budgets** : octets, profondeur, nombre de pages, requêtes (tentatives incluses), concurrence, débit, timeout, retries ont une borne en configuration *et* une borne en code ; la configuration ne peut pas les dépasser. Le pipeline réutilise `max_response_bytes` de la source pour refuser un corps hors limite avant parsing.
- **Données non fiables** : le contenu collecté n'est jamais exécuté ni interprété ; il est stocké et rendu comme texte ; Markdown échappé.
- **Provenance** : l'API et le rapport n'exposent que des champs persistés ; un élément sans provenance complète est écarté et compté, jamais complété. Aucune fusion automatique dans la corrélation (organisations et cas multi-correspondance toujours en revue).
- **Logs** : la CLI n'affiche ni URL complète, ni corps, ni trace d'exception ; `error_code` est contraint à un identifiant sûr (`^[a-z0-9_]{1,80}$`).
- **CSV** : neutralisation de l'injection de formule couverte par test.
- **API** : lecture seule par conception — aucune route d'écriture ; sessions non commitantes, `limit` borné, `offset` positif ou nul ; modèles `extra="forbid"`.
- **Idempotence / concurrence** : savepoint + contrainte unique sur `idempotency_key`, `FOR UPDATE` sur les transitions, `SKIP LOCKED` sur la récupération ; savepoint autour de chaque document rejeté dans le pipeline.
- **Point de vigilance assumé** : le DNS rebinding entre la validation et la connexion n'est pas traité dans le code ; il reste couvert par la séparation réseau `database` (interne) / `egress` du déploiement, comme documenté dans `docs/URL-SECURITY.md`. Ne pas affaiblir cette séparation.

---

## 8. Limites connues

1. La corrélation n'est pas câblée : aucune entité ni relation n'est créée en base par un flux de production (#35).
2. Aucun ordonnanceur : les jobs ne sont créés que par une invocation ponctuelle de `hashscrap run` ; rien ne consomme `crawl_jobs` en boucle.
3. Les exports (`export_csv`, `export_jsonl`) ne sont alimentés que par le benchmark et les tests ; aucun export depuis la base n'est câblé.
4. L'API est strictement en lecture seule : pas de création de source, ni de lancement/arrêt/relance de collecte.
5. `apps/web` : six sections sur huit restent des écrans d'attente ; la présentation est encore dupliquée (`run-status.ts` vs `api-format.ts`, `run-format.ts` vs `api-format.ts`, `api.ts` vs `api.server.ts`) (#15).
6. `alembic upgrade head` et `docker compose` n'ont pas été exécutés sur une base vivante ; leur conformité opérationnelle n'est pas vérifiée (#9, #13).
7. Le benchmark est un benchmark de composants (extraction, empreintes, export), pas un benchmark Scrapy/PostgreSQL de bout en bout — ses limites sont écrites dans le rapport lui-même.
8. La politique d'authentification, de paywall, de CAPTCHA et de rate-limit n'est pas implémentée, et ne doit pas l'être.
9. La couverture de tests n'est pas exhaustive : la suite couvre les chemins nominaux, les erreurs et les frontières de sécurité connues, pas l'ensemble des comportements possibles.

---

## 9. Suivi

- **#35 — pipeline d'orchestration** (`docs/ISSUE-35-PIPELINE-ORCHESTRATION.md`, https://github.com/digitaleflex/hashscrap/issues/35) : **partiellement livrée**. Sont en place la persistance de bout en bout, la CLI `run`, l'API lecture seule et l'assembleur de rapport. Restent ouverts le câblage de la corrélation, l'ordonnanceur consommant `crawl_jobs` et l'export depuis la base.
- **#15 — interface web** : **partielle**. Vue d'ensemble, Sources et Collectes lisent l'API ; à poursuivre section par section et à dédoublonner côté présentation.
- **#9 — persistance / migrations** : livrée (schéma, 2 migrations, contraintes) ; exécution réelle d'`alembic upgrade` non revérifiée ici.
- **#10 — jobs** : livrée (`create_job`, `transition_job`, `recover_stale_jobs`, commandes `jobs status` / `jobs recover`).
- **#13 — Docker** : livrée (fichiers de déploiement) ; non exécutée ici.
- Aucune licence : décision PRD §13 toujours pendante — ne pas ajouter de fichier de licence.
