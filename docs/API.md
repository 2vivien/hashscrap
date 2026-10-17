# Contrat d'API (lecture seule)

Version : `1.0` · Préfixe : `/api/v1` · Issue : #35

## Périmètre

L'API **ne comporte aucune route d'écriture**. La création de source, le lancement de collecte, la relance, l'annulation et la génération d'exports restent indisponibles tant que leur contrat ne définit pas les permissions, la journalisation d'audit et les états d'erreur.

Elle dérive des modèles persistés (`hashscrap/models.py`), pas d'une invention : un champ exposé ici existe réellement en base et porte sa provenance. Le document de référence pour le branchement de l'interface est `apps/web/README.md`.

## Démarrage

```sh
export HASHSCRAP_DATABASE_URL='postgresql+psycopg://hashscrap:CHANGE_ME@localhost:5432/hashscrap'
hashscrap serve --host 127.0.0.1 --port 8000
```

En local, le service `api` de `compose.yaml` fait la même chose et publie le port sur la boucleback hôte uniquement. Le port hôte est configurable car `8000` est souvent occupé par un autre service :

```sh
# .env
HASHSCRAP_API_PORT=8001
```

L'interface lit `HASHSCRAP_API_URL` et utilise par défaut `http://127.0.0.1:8001` ; si le port publié change, définir `HASHSCRAP_API_URL` côté serveur web en conséquence. Sans `HASHSCRAP_DATABASE_URL`, la commande échoue immédiatement avec un message explicite au lieu de démarrer un serveur incapable de lire.

## Routes

| Route | Méthode | Réponse |
|---|---|---|
| `/api/v1/health` | GET | `{status, schema_version}` — ne touche pas la base |
| `/api/v1/summary` | GET | compteurs `sources`, `documents`, `observations`, `entities`, `runs_total`, `runs_succeeded`, `runs_failed`, `observations_pending_review`, `last_run_at` |
| `/api/v1/sources` | GET | sources configurées, hôtes autorisés et limites lues dans `policy_config` |
| `/api/v1/runs?limit=` | GET | dernières collectes avec état, compteurs et volumétrie |
| `/api/v1/documents?limit=&offset=` | GET | `{total, items[]}` avec nombre d'observations par document |
| `/api/v1/documents/{id}` | GET | document + observations (valeur normalisée, `evidence_ref`, extracteur, version, statut de validation) ; `404` si inconnu |
| `/api/v1/entities?limit=` | GET | entités normalisées, statut de revue, nombre d'observations |

`limit` est borné à 100, `offset` à une valeur positive ou nulle : une valeur invalide renvoie `422`.

## Contrat de données

- Tous les horodatages sont des instants UTC ISO 8601. Une base qui renvoie des valeurs naïves est normalisée en UTC avant exposition.
- `content_sha256` est renvoyé en intégralité ; c'est la valeur exacte conservée en base.
- Un champ absent reste `null` ou une chaîne vide : l'API n'invente ni valeur par défaut ni indicateur de progression.
- `extra="forbid"` : un champ ajouté au modèle sans être exposé ici reste invisible pour l'interface, ce qui évite qu'un client s'appuie sur un champ non contractuel.

## Sécurité

- Lecture seule et sans authentification : c'est pourquoi le service n'est publié que sur la boucleback hôte et n'est joint qu'au réseau `database` (interne). **Ne pas exposer ce service sur un réseau non maîtrisé avant d'avoir défini l'authentification et les permissions.**
- Aucune valeur de configuration sensible n'est renvoyée : seuls `allowed_hosts` et `limits` sont lus dans `policy_config`.
- Aucun secret n'est renvoyé ni journalisé ; `hashscrap.db.database_url` refuse une URL absente ou non PostgreSQL.

## Tests

`tests/test_api.py` utilise un moteur SQLite en mémoire injecté : aucun service n'est requis. La suite vérifie notamment qu'aucune route d'écriture n'existe (`POST`, `PUT`, `DELETE` renvoient `404`/`405`) et qu'une base vide renvoie des zéros, pas une erreur.