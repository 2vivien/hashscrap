# Benchmark HashScrap hors ligne

## Objectif et métriques

Le benchmark de composant génère des pages HTML synthétiques sans requête Internet publique. Il mesure :

- URL synthétiques traitées et pages HTML valides ;
- exactitude des titres extraits sur le corpus contrôlé ;
- nombre et taux de doublons de contenu ;
- octets de corps traités et taille JSONL produite ;
- durée murale, temps CPU et pic d'allocation Python via tracemalloc ;
- versions Python, système et paramètres du corpus.

La génération est déterministe pour une configuration donnée. Les identifiants UUID et les durées rendent le rapport complet variable ; les comptes de pages, d'extractions et de doublons doivent rester stables.

## Exécution 10k

    python -m hashscrap.benchmark --count 10000 --duplicate-every 100 --output benchmark-results/10k.json

## Exécution 100k

    python -m hashscrap.benchmark --count 100000 --duplicate-every 100 --output benchmark-results/100k.json

Le test 100k est manuel et ne doit pas être ajouté au chemin CI normal. Il peut consommer plusieurs centaines de Mo selon l'environnement, car ce benchmark conserve les résultats en mémoire pour mesurer l'export. Commencer par 10k et vérifier les ressources disponibles.

## Interprétation

- title_accuracy mesure uniquement les titres du corpus synthétique et ne représente pas l'exactitude sur des sites réels.
- pages_per_second mesure extraction + empreinte + déduplication + préparation JSONL en mémoire ; ce n'est pas un débit réseau Scrapy.
- peak_traced_memory_bytes ne mesure pas tout le RSS du processus.
- Aucun objectif de débit n'est imposé avant les premières mesures sur l'environnement cible.

## Limite et suite

Ce benchmark valide les composants extraction/empreinte/export hors ligne. Il ne remplace pas le benchmark de bout en bout Scrapy + PostgreSQL, qui nécessite un transport de fixtures local explicitement autorisé en test sans affaiblir la politique SSRF de production. Aucun résultat 10k/100k n'est réputé mesuré avant exécution réelle.
