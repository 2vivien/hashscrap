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

Cette issue fournit des générateurs purs : aucune requête de base, aucun accès réseau et aucun texte généré par LLM. La couche d'application doit assembler le modèle depuis les données persistées et fournir les erreurs de collecte réelles. Les rapports ne doivent jamais laisser entendre une couverture exhaustive si certaines sources ont échoué ou n'ont pas été interrogées.
