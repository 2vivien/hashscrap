# HashScrap — Écarts entre le frontend et le backend

Document généré après lecture complète du moteur Python (`hashscrap/`) et de l'interface React (`apps/web/src/`).
Le frontend fonctionne en mode autonome (mocks JSON) et **ne consomme pas l'API** du moteur.
Ce document liste toutes les divergences entre les deux couches.

---

## 1. Résumé

| Point | Backend | Frontend |
|---|---|---|
| Source de vérité | PostgreSQL via SQLAlchemy | Fixtures JSON statiques |
| API | FastAPI `/api/v1/*` | Non consommée (`isMockSource()` = `true`) |
| Contrats | Pydantic (`hashscrap/api/schemas.py`) | Zod (`features/*/validators/*.schema.ts`) |
| Sérialisation | snake_case, datetimes ISO | snake_case, strings ISO |
| Relation frontend↔backend | Aucune : les deux évoluent indépendamment |

**Conclusion** : les deux couches ont été écrites séparément. Les noms de champs, les types
et les structures ne correspondent pas. Aucun écran ne peut être connecté tel quel.

---

## 2. Écarts par domaine

### 2.1 Collectes

| Champ backend (`CollecteOut`) | Champ frontend (`Collecte`) | Écart |
|---|---|---|
| `id: str` | `id: string` | OK |
| `source: str` (label ou clé) | `source: string` | OK |
| `type: "web" \| "api" \| "reseau"` | `type: "web" \| "api" \| "reseau"` | OK |
| `status: "en_cours" \| "terminee" \| "echouee" \| "annulee" \| "en_attente"` | `status: "en_cours" \| "terminee" \| "echouee" \| "annulee"` | **Manque `en_attente`** |
| `progress: int 0..100` | `progress: number` | OK |
| `pages: int` (compteur) | `pages: number` | OK |
| `duration: str` (ex. `1h12m`) | `duration: string` | OK |
| `started_at: datetime` | `started_at: string` | OK (ISO) |

**Détail** (`CollecteDetailOut`) :

| Backend | Frontend | Écart |
|---|---|---|
| `observations: {total, validated, rejected}` | `observations: {total, validated, rejected}` | OK |
| `erreurs: [{code, message, type, count}]` | `erreurs: [{code, message, type, compteur}]` | **`count` vs `compteur`** |
| `evenements: [{at, label, detail}]` | non typé côté frontend | **Le frontend n'a pas de type pour les événements** |

**Endpoints** :
- Backend : `GET /api/v1/collectes` → `{items, total}`
- Backend : `GET /api/v1/collectes/{id}` → détail
- Frontend : `useCollectes()` → `CollectesResponse` = `{items, total}` ✅

### 2.2 Sources

| Backend (`SourceOut`) | Frontend (`Source`) | Écart |
|---|---|---|
| `id: str` (source_key) | `id: string` | OK |
| `nom: str` | `nom: string` | OK |
| `url: str` (base_url) | `url: string` | OK |
| `type: "web" \| "api" \| "reseau"` | `type: "web" \| "api" \| "reseau"` | OK |
| `statut: "validee" \| "en_attente" \| "erreur"` | `statut: "validee" \| "en_attente" \| "erreur"` | OK |
| `derniere_collecte: datetime \| null` | `derniere_collecte: string \| null` | OK |
| `domaines: list[str]` (allowed_hosts) | `domaines: string[]` | OK |

**Cohérence** : les champs correspondent. ✅

