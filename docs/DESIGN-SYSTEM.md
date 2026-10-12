# HashScrap — Design System & UI Specification

Version 0.1 · 12 octobre 2026 · Statut : proposition de référence MVP  
Prototype : [ouvrir la maquette interactive](../prototypes/hashscrap-ui/index.html)

## 1. Mission et principes

HashScrap est le moteur de collecte de HashCode Intelligence : il transforme des sources autorisées en observations normalisées, traçables et exportables. L’interface doit permettre à un analyste de comprendre en moins de 30 secondes l’état de son investigation, la fiabilité de ses preuves et la prochaine action utile.

Principes : **Decision first**, clarté avant densité, provenance visible, complexité progressive, une action primaire par écran, erreurs actionnables, aucune fonction simulée présentée comme réelle.

Les chiffres, domaines et activités de la maquette sont fictifs. La maquette n’effectue aucune collecte réseau et n’est pas une implémentation backend.

## 2. Direction artistique : Dark Intelligence Workbench

Interface sombre, premium, sobre et dense mais respirante. Noir bleuté, panneaux superposés, accent HashCode lime réservé aux actions primaires et sélections. La donnée, l’état d’une tâche, la provenance et les risques ont des signaux visuels distincts. Pas de glow excessif, de gradients omniprésents ni d’animation décorative.

### Palette
| Token | Valeur | Usage |
|---|---|---|
| Fond global | #080B10 | toile principale |
| Navigation | #0C1118 | sidebar |
| Surface | #111821 | cartes, tableaux |
| Surface élevée | #17212D | panneau actif |
| Bordure | #263241 | séparateurs |
| Texte principal | #F2F5F7 | titres, valeurs |
| Texte secondaire | #9BA9B8 | descriptions |
| HashCode lime | #C5F441 | CTA, sélection, focus |
| Information | #75A7FF | liens et info |
| IA (évolution) | #B69CFF | fonctions assistées |
| Avertissement | #F3B85B | collecte partielle |
| Erreur | #FF7474 | refus, échec |
| Succès | #70D6A2 | résultat confirmé |

Toujours combiner couleur et libellé : la couleur seule ne doit jamais porter le sens.

### Typographie et dimensions
- Police : Inter ou Geist ; fallback system sans-serif.
- Identifiants, URL et empreintes : JetBrains Mono ou monospace.
- Métadonnées 12 px minimum ; contenu dense 13–14 px ; titres de page 26–30 px.
- Grille 4 px, espacements fréquents 8/12/16/24/32 px.
- Contrôles 8 px de rayon, cartes 12 px, panneaux 16 px.
- Ombres discrètes ; préférer les bordures et le contraste des surfaces.

## 3. Shell commun

- Sidebar desktop de 238 px : Vue d’ensemble, Investigations, Sources, Collectes, Entités & relations, Chronologie, Preuves, Rapports. Paramètres en bas.
- Topbar : fil d’Ariane, recherche globale, notifications, profil.
- En-tête de vue : titre, phrase d’orientation, une seule action principale.
- Contenu : tableaux filtrables, métriques contextualisées, détails en panneau.
- Responsive : sidebar compacte à largeur intermédiaire ; navigation simplifiée et tables défilables sur mobile. Cibles de contrôle : 1440, 1024 et 390 px.

## 4. Spécification de chaque vue

### V01 — Vue d’ensemble
Objectif : comprendre l’activité et choisir l’action suivante.  
Contenu : CTA Nouvelle investigation ; indicateurs Collectes actives, Sources surveillées, Documents collectés, À vérifier ; tableau des collectes récentes avec statut/progression ; alertes à traiter ; investigations récentes ; état de provenance.  
États : vide premier usage, chargement, données, erreur de service. Ne pas confondre données manquantes et zéro résultat.

### V02 — Investigations
Objectif : organiser les objectifs et dossiers.  
Liste filtrable par statut, propriétaire et date ; nom, objectif, nombre de sources/observations, dernière activité. Création : nom, objectif, périmètre autorisé, tags. Fiche : Résumé, Sources, Collectes, Preuves, Rapport.

### V03 — Sources
Objectif : gérer les points de départ autorisés.  
Table : nom, type, domaine, validation réseau, dernière vérification, état. Formulaire : URL, nom, portée, limites, fréquence éventuelle, notes. Afficher le domaine normalisé, la validation et la raison de tout refus. Chaque redirection doit être revalidée ; aucune destination interdite ne peut être autorisée par le seul fait qu’une source est enregistrée.

### V04 — Collectes
Objectif : suivre les tâches et diagnostiquer les échecs.  
Table : ID, investigation, source, état, pages traitées, début, durée. Détail : progression, compteurs, journal horodaté, erreurs et motif d’arrêt. États : En attente, En cours, Terminée, Partielle, Échouée, Annulée. Confirmer l’arrêt ; relance conditionnée par les règles d’exploitation.

