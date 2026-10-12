# Empreintes, déduplication et exports

## Empreintes de contenu

HashScrap utilise SHA-256 sur les octets exacts du corps HTTP, après application des limites de taille du collecteur. L'empreinte est un identifiant de contenu, pas une preuve d'authenticité. Un changement d'encodage ou de format des octets produit une empreinte différente, même si le texte affiché semble identique.

`fingerprint_content(body: bytes)` retourne l'empreinte hexadécimale de 64 caractères.

## Déduplication non destructive

`DeduplicationIndex.register(document, body)` produit des signaux indépendants :

- `url_duplicate_of` : premier document rencontré pour l'URL canonique, ou l'URL originale si aucune URL canonique n'est déclarée ;
- `content_duplicate_of` : premier document rencontré avec la même empreinte SHA-256.

Le fragment d'URL et la casse du schéma/hôte sont normalisés ; les ports HTTP/HTTPS par défaut sont retirés. Le chemin et la query string sont conservés. Deux URL distinctes au contenu identique restent deux documents, reliés par le signal de doublon de contenu. L'index ne supprime ni ne fusionne les documents et observations.

L'index est en mémoire et couvre la durée de vie de l'instance. La persistance des index relève de l'issue PostgreSQL.

## Exports

- `export_jsonl(results)` émet un objet JSON par document, avec les observations imbriquées. Les clés JSON sont triées, les séparateurs sont compacts et les documents/observations sont triés de façon stable.
- `export_csv(results)` émet une ligne par observation et conserve une ligne pour un document sans observation. Les virgules, guillemets, retours à la ligne et caractères Unicode sont encodés par le module CSV standard.
- Les deux exports acceptent des mappings optionnels `source_ids` et `fingerprints`, indexés par identifiant de document. Quand ces métadonnées ne sont pas fournies, les champs correspondants sont vides/null plutôt qu'inventés.
- Les valeurs textuelles CSV commençant par `=`, `+`, `-` ou `@` (après espaces initiaux), ainsi que celles commençant par tabulation/retour de ligne, sont préfixées d'une apostrophe pour réduire le risque d'injection de formule dans les tableurs.

## Exemple

```python
from hashscrap.extraction import extract_html
from hashscrap.exports import export_jsonl, export_csv
from hashscrap.fingerprints import fingerprint_content

body = b"<html><title>Example</title></html>"
result = extract_html(
    url="https://example.test/",
    status_code=200,
    content_type="text/html; charset=utf-8",
    body=body,
)
digest = fingerprint_content(body)
jsonl = export_jsonl([result], fingerprints={result.document.id: digest})
csv_text = export_csv([result], fingerprints={result.document.id: digest})
```

## Limites

- Le SHA-256 n'est pas une signature cryptographique de l'émetteur.
- La déduplication en mémoire ne survit pas au redémarrage ; l'issue #9 doit fournir la persistance.
- Les champs source/empreinte sont renseignés uniquement si le collecteur ou l'appelant les transmet aux fonctions d'export.
- L'export CSV est conçu pour les tableurs courants, mais les comportements varient selon le logiciel et ses règles d'import.
