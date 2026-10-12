# Exécution locale avec Docker Compose

## Préparation

Copier le modèle puis définir un secret local robuste :

    cp .env.example .env
    # Modifier POSTGRES_PASSWORD dans .env

Ne jamais committer le fichier .env. Le mot de passe de démonstration du modèle n'est pas utilisable en production.

## Démarrage et migrations

    docker compose up --build
    docker compose run --rm app alembic upgrade head
    docker compose run --rm app python -m hashscrap.cli --version

Le service app attend la disponibilité de PostgreSQL (90 secondes maximum) avant d'exécuter la commande. Le démarrage Compose par défaut affiche l'aide CLI puis termine ; il n'existe pas encore de daemon API permanent dans le MVP. Les collectes se lancent avec `docker compose run --rm app python -m hashscrap.cli crawl --config /path/to/config.json --source SOURCE_ID` après montage explicite du fichier de configuration.

## Réseau et ressources

- PostgreSQL n'a aucun port publié sur l'hôte.
- PostgreSQL est uniquement sur le réseau interne `database`.
- L'application rejoint aussi un réseau de sortie pour joindre les sources HTTP configurées.
- Les conteneurs sont limités en CPU/RAM et utilisent `no-new-privileges`.
- Le conteneur applicatif tourne avec l'UID non-root 10001 et un système de fichiers en lecture seule.
- Les limites Compose sont des plafonds de développement/pilote ; les valeurs doivent être ajustées selon les mesures et le VPS.

## Persistance

Le volume nommé `postgres_data` conserve les données après un redémarrage. Pour arrêter les services sans supprimer les données :

    docker compose down

Ne pas utiliser `docker compose down -v` sauf si la suppression de toutes les données est intentionnelle.

## Sauvegarde et restauration

    ./scripts/backup-db.sh ./backups
    ./scripts/restore-db.sh ./backups/hashscrap-YYYYMMDDTHHMMSSZ.dump

La restauration remplace des objets dans la base cible. Pour un test sûr, démarrer une base PostgreSQL vierge dédiée, restaurer la sauvegarde et vérifier les tables/données avant toute utilisation. Les scripts n'ont pas été exécutés dans cet environnement.

## Vérifications requises avant fusion

    docker compose config
    docker compose up --build
    docker compose run --rm app alembic upgrade head
    ./scripts/backup-db.sh ./backups
    # Restaurer dans une base de test vierge et vérifier le contenu

Aucune de ces commandes n'est déclarée réussie tant qu'elle n'a pas été exécutée sur une installation Docker.
