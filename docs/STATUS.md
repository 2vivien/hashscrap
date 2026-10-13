# État des fonctionnalités — relevé des fonctions développées et opérationnelles

Date du relevé : 2026-10-13 · Branche : `main` (`b83b515`) · Périmètre : issues #1 à #14 fusionnées + shell UI #15.

Ce document applique le « Expected completion report » de [AI Agent Issue Guide](AI-AGENT-ISSUE-GUIDE.md) à l'ensemble du dépôt plutôt qu'à une seule issue. Il ne remplace aucun rapport d'issue et ne claim aucun contrôle qui n'a pas été exécuté.

---

## 1. Résumé

Quatorze modules Python sont développés, testés et cohérents avec le PRD. Chacun est une bibliothèque isolée : aucun orchestrateur ne les relie encore. La collecte CLI s'exécute et renvoie du JSON en mémoire ; rien n'est persisté en base. L'interface web `apps/web` est un shell visuel sans backend, qui affiche explicitement l'absence de connexion et aucune donnée fictive.

Autrement dit : les briques sont prêtes, la chaîne de bout en bout ne l'est pas. C'est le seul manque structurel identifié, et il fait l'objet de l'issue #35 (`docs/ISSUE-35-PIPELINE-ORCHESTRATION.md`).

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

`load_config(path)` → `AppConfig` (Pydantic `extra="forbid"`). `CrawlLimits` plafonne timeout ≤ 120 s, concurrence ≤ 16, débit ≤ 5 req/s, profondeur ≤ 10, pages ≤ 10 000, réponse ≤ 10 Mo. `AppConfig.unique_source_ids` refuse toute source qui dépasse les limites globales, les ids dupliqués, plus de 500 sources ; `Source.base_host_is_allowed` impose que l'hôte de `base_url` figure dans `allowed_hosts`. Les messages d'erreur ne réinjectent aucune valeur brute.

`SourceRegistry.list_enabled()` / `get_enabled(source_id)` refusent une source désactivée ou inconnue.

### 2.3 Collecte bornée — `hashscrap/middleware.py`, `hashscrap/spiders/bounded.py`, `hashscrap/crawler.py`

