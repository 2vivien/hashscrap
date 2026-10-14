# PostgreSQL et migrations

## Choix

HashScrap utilise SQLAlchemy 2.x, Alembic et le pilote Psycopg 3. PostgreSQL est la source de vérité prévue pour les tâches, runs, documents et observations. Aucun secret de connexion ne doit être enregistré dans le dépôt.

## Configuration

Définir la variable d'environnement `HASHSCRAP_DATABASE_URL`, par exemple dans l'environnement local :

```sh
export HASHSCRAP_DATABASE_URL='postgresql+psycopg://hashscrap:CHANGE_ME@localhost:5432/hashscrap'
```

Utiliser un secret réel fourni par l'environnement ; ne pas committer de fichier contenant les identifiants. Le code et Alembic refusent les URL qui ne ciblent pas PostgreSQL.

## Commandes de migration

Après installation des dépendances du projet :

```sh
pip install -e ".[dev]"
alembic upgrade head
alembic current
alembic downgrade -1
alembic upgrade head
```

La migration initiale crée les tables `sources`, `crawl_jobs`, `crawl_runs`, `documents` et `observations`. La migration `0002_entity_correlation` ajoute `entities`, `entity_observations` et `entity_relationships`.

## Écriture depuis le moteur

La commande `hashscrap run` écrit les tables ci-dessus : une ligne `sources` par source configurée, une ligne `crawl_jobs` et une ligne `crawl_runs` par exécution, puis une ligne `documents` par URL collectée et une ligne `observations` par observation extraite.

- Idempotence : un `original_url` déjà stocké met à jour `last_seen_at` et `content_sha256` au lieu de créer un second document ; une observation déjà présente pour ce document (même `field_name`, `evidence_ref` et `normalized_value`) n'est pas réécrite.
- Provenance conservée : `evidence_ref`, `extractor`, `extractor_version`, `raw_value` et des horodatages UTC.
- Un document refusé à l'extraction est annulé sur un savepoint ; la transaction globale n'est pas empoisonnée.
- La transaction appartient à l'appelant : `hashscrap run` valide une seule fois à la fin.
- Aucune écriture de secrets dans les logs : la commande n'affiche ni URL complète, ni corps de réponse, ni détail d'exception.

Le module `hashscrap/pipeline.py` ne remplace ni `hashscrap.crawler`, ni `hashscrap.extraction`, ni `hashscrap.fingerprints`, ni `hashscrap.models` : il les compose.

## Principes de données

- Identifiants UUID.
- Dates en `TIMESTAMP WITH TIME ZONE` via `DateTime(timezone=True)`; l'application doit fournir des valeurs UTC.
- Statuts de tâches et de runs contrôlés par contraintes SQL.
- Clé d'idempotence unique au niveau des tâches.
- Empreinte SHA-256 de 64 caractères si elle est présente.
- Index non uniques sur URL canonique et empreinte : ils permettent de conserver plusieurs documents et l'historique plutôt que de supprimer silencieusement les observations.
- Suppression d'un document supprime ses observations ; suppression d'une source conserve les documents et tâches en mettant leur référence source à NULL.

## Rollback

`alembic downgrade -1` retire la migration la plus récente. La migration initiale détruit les tables qu'elle a créées : sauvegarder les données avant tout rollback sur une base contenant des données utiles. En production, préférer une migration corrective additive lorsque des données doivent être conservées.

## Validation restant à effectuer

La création sur base vierge, les contraintes référentielles et le rollback doivent être exécutés sur une instance PostgreSQL de test. Les tests de métadonnées inclus ne remplacent pas cette validation d'intégration.
