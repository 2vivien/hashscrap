# Rapports d'enquête sourcés

## Contrat

Le schéma InvestigationReport est versionné (schema_version: 1.0). Il contient le périmètre, les dates, l'état des sources, les observations, les relations sourcées, les erreurs et les limites de couverture.

Chaque observation exige un identifiant de source, une URL, une date, une référence de preuve et une classification parmi :

- direct_observation : valeur directement extraite ;
- exact_match : correspondance exacte selon une règle documentée ;
- hypothesis : interprétation à confirmer ;
- unverified : élément non vérifié.

Chaque relation exige une observation justificative et une référence de preuve. Le schéma refuse une preuve vide.

## Génération

render_report_json(report) produit du JSON déterministe, avec clés triées et ordre stable des collections. render_report_markdown(report) génère un Markdown lisible, incluant couverture des sources, observations, relations, erreurs et limites.

Exemple d'intégration Python :

    from hashscrap.reports import InvestigationReport, render_report_json, render_report_markdown

    # Construire le modèle depuis les données persistées et validées.
    report = InvestigationReport(...)
    json_text = render_report_json(report)
    markdown_text = render_report_markdown(report)

## Couche applicative

`hashscrap.report_builder.build_report(session, *, investigation_id, title, scope, source_key=None, max_observations=1000, max_relationships=1000)` assemble un `InvestigationReport` à partir des lignes persistées (sources, runs, documents, observations, entités, relations). La fonction est en lecture seule : aucune écriture, aucun commit, aucun accès réseau, aucun texte généré par LLM.

Règles d'assemblage :

- une entrée `sources` par source persistée, avec `status` déduit des runs (`succeeded`, `failed`, `partial`, `unavailable` si aucun run) et `error_code` borné (dernier code connu, jamais de texte d'exception ni d'URL complète) ;
- `value` provient de `normalized_value`, `classification` vaut `direct_observation` et `validation_status` est repris tel quel ;
- relations : entités libellées `entity_type:normalized_identifier`, `evidence_ref` repris de l'observation justificative ;
- `errors` : une entrée par source en échec, message factuel limité à des comptes de pages ;
- `limitations` : sources sans run, observations `unreviewed`, troncature de limite atteinte, périmètre réduit par `source_key` ;
- une observation ou une relation sans `evidence_ref` ou sans URL est écartée et comptabilisée dans les limites, jamais complétée par une valeur inventée ;
- requêtes `select` avec `ORDER BY` déterministe et `LIMIT` borné ; `max_observations`/`max_relationships` doivent être >= 1.

Les horodatages sont normalisés en UTC (les datetimes naïfs renvoyés par SQLite sont traités comme UTC) ; `started_at` vaut le plus petit `started_at` de `CrawlRun` et `finished_at` le plus grand `finished_at` connu.

## CLI

    hashscrap report [--format markdown|json] [--investigation-id ID] [--title TITRE]
                     [--scope PERIMETRE] [--source CLE] [--output CHEMIN]
                     [--max-observations N] [--max-relationships N]

`--format` vaut `markdown` par défaut. Sans `--output`, le rapport est écrit sur stdout ; avec, il est écrit dans le fichier indiqué (UTF-8). Codes de sortie : 0 succès, 2 erreur de configuration ou de validation (`HASHSCRAP_DATABASE_URL` manquante, limite invalide, écriture impossible), 1 erreur inattendue avec message générique — ni contenu de rapport ni trace ne sont écrits sur stderr.

Exemple d'intégration Python :

    from sqlalchemy.orm import Session

    from hashscrap.db import create_database_engine
    from hashscrap.report_builder import build_report
    from hashscrap.reports import render_report_markdown

    with Session(create_database_engine()) as session:
        report = build_report(
            session,
            investigation_id="local",
            title="HashScrap report",
            scope="local persisted evidence",
            source_key="alpha",
            max_observations=200,
        )
    markdown_text = render_report_markdown(report)

Cette couche ne fait qu'assembler et rendre : les générateurs restent purs et déterministes, et le rapport reflète uniquement les sources et observations persistées. Les rapports ne doivent jamais laisser entendre une couverture exhaustive si certaines sources ont échoué ou n'ont pas été interrogées.