| Élément | Comportement |
|---|---|
| `URLSafetyMiddleware` (priorité 50) | `IgnoreRequest` si la politique URL/DNS refuse la requête ; relancée sur chaque redirection car `RedirectMiddleware` est à 600 |
| `RequestBudgetMiddleware` (40) | plafonne les **tentatives** sortantes (redirections et retries incluses) via `HASHSCRAP_MAX_REQUESTS` |
| `BoundedSpider` | `start_requests` / `parse` / `on_error` ; scope `allowed_domains`, arrêt à `max_pages` et `max_depth`, classement des échecs `http_429` / `http_5xx` / `request_failed` |
| `_settings(source)` | `ROBOTSTXT_OBEY`, `DOWNLOAD_DELAY = 1/requests_per_second`, `DOWNLOAD_MAXSIZE`, `DEPTH_LIMIT`, `RETRY_TIMES=2`, `DOWNLOAD_FAIL_ON_DATALOSS`, `TELNETCONSOLE_ENABLED=False`, `LOG_LEVEL=WARNING`, extension `ResultCollector` |
| `collect(config, source_id, start_urls)` | refuse une liste vide ou une URL de départ hors périmètre, puis renvoie `CrawlResult` (comptages + items + motifs d'erreur) |

### 2.4 Extraction avec provenance — `hashscrap/extraction.py`

`extract_html(url=…, status_code=…, content_type=…, body=…, fetched_at=…, max_body_bytes=10 Mo)` renvoie `ExtractionResult(document, observations)`.

- `DocumentRecord` : `original_url`, `canonical_url` (observé, jamais substitué), `status_code`, `content_type`, `fetched_at` UTC obligatoire, `parser_name`/`parser_version`.
- `Observation` : `field_name`, `raw_value`/`normalized_value` (≤ 20 000 caractères), `observed_at` UTC, `extractor`+version, **`evidence_ref` obligatoire**, `validation_status ∈ {unreviewed, validated, rejected}`.
- Champs extraits : `title`, `meta_description`, `canonical_url`, `link` + `link_url` avec index comme preuve (`css:a[href]:{index}`).
- Robustesse : charset HTTP sinon `utf-8`, `errors="replace"`, corps non-HTML → document sans observation, corps trop volumineux → `ValueError`.

### 2.5 Empreintes et doublons — `hashscrap/fingerprints.py`

`fingerprint_content(body)` = SHA-256 hex des octets exacts. `DeduplicationIndex.register(document, body)` → `DuplicateMatch(document_id, content_sha256, url_duplicate_of, content_duplicate_of)` : **signale, ne supprime jamais**. L'identité d'URL conserve la query string (contenu potentiellement différent) et retire les ports 80/443 par défaut.

### 2.6 Exports — `hashscrap/exports.py`

`export_jsonl(results, source_ids=, fingerprints=)` : un document par ligne, clés triées, documents sans observation conservés, sortie identique octet pour octet à entrées égales.
`export_csv(...)` : 19 colonnes, une ligne par observation (ligne dédiée pour un document sans observation). `_spreadsheet_safe()` neutralise l'injection de formule (`=`, `+`, `-`, `@` en tête, ou tabulation/CR/LF initiales) en préfixant `'` (cf. `test_fingerprints_exports.py`).

### 2.7 Corrélation exacte — `hashscrap/correlation.py`

`normalize_identifier(entity_type, value)` : `organization` (espaces normalisés + `casefold`), `domain` (IDNA, `*.` retiré, labels ≤ 63), `ip` (`ipaddress.compressed`, **uniquement `is_global`**), `url` (absolue, sans credentials, port par défaut retiré, fragment retiré). Chaque méthode est nommée etreturned.
`decide_match(identifier, matching_entity_ids)` : 0 correspondance → `unmatched` ; 1 correspondance et type ≠ organisation → `accepted_exact` ; **organisation toujours `needs_review`** (homonymes possibles) ; plusieurs correspondances exactes → `needs_review`. Aucun auto-merge ambigu.

### 2.8 Rapports sourcés — `hashscrap/reports.py`

`InvestigationReport` (`schema_version` `1.0`, `extra="forbid"`, horodatages UTC obligatoires) avec sources, observations, relations, erreurs, limites.
`render_report_json` : UTF-8, clés triées, indent 2, aucune valeur inventée.
`render_report_markdown` : couverture des sources, observations avec classification/preuve/validation, relations sourcées, erreurs, limites, plus deux mentions obligatoires sur la non-exhaustivité et le statut des hypothèses. Tri déterministe des cinq collections, échappement Markdown (`\`, `|`, CR, LF).

### 2.9 Persistance — `hashscrap/models.py`, `hashscrap/db.py`, `hashscrap/jobs.py`, `migrations/`

8 tables : `sources`, `crawl_jobs`, `crawl_runs`, `documents`, `observations`, `entities`, `entity_observations`, `entity_relationships`.
Contraintes : `CHECK` sur les statuts de job/run, `attempts ≥ 0 ∧ attempts ≤ max_attempts`, `status_code ∈ [100,599]`, `length(content_sha256) = 64`, `entity_type ∈ {organization, domain, ip, url}`, `review_status ∈ {unreviewed, accepted_exact, needs_review, rejected}`, unicité `(entity_id, observation_id)`, `idempotency_key` unique. Index sur `documents(canonical_url)`, `documents(content_sha256)`, `documents(source_id, last_seen_at)`, `entities(entity_type, normalized_identifier)`, `crawl_jobs(status, created_at)`, `crawl_runs(job_id, started_at)`.
Deux migrations : `0001_initial_schema` → `0002_entity_correlation`, enchaînées.

`database_url()` refuse une URL absente ou non PostgreSQL ; `create_database_engine()` ajoute `pool_pre_ping`.

`create_job(session, …)` est idempotent sur `idempotency_key`, refuse la réutilisation d'une clé avec un payload différent, et insère sous **savepoint** pour ne pas empoisonner la transaction appelante en cas de conflit concurrent. `transition_job()` applique le graphe `queued → running → succeeded/failed/cancelled`, `failed → queued`, sous `SELECT … FOR UPDATE`, incrémente `attempts` au passage en `running`, refuse de dépasser `max_attempts`, et valide `error_code` contre `^[a-z0-9_]{1,80}$`. `recover_stale_jobs(older_than=…)` reprend les jobs `running` trop anciens avec `FOR UPDATE SKIP LOCKED` (`worker_interrupted`).

### 2.10 CLI — `hashscrap/cli.py`

`hashscrap --version`, `hashscrap crawl --config <json> --source <id> [--url …]`, `hashscrap jobs status <uuid>`.
Codes de sortie : `0` succès, `1` échec de collecte ou erreur inattendue, `2` usage / configuration / job introuvable. Les erreurs n'impriment ni URL, ni corps de réponse, ni détail d'exception.

### 2.11 Benchmark — `hashscrap/benchmark.py`

`run_benchmark(count=10_000, duplicate_every=100)` : corpus synthétique en mémoire, réseau désactivé, `tracemalloc` pour la mémoire de pointe, métriques d'exactitude des titres, de taux de doublons et de volume d'export. CLI `--count 1..100000`, `--duplicate-every`, `--output`. Résultats mesurés archivés dans `benchmark-results/10k.json` et `100k.json` (`docs/BENCHMARK.md`).

### 2.12 Infrastructure

`compose.yaml` : service `db` (postgres:16-alpine, healthcheck, `mem_limit` 1 Go, 1 CPU), service `app` (`read_only: true`, tmpfs, 768 Mo, 1 CPU), réseau `database` **interne** et réseau `egress` séparé. `Dockerfile`, `docker/wait-for-postgres.py`, `scripts/backup-db.sh` et `scripts/restore-db.sh`.

---

## 3. Scaffolds sans backend

- `apps/web` — shell TanStack Start/Router + Tailwind 4 (vite 7, vitest 3) : routes `/` et `/$section`, métadonnées de sections dans `src/lib/sections.ts`, feuille `src/styles.css`, test `src/routes/section.test.ts`. Les pages affichent « Fonction non connectée » et « Aucune donnée chargée », les boutons d'action sont `disabled` avec une raison en `title`. **Aucun appel API, aucune server function, aucune donnée d'exemple présentée comme réelle.**
- `prototypes/hashscrap-ui/index.html` — maquette statique, données fictices assumées, jamais câblée sur les API.

---

## 4. Manque structurel : pas de chaîne de bout en bout

Vérifié par recherche d'imports sur l'ensemble du paquet :

1. `BoundedSpider.parse` produit des dictionnaires bruts (`source_id`, `url`, `status`, `content_type`, `body_bytes`, `title`, `links_count`) et **n'appelle jamais `extract_html`** ; le corps de la réponse n'est pas transmis au pipeline.
2. Aucun module n'écrit en base : `crawler` ne connaît pas la couche persistance ; `extraction`, `fingerprints`, `correlation`, `exports` et `reports` ne sont appelés que depuis les tests et le benchmark.
3. Aucun ordonnanceur ne consomme `crawl_jobs` : `create_job`, `transition_job` et `recover_stale_jobs` n'ont aucun appelant en production, et la CLI se contente de lire un job existant.
4. La défense anti **DNS rebinding** au niveau transport reste une responsabilité de la politique réseau du déploiement (`docs/URL-SECURITY.md`), pas du code.

Conséquence opérationnelle : `hashscrap crawl` collecte, extrait au mieux et affiche du JSON ; les documents, observations, entités et relations ne sont jamais écrits dans `documents` / `observations` / `entities` / `entity_relationships`.

---

## 5. Critères → preuves

| Critère | Verdict | Preuve |
|---|---|---|
| Paquet installable, CLI exposée | Conforme | `python -m hashscrap.cli --version` → `hashscrap 0.1.0` ; `pyproject.toml` `[project.scripts]` |
| Qualité : lint, format, types stricts | Conforme | `ruff check .`, `ruff format --check .`, `mypy hashscrap tests` — aucun échec |
| Suite de tests verte et hors réseau | Conforme | `pytest -q` → **96 passed**, exit 0 |
| Politique URL/DNS testée sur les frontières | Conforme | `tests/test_url_policy.py` (94 lignes) |
| Corpus local déterministe | Conforme | `tests/fixtures/corpus/` + `tests/fixture_server.py` |
| Schéma et migrations reproductibles | Conforme | `migrations/versions/0001_initial_schema.py`, `0002_entity_correlation.py` |
| Docker Compose configurable | Conforme (non lancé ici) | `compose.yaml` ; `docker compose config` **non exécuté** dans ce relevé |
| Interface web | Partiel | shell seul ; `npm run test` et `npm run typecheck` **non exécutables** ici (`node_modules` absent) |
| Persistance de bout en bout | **Non satisfait** | section 4 |
| Rendu d'un rapport à partir de données collectées | **Non satisfait** | `render_report_*` existe mais n'a aucun producteur de `InvestigationReport` |

---

## 6. Commandes exécutées et résultats

Environnement : Windows, Python 3.11 via le dépôt-local `.venv` (le Python système n'a ni ruff, ni mypy, ni pytest).

| Commande | Résultat |
|---|---|
| `.\.venv\Scripts\python.exe -m ruff check .` | `All checks passed!` |
| `.\.venv\Scripts\python.exe -m ruff format --check .` | `55 files already formatted` |
| `.\.venv\Scripts\python.exe -m mypy hashscrap tests` | `Success: no issues found in 33 source files` |
| `.\.venv\Scripts\python.exe -m pytest -q` | `96 passed in 25.15s`, exit 0 (un `ConnectionAbortedError` cosmétique est émis par le thread du fixture server sur une connexion annulée côté client ; aucun test en échec) |
| `.\.venv\Scripts\python.exe -m hashscrap.cli --version` | `hashscrap 0.1.0` |
| `.\.venv\Scripts\python.exe -m hashscrap.cli jobs status 00000000-0000-0000-0000-000000000000` | exit 2, `HASHSCRAP_DATABASE_URL is required` |
| `.\.venv\Scripts\python.exe -m hashscrap.benchmark --count 500` | `title_accuracy 1.0`, `pages_per_second 227.732`, `wall_seconds 2.195566` |
| `npm run test` / `npm run typecheck` (dans `apps/web`) | **non exécutés** : `apps/web/node_modules` absent, `vitest` introuvable |

Non exécutés et donc non revendiqués : `alembic upgrade head` sur une base réelle, `docker compose up`, `docker compose config`, une collecte contre un site réel, le build Vite.

---

## 7. Revue de sécurité

- **SSRF** : la politique est appliquée dans le downloader, donc sur chaque redirection, et pas seulement sur les URL de départ. Elle valide la résolution DNS entière, pas la seule forme de l'URL.
- **DNI / ranges sensibles** : `is_global` exclut privé, loopback, link-local, multicast, non spécifié, réservé ; les littéraux IPv6 entre crochets sont gérés ; `%zone` est retiré avant analyse.
- **Budgets** : octets, profondeur, nombre de pages, requêtes (tentatives incluses), concurrence, débit, timeout, retries ont tous une borne en configuration *et* une borne en code ; la configuration ne peut pas les dépasser.
- **Données non fiables** : le contenu collecté n'est jamais exécuté ni interprété ; il est stocké et rendu comme texte ; Markdown échappé.
- **Logs** : la CLI n'affiche ni URL, ni corps, ni trace d'exception ; `error_code` est contraint à un identifiant sûr.
- **CSV** : neutralisation de l'injection de formule couverte par test.
- **Idempotence / concurrence** : savepoint + contrainte unique sur `idempotency_key`, `FOR UPDATE` sur les transitions, `SKIP LOCKED` sur la récupération.
- **Point de vigilance assumé** : le DNS rebinding entre la validation et la connexion n'est pas traité dans le code ; il reste couvert par la séparation réseau `database` (interne) / `egress` du déploiement, comme documenté dans `docs/URL-SECURITY.md`. Ne pas affaiblir cette séparation.

---

## 8. Limites connues

1. Aucune persistance de bout en bout (section 4) — bloque toute utilisation réelle au-delà du crawl ponctuel.
2. Aucun ordonnanceur : les jobs sont créables uniquement via l'API Python.
3. Le corps de réponse n'est pas transmis du spider vers l'extraction ; l'extraction ne peut pas être branchée sans modifier le contrat d'item du spider.
4. `apps/web` non vérifiable dans cet environnement sans `npm install` ; aucun contrat API n'existe encore pour l'alimenter.
5. Le benchmark est un benchmark de composants (extraction, empreintes, export), pas un benchmark Scrapy/PostgreSQL de bout en bout — ses limites sont écrites dans le rapport lui-même.
6. La politique d'authentification, de paywall, de CAPTCHA et de rate-limit n'est pas implémentée, et ne doit pas l'être.

## 9. Suivi

- **#35 — pipeline d'orchestration** (`docs/ISSUE-35-PIPELINE-ORCHESTRATION.md`, https://github.com/digitaleflex/hashscrap/issues/35) : relier collecte → extraction → persistance → corrélation → export/rapport, plus un ordonnanceur de jobs borné. Découpage en deux PR proposé dans le document pour rester relisible.
- **#15 — interface web** : reste à connecter à un contrat API, qui dépend de #35.
- Pas de licence à ajouter tant que la décision du PRD §13 est pendante.