**Manque côté frontend** : la notion de `policy_config`, `enabled`, `limits` du backend
n'est pas exposée par l'API. Le formulaire `SourceNew` collecte ces champs mais ils ne
sont pas envoyés au backend (pas d'endpoint POST).

### 2.3 Investigations

| Backend (`InvestigationOut`) | Frontend (`Investigation`) | Écart |
|---|---|---|
| `id: str` (UUID) | `id: string` | OK |
| `nom: str` | `nom: string` | OK |
| `description: str` | `description: string` | OK |
| `statut: "en_cours" \| "terminee" \| "en_attente" \| "annulee"` | `statut: "en_cours" \| "terminee" \| "en_attente"` | **Manque `annulee`** |
| `sources: int` (nombre) | `sources: number` | OK |
| `observations: int` (nombre) | `observations: number` | OK |
| `derniere_activite: datetime` | `derniere_activite: string` | OK |

**Cohérence** : les champs correspondent. ✅

### 2.4 Entités

| Backend (`EntityOut`) | Frontend (`Entity`) | Écart |
|---|---|---|
| `id: str` (UUID) | `id: string` | OK |
| `valeur: str` (raw_identifier) | `valeur: string` | OK |
| `type: "email" \| "domaine" \| "ip" \| "personne" \| "telephone" \| "hash"` | `type: "email" \| "domaine" \| "ip" \| "personne" \| "telephone" \| "hash"` | OK |
| `observations: int` (count) | `observations: number` | OK |
| `confiance: "elevee" \| "moyenne" \| "faible"` | `confiance: "elevee" \| "moyenne" \| "faible"` | OK |
| `derniere_detection: datetime` | `derniere_detection: string` | OK |

**Détail** (`EntityDetailOut`) :

| Backend | Frontend | Écart |
|---|---|---|
| `observations_liste: [{id, champ, valeur_brute, valeur_normalisee, extracteur, version_extracteur, evidence_ref, validation_status}]` | `observations_liste: [{id, champ, valeur_brute, valeur_normalisee, extracteur, version_extracteur, evidence_ref, validation_status}]` | OK |
| `relations: [{id, cible, type, libelle}]` | `relations: [{id, cible, type, libelle}]` | OK |
| `sources: list[str]` | `sources: string[]` | OK |

**Cohérence** : les champs correspondent. ✅

### 2.5 Chronologie

| Backend (`TimelineEventOut`) | Frontend (`ChronologieEvent`) | Écart |
|---|---|---|
| `id: str` | `id: string` | OK |
| `at: datetime` | `at: string` | OK (ISO) |
| `date: str` (ISO date) | `date: string` | OK |
| `heure: str` (HH:MM) | `heure: string` | OK |
| `type: "collecte" \| "observation" \| "evenement" \| "preuve" \| "relation"` | `type: "collecte" \| "observation" \| "evenement" \| "preuve" \| "relation"` | OK |
| `titre: str` | `titre: string` | OK |
| `description: str` | `description: string` | OK |
| `source: str` | `source: string` | OK |

**Cohérence** : les champs correspondent. ✅

### 2.6 Preuves

| Backend (`EvidenceOut`) | Frontend (`Preuve`) | Écart |
|---|---|---|
| `id: str` (UUID) | `id: string` | OK |
| `url: str` | `url: string` | OK |
| `source: str` (source_key) | `source: string` | OK |
| `collectee_le: datetime` | `collectee_le: string` | OK |
| `sha256: str` (64 hex) | `sha256: string` | OK |
| `statut: "validee" \| "en_attente" \| "erreur"` | `statut: "validee" \| "en_attente" \| "erreur"` | OK |
| `taille: int` (octets) | `taille: number` | OK |
| `apercu_url: str` | `apercu_url: string` | OK |

**Cohérence** : les champs correspondent. ✅

### 2.7 Rapports

| Backend (`ReportOut`) | Frontend (`Rapport`) | Écart |
|---|---|---|
| `id: str` (UUID) | `id: string` | OK |
| `titre: str` | `titre: string` | OK |
| `investigation: str` (nom) | `investigation: string` | OK |
| `statut: "validee" \| "en_attente"` | `statut: "validee" \| "en_attente"` | OK |
| `genere_le: datetime` | `genere_le: string` | OK |
| `format: "pdf" \| "markdown" \| "json"` | `format: "pdf" \| "markdown" \| "json"` | OK |
| `contenu: str` (texte) | `contenu: string` | OK |

**Cohérence** : les champs correspondent. ✅

### 2.8 Paramètres

| Backend (`ParametresOut`) | Frontend (`Parametres`) | Écart |
|---|---|---|
| `collecteur.requests_per_second: float` | `requests_per_second: number` | OK |
| `collecteur.depth: int` | `depth: number` | OK |
| `collecteur.max_pages: int` | `max_pages: number` | OK |
| `collecteur.timeout: int` | `timeout: number` | OK |
| `reseau.proxy: str` | `proxy: string` | OK |
| `reseau.user_agent_rotation: bool` | `user_agent_rotation: boolean` | OK |
| `reseau.robots_txt: bool` | `robots_txt: boolean` | OK |
| `conservation.preuves: "90" \| "365" \| "illimite"` | `preuves: "90" \| "365" \| "illimite"` | OK |
| `conservation.auto_suppression_logs: {active, jours}` | `auto_suppression_logs: {active, jours}` | OK |
| `securite.reset_warning: bool` | `reset_warning: boolean` | OK |
| `audit.logs: [{at, level, message}]` | `logs: [{at, level, message}]` | OK |
| `audit.derniere_maj: str` | `derniere_maj: string` | OK |
| `audit.version: str` | `version: string` | OK |
| `audit.licence: str` | `licence: string` | OK |

**Cohérence** : les champs correspondent. ✅

### 2.9 Tableau de bord

| Backend (`DashboardOut`) | Frontend (`Dashboard`) | Écart |
|---|---|---|
| `stats: {sources, collectes, observations, entites: {value, delta}}` | `stats: {sources, collectes, observations, entites: {value, delta}}` | OK |
| `collectes: list[CollecteOut]` | `collectes: unknown[]` | **Type trop large (`unknown[]` au lieu de `Collecte[]`)** |
| `activite: list[ActivityOut]` | `activite: ActivityItem[]` | OK |
| `points_attention: list[str]` | `points_attention: string[]` | OK |

**ActivityOut** :

| Backend | Frontend | Écart |
|---|---|---|
| `type: "collecte" \| "observation" \| "source" \| "rapport" \| "erreur"` | `type: "collecte" \| "observation" \| "source" \| "rapport" \| "erreur"` | OK |
| `at: datetime` | `at: string` | OK |

---

## 3. Problèmes structurels

### 3.1 Le frontend ne consomme pas l'API

- `isMockSource()` retourne toujours `true` (`src/lib/data-source.ts`).
- Toutes les features importent leurs mocks JSON statiques.
- Les fetchers (`api/*.queries.ts`) contiennent le code API mais ne sont jamais appelés.
- Le backend tourne sur `127.0.0.1:8000` mais le frontend ne s'y connecte pas.

### 3.2 Les formulaires ne correspondent pas au backend

Le backend n'a **aucun endpoint POST/PUT/PATCH**. Les seuls endpoints sont des `GET`.
Le frontend a des formulaires de création (nouvelle source, nouvelle collecte, nouvelle investigation,
nouveau rapport) qui ne peuvent pas être envoyés au backend car les endpoints n'existent pas.

| Formulaire frontend | Endpoint backend correspondant | Statut |
|---|---|---|
| `SourceNewForm` | Aucun POST `/sources` | **Manquant** |
| `CollectesPage` "Lancer une collecte" | Aucun POST `/collectes` | **Manquant** |
| `InvestigationsPage` "Nouvelle investigation" | Aucun POST `/investigations` | **Manquant** |
| `RapportsPage` "Nouveau rapport" | Aucun POST `/rapports` | **Manquant** |
| `ParametresPage` "Enregistrer" | Aucun PUT `/parametres` | **Manquant** |
| `CollecteDetailPage` "Relancer" | Aucun POST `/collectes/{id}/relancer` | **Manquant** |

### 3.3 Les données mock ne correspondent pas au backend

Les fixtures JSON contiennent des champs qui n'existent pas dans l'API :

| Fixture | Champ mock | Backend | Écart |
|---|---|---|---|
| `collectes.mock.json` | `progress: 35` | `progress: 35` | OK |
| `collectes.mock.json` | `pages: 1248` | `pages: 1248` | OK |
| `entities.mock.json` | `derniere_detection: "2025-05-12T14:22:00Z"` | `derniere_detection: datetime` | OK |
| `sources.mock.json` | `domaines: ["techcorp.io"]` | `domaines: ["techcorp.io"]` | OK |
| `parametres.mock.json` | `preuves: "90"` | `preuves: "90"` | OK |
| `parametres.mock.json` | `robots_txt: true` | `robots_txt: bool` | OK |

Les mocks sont **globalement alignés** avec les contrats API. Le problème est que le frontend
ne les consomme pas : il utilise ses propres types TypeScript, pas les schémas Zod.

### 3.4 Les types TypeScript ne sont pas dérivés des schémas Zod

Le frontend a des interfaces TypeScript (`types/*.types.ts`) qui sont **écrites à la main**
et ne sont pas liées aux schémas Zod (`validators/*.schema.ts`).
Si un schéma change, l'interface ne suit pas.

**Exemple** : `Collecte` (interface) et `CollectePayload` (type Zod) sont deux définitions
séparées qui peuvent diverger.

### 3.5 Les composants ne sont pas réutilisables

Chaque page réimplémente ses propres filtres, tableaux et cartes. Il n'y a pas de
composants partagés pour :
- les tableaux filtrables
- les cartes de statistiques
- les formulaires de création
- les panneaux de détail

### 3.6 Le design ne correspond pas exactement à la maquette

La maquette HTML (`docs/Hashscrap-Dashboard-12-Pages.html`) utilise :
- Lucide icons (pas d'emoji)
- Tailwind CSS avec des classes utilitaires (pas de CSS custom)
- Des animations et transitions spécifiques
- Un layout responsive précis

Le frontend actuel utilise un mélange de Tailwind et de CSS custom (`styles.css`)
avec des classes comme `mono`, `bg-card`, `text-ink` qui ne correspondent pas
aux classes de la maquette (`bg-[var(--card)]`, `text-[var(--text-primary)]`, etc.).

---

## 4. Plan de correction recommandé

### Phase 1 — Aligner les contrats (1 commit)
1. Générer les types TypeScript depuis les schémas Zod (`z.infer`)
2. Supprimer les interfaces manuelles dans `types/*.types.ts`
3. Vérifier que tous les fetchers utilisent les schémas Zod

### Phase 2 — Connecter l'API (1 commit)
1. Mettre `isMockSource()` à `false` par défaut
2. Configurer le proxy Vite vers l'API
3. Vérifier que tous les endpoints répondent

### Phase 3 — Ajouter les endpoints d'écriture (1 commit backend)
1. `POST /api/v1/sources` — création de source
2. `POST /api/v1/collectes` — lancement de collecte
3. `POST /api/v1/investigations` — création d'investigation
4. `POST /api/v1/rapports` — génération de rapport
5. `PUT /api/v1/parametres` — mise à jour des paramètres
6. `POST /api/v1/collectes/{id}/relancer` — relance

### Phase 4 — Aligner le design (1 commit)
1. Remplacer les classes CSS custom par les classes Tailwind de la maquette
2. Utiliser les icônes Lucide (pas d'emoji)
3. Ajouter les animations et transitions de la maquette

### Phase 5 — Tests (1 commit)
1. Tests unitaires pour les fetchers
2. Tests d'intégration pour les formulaires
3. Tests e2e avec Playwright

---

## 5. Fichiers à modifier en priorité

| Fichier | Action |
|---|---|
| `apps/web/src/lib/data-source.ts` | Remettre `isMockSource()` configurable |
| `apps/web/src/features/*/types/*.types.ts` | Remplacer par `z.infer` |
| `apps/web/src/features/*/validators/*.schema.ts` | Ajouter les schémas de création (POST) |
| `hashscrap/api/routes/*.py` | Ajouter les endpoints d'écriture |
| `apps/web/src/styles.css` | Aligner sur les classes de la maquette |
| `apps/web/src/components/ui/*.tsx` | Utiliser Lucide icons |

---

## 6. Note sur le design system

La maquette HTML utilise des classes Tailwind avec des variables CSS :
- `bg-[var(--card)]` au lieu de `bg-card`
- `text-[var(--text-primary)]` au lieu de `text-ink`
- `border-[var(--border)]` au lieu de `border-line`

Le frontend actuel utilise des alias Tailwind (`bg-card`, `text-ink`) qui sont
définis dans `@theme`. Cela fonctionne mais ne correspond pas exactement
aux classes de la maquette.

**Recommandation** : conserver les alias (plus lisibles) mais vérifier que les
valeurs sont identiques à celles de la maquette.
