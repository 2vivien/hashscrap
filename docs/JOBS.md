# Tâches persistantes

## États et transitions

Les états autorisés sont `queued`, `running`, `succeeded`, `failed` et `cancelled`.

- `queued -> running|cancelled`
- `running -> succeeded|failed|cancelled`
- `failed -> queued` uniquement pour une nouvelle tentative, si le budget de tentatives le permet
- `succeeded` et `cancelled` sont terminaux

Chaque transition est exécutée sous verrou de ligne PostgreSQL. Le compteur `attempts` est incrémenté lors du passage à `running`, et ne peut dépasser `max_attempts`. Les codes d'erreur sont des identifiants courts et sûrs, jamais des traces d'exception ou des corps HTTP.

## Idempotence

`create_job` utilise une clé unique en base. Une soumission avec la même clé et le même payload logique retourne la tâche existante. Réutiliser une clé avec une URL, une source, une priorité ou un budget de tentatives différents déclenche une erreur au lieu de masquer le conflit. Le caller contrôle la transaction externe et doit committer.

La contrainte unique PostgreSQL reste l'arbitre final en cas de soumissions concurrentes ; le conflit est isolé dans un savepoint.

## Reprise après arrêt brutal

`recover_stale_jobs(session, older_than=...)` verrouille les tâches `running` périmées. Si des tentatives restent, elles repassent à `queued`; sinon elles passent à `failed`. Le code `worker_interrupted` permet d'expliquer la reprise sans exposer de détails sensibles. Cette fonction doit être appelée par un opérateur/worker avec un seuil de péremption adapté au timeout maximal du crawl.

## Persistance avant succès

Le service de cycle de vie ne marque pas automatiquement une tâche réussie à la fin du crawl. Le worker doit persister les documents et observations dans la même transaction que la transition finale vers `succeeded`. Cette orchestration transactionnelle et les tests de concurrence nécessitent une validation d'intégration PostgreSQL avant fusion.

## Tests

Les tests unitaires couvrent les règles déterministes et la validation des payloads. Les scénarios de double soumission concurrente, rollback, arrêt simulé et verrouillage doivent être exécutés sur PostgreSQL de test.