### V05 — Entités & relations
Objectif : explorer les entités normalisées et leurs liens sourcés.  
MVP : table entités, type, nombre d’observations, confiance, dernière observation ; détail avec liens vers les preuves. Graphe riche en évolution. Ne jamais présenter une correspondance probabiliste comme un fait établi.

### V06 — Chronologie
Objectif : reconstruire la séquence des observations.  
Événements filtrables par dossier, source et type ; distinguer date de publication, date observée et date de collecte. Chaque événement renvoie vers la preuve source.

### V07 — Preuves
Objectif : vérifier origine et intégrité.  
Table : titre, source, date de collecte, type, empreinte, état de vérification. Détail : URL canonique, horodatages, extrait autorisé, métadonnées, SHA-256 et historique. L’empreinte détecte des modifications, mais ne prouve pas à elle seule la véracité du contenu. La provenance doit être conservée dans chaque export.

### V08 — Rapports
Objectif : produire un livrable reproductible.  
Liste par investigation, date, auteur et statut ; aperçu comprenant synthèse, méthodologie, constats, limites et références de preuves. Exports MVP : Markdown et JSON. Les données manquantes et limites de couverture sont explicitement indiquées.

### V09 — Paramètres
Objectif : exposer les règles d’exploitation sans fragiliser la sécurité.  
Limites de pages/profondeur/durée/concurrence, rétention, politique réseau, journaux d’audit et paramètres d’export. Masquer les secrets. Toute modification sensible est confirmée et auditée. Les contrôles de sécurité ne doivent pas pouvoir être désactivés implicitement.

## 5. Composants partagés

AppShell, Sidebar, Topbar, Breadcrumbs, PageHeader, MetricCard, StatusBadge, DataTable, FilterBar, SearchInput, Select, DateRange, SourceChip, EvidenceReference, HashValue, ActivityFeed, ProgressBar, InlineAlert, EmptyState, LoadingSkeleton, ErrorState, ConfirmDialog, DetailPanel, Tabs, Pagination.

Chaque composant interactif doit définir ses états : repos, survol, focus clavier, désactivé, chargement, erreur et succès. Les boutons ont des libellés explicites ; le focus est visible ; contraste WCAG AA visé ; aucune information critique n’est exprimée par couleur seule.

## 6. Sécurité et transparence dans l’UX

- Montrer les refus URL/réseau avec une raison actionnable.
- Afficher les limites réellement appliquées à chaque collecte.
- Aucune collecte cachée ni contournement d’authentification, CAPTCHA, paywall ou contrôle d’accès.
- Distinguer erreur, résultat partiel et absence de résultat.
- Masquer secrets et données sensibles dans l’interface et les journaux.
- Tracer les actions sensibles dans un journal d’audit.

## 7. MVP et évolutions

**MVP :** shell, vue d’ensemble, investigations, sources et validation, collectes/journaux, observations et preuves, empreintes, exports Markdown/JSON, paramètres essentiels et états responsive.

**Évolutions :** graphe relationnel avancé, collaboration temps réel, alertes prédictives, scoring IA, connecteurs propriétaires multiples, planification complexe, contrôle d’accès entreprise fin. Ne pas faire passer une visualisation illustrative pour une fonction active.

## 8. Critères d’acceptation design

- Action principale identifiable en moins de 5 secondes.
- Statut de collecte visible sans ouvrir le détail.
- Toute preuve a une provenance exploitable.
- États vide, chargement, partiel, erreur et succès spécifiés.
- Aucun tableau ne tronque silencieusement une donnée critique.
- Utilisable au clavier ; lisible à 1280 px ; responsive vérifié à 1024 et 390 px.
- Exemples clairement fictifs.
- Les fonctions correspondent au PRD et aux issues #1–#14.

## 9. Contrat d’implémentation pour l’agent IA

1. Lire ce document, docs/PRD.md et docs/AI-AGENT-ISSUE-GUIDE.md.
2. Implémenter d’abord tokens, shell et composants d’état ; éviter neuf systèmes visuels différents.
3. Ne pas ajouter de dépendance UI sans justification.
4. Ne pas connecter les exemples statiques à l’API en les traitant comme des données réelles.
5. Implémenter une tranche verticale par PR ; fournir captures et tests.
6. Vérifier desktop/tablette/mobile ; exécuter lint, tests et build.
7. Les règles de sécurité, d’accessibilité et de provenance priment sur l’imitation pixel-perfect.

## 10. Ordre recommandé

1. Tokens, shell, navigation, états génériques.
2. Sources et validation réseau.
3. Collectes et journaux.
4. Vue d’ensemble branchée aux données réelles.
5. Observations, empreintes et exports.
6. Investigations et navigation contextuelle.
7. Entités, chronologie et rapports.
8. Paramètres, audit et responsive final.

Les vues V05, V06 et V08 ne doivent pas bloquer le socle de collecte si leurs données ne sont pas encore disponibles.
