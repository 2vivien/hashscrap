# Corrélation exacte d'entités

## Types pris en charge

- `domain` : minuscules, retrait du point final, conversion IDNA ; un préfixe wildcard `*.` est ramené au domaine de base.
- `ip` : forme compressée canonique ; seules les adresses globalement routables sont acceptées.
- `url` : HTTP/HTTPS absolu, sans identifiants d'accès ; schéma/hôte en minuscules, port par défaut et fragment retirés, query conservée.
- `organization` : espaces normalisés et casse neutralisée, mais le nom seul ne constitue jamais une preuve d'identité.

## Décision de correspondance

`decide_match` ne réalise aucune fusion destructive. Aucun résultat produit une décision `unmatched`. Une correspondance unique sur domaine/IP/URL normalisé peut être `accepted_exact`. Plusieurs correspondances restent `needs_review`. Les organisations restent toujours `needs_review`, car deux organisations peuvent partager le même nom.

Chaque relation persistée doit référencer une observation justificative non nulle. Les observations originales restent conservées, y compris lorsqu'une décision de corrélation est revue ou rejetée.

## Limites

- Une normalisation est versionnée par le nom de méthode (par exemple `url_normalized_v1`).
- Un domaine identique n'implique pas nécessairement la même organisation juridique.
- Une IP publique peut être partagée ou réattribuée dans le temps.
- Le module pur détermine la décision ; la couche PostgreSQL doit enregistrer les entités, associations, statut de revue et référence de preuve.
