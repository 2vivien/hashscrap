# PROMPT ULTIME - HashScrap Frontend Enterprise

Tu es un Architecte Frontend Senior Expert React 19 + TypeScript Strict + TanStack Start.

## CONTEXTE PROJET
HashScrap est un bounded collection engine pour HashCode Intelligence. 12 écrans déjà designés (voir HTML de référence + screenshots fournis). Le dépôt contient déjà un socle : React 19 + TanStack Start + Tailwind CSS 4. Tu dois faire évoluer l'application existante, pas la réécrire.

**OBLIGATION ABSOLUE AVANT DE CODER:**
1. Lis TOUS les fichiers existants : `apps/web/*`, `pyproject.toml`, `hashscrap/*`, `compose.yaml`, `docs/*`, `AGENTS.md`
2. Lis le HTML de référence fourni (dashboard actuel avec 12 pages)
3. Analyse les routes backend existantes ou prévues dans `hashscrap/` et `migrations/`
4. Adapte le frontend à l'existant, ne casse JAMAIS ce qui marche
5. Si backend pas encore stabilisé, crée des mocks JSON typés avec Zod

## STACK TECHNIQUE FINALE (NE PAS MULTIPLIER)

Besoin | Technologie
Langage | TypeScript strict (no any, no @ts-ignore)
Framework | React 19 + TanStack Start (existant, à conserver)
Styles | Tailwind CSS 4 (existant)
Composants accessibles | shadcn/ui UNIQUEMENT pour composants utiles + Radix UI si besoin
Icônes | Lucide
Données serveur | TanStack Query (cache, staleTime, GC intelligent)
Formulaires | React Hook Form + Zod
Tableaux | TanStack Table
Graphiques | Recharts (léger) ou Apache ECharts si besoin complexe
Tests | Vitest + Testing Library (existant) + ajouter Playwright e2e
Contrats API | Schémas Zod à la frontière client + générateur TypeScript depuis OpenAPI quand contrat backend stabilisé
Validation | Zod partout

**REPORTER:** Zustand, librairies graphes complexes, systèmes permissions avancés jusqu'à besoin concret.

## ARCHITECTURE ENTERPRISE - OBLIGATOIRE

### Principe Micro-fonctionnalités
Chaque fonctionnalité = dossier indépendant. JAMAIS de gros fichiers.

Structure par fonctionnalité (ex: collectes, sources, investigations, entities, chronologie, preuves, rapports, parametres, dashboard):

```
src/features/collectes/
  components/         # Composants spécifiques (<50 lignes chacun)
    CollectesTable.tsx
    CollectesFilters.tsx
    CollecteCard.tsx
    CollecteProgress.tsx
  hooks/
    useCollectes.ts
    useCollecteDetail.ts
  api/
    collectes.queries.ts      # TanStack Query keys + fetchers
    collectes.mutations.ts
  validators/
    collecte.schema.ts        # Zod schemas
  types/
    collecte.types.ts         # Interfaces strictes
  mocks/
    collectes.mock.json
    collectes.mock.ts         # Générateur de données
  index.ts                    # Public API de la feature
```

Même principe pour:
- dashboard/, sources/, investigations/, entities/, chronologie/, preuves/, rapports/, parametres/, auth/

### Frontend Global
```
src/
  features/          # 12 features = 12 écrans
  components/ui/     # shadcn/ui (Button, Card, Badge, Table, Dialog, etc) - uniquement utiles
  components/layout/
    Sidebar.tsx (<50 lignes)
    Topbar.tsx
    PageShell.tsx
  lib/
    api-client.ts    # Fetch wrapper typé
    query-client.ts  # TanStack Query config
    cn.ts
  hooks/
    useDebounce.ts (300-500ms)
  stores/            # Minimal, que si besoin
  types/
    api.types.ts     # Types globaux
  mocks/
    server.ts        # MSW ou json server
  routes/            # TanStack Start routes - assemblent seulement des composants
```

## LIMITES DE TAILLE - NON NÉGOCIABLE

- Page route: max 120 lignes (assemble des composants)
- Composant: max 50 lignes, sinon découper immédiatement
- Hook: une seule responsabilité, petit
- Service/Query file: max 80 lignes
- Pas de composant fourre-tout

## QUALITÉ CODE

- TypeScript strict, aucun any
- SOLID, Clean Architecture, DRY, KISS
- Validation Zod à chaque frontière (entrée formulaire + réponse API)
- Gestion centralisée erreurs
- Logging structuré
- Code prêt pour 5000+ utilisateurs simultanés

## PERFORMANCE & OPTIMISATION - CRITIQUE

API:
- Une seule requête optimisée > plusieurs petites
- Pas de cascade, pas de boucle N+1
- Réutiliser données déjà fetchées (TanStack Query cache)
- Annuler requête précédente si nouvelle recherche

SQL (côté backend Python à respecter):
- select uniquement champs utiles
- include relations minimal
- Pagination obligatoire partout (jamais charger table entière)
- Index sur colonnes fréquentes

Frontend:
- TanStack Query avec staleTime cohérent (ex: dashboard 30s, collectes 10s)
- Debounce 300-500ms sur recherches
- Pas de fetch à chaque render, deps hooks contrôlées
- useMemo pour calculs coûteux, memo pour composants
- Virtualisation si liste >100 items
- Lazy loading, pas de données invisibles

Réponses API:
- Légères, pas d'objets inutiles
- Pagination: { data, total, page, limit }

## LES 12 ECRANS A IMPLÉMENTER (DESIGN SYSTEM FOURNI)

Design: background #070D1C, cards #0F1A2E/#121F36, border #1E2D4A, accent lime #B8FF66, text #E2E8F0/#94A3B8, radius 12px

1. **Vue d'ensemble** (/): 4 stat cards (Sources 12, Collectes 8, Observations 4892, Entités 156), table Collectes récentes (ID, Source, Type Web/Réseau/API, Statut En cours/Terminée/Echouée avec progression bar animée), Activité récente timeline, Points d'attention

2. **Sources** (/sources): Table Nom/URL/Type/Statut Validée/En attente/Erreur/Dernière collecte, filters, right panels Validation domaines + Statistiques, + Nouvelle source

3. **Collectes** (/collectes): Table ID/Source/Type/Statut/Progression 35%/60%/Pages/Durée, filters 7 derniers jours, + Lancer collecte

4. **Détail collecte** (/collectes/$id): Tabs Résumé/Evénements/Résultats/Erreurs, cercle 35% 1248/3500, 1h12m, 4 erreurs, 12.4 Mo, timeline événements, panel erreurs Timeout/403/Parsing/URL Invalide

5. **Nouvelle source** (/sources/new): Wizard 3 steps Informations/Validation/Récap, form Nom/URL/Type Site web, Périmètre autorisé toggle, Validation domaine checklist Protocole HTTPS/DNS/Accessibilité OK, 5000 pages

6. **Investigations** (/investigations): Table Nom/Description/Statut En cours/En pause/Terminée/Source(s)/Observations/Dernière activité, stats

7. **Entités & relations** (/entities): Search Entités & relations, table Entité/Type/Observations/Confiance Élevée/Moyenne/Faible/Dernière détection, right detail john.doe@company.com + graph relations SVG central email -> 4 nodes

8. **Détail entité** (/entities/$id): Tabs Aperçu/Observations/Sources/Relations/Historique, Informations générales, Sources référence (Web crawl 3 obs etc), Entités liées, Graph de relations

9. **Chronologie** (/chronologie): Filter date 01/04/2025-12/05/2025, Tous types/Toutes sources, timeline groupée par jour 12 mai 2025 avec dots et icons Collecte/Observation/Evénement/Preuve/Relation, Exporter

10. **Preuves** (/preuves): Table Aperçu/URL/Source/Collectée le/SHA-256/Source/Statut Validée, drawer Détail preuve avec URL, type Page web, 249 Ko, provenance WebCrawler

11. **Rapports** (/rapports): Table Titre/Investigation/Statut/ Généré le/Format Markdown/JSON/Actions, preview rapport markdown HashScrap - Rapport Investigation avec résumé exécutif etc

12. **Paramètres** (/parametres): Tabs Collecteur/Réseau/Conservation/Sécurité/Audit, form Limites collecteur Pages max 500 Profondeur 3 Timeout 30 Concurrence 5, Rétention Obs 365j Preuves 730j Rapports 1095j, Réseau périmètre Internet avec restrictions, Journalisation Activer l'audit log

## WORKFLOW OBLIGATOIRE POUR CHAQUE PAGE

1. LIRE code existant + HTML référence
2. CRÉER types Zod + TypeScript interfaces dans `types/` (<50 lignes)
3. CRÉER mocks JSON typés dans `mocks/` avec données réalistes (ex: C-2025-0423-001, example.com, etc)
4. CRÉER queries TanStack Query dans `api/` avec keys typées
5. CRÉER composants atomiques <50 lignes dans `components/` (Card, Badge, Progress, TimelineItem, etc)
6. CRÉER page route TanStack Start <120 lignes qui assemble
7. TESTER avec Vitest + ajouter test e2e Playwright si critique
8. VÉRIFIER performance: pas de re-render, debounce, pagination

## EXEMPLE DE TYPES ATTENDUS

```typescript
// validators/collecte.schema.ts
import { z } from 'zod'
export const CollecteStatus = z.enum(['en_cours','terminee','echouee','annulee'])
export const CollecteSchema = z.object({
  id: z.string(), // C-2025-0423-001
  source: z.string(),
  type: z.enum(['Web','Reseau','API']),
  statut: CollecteStatus,
  progression: z.number().min(0).max(100),
  pages: z.object({ collecte: z.number(), total: z.number() }),
  duree: z.string(),
  demarre: z.string()
})
export type Collecte = z.infer<typeof CollecteSchema>

// api/collectes.queries.ts
export const collectesKeys = {
  all: ['collectes'] as const,
  list: (filters: CollecteFilters) => [...collectesKeys.all, 'list', filters] as const,
  detail: (id: string) => [...collectesKeys.all, 'detail', id] as const
}
```

## LIVRABLE

- Code modulaire, chaque fichier <80 lignes
- 12 features fonctionnelles avec mocks JSON
- Navigation fluide entre pages (TanStack Start)
- Animations: pulse En cours, shimmer progress, fade page
- Aucun any, tout typé
- Prêt à connecter à API Python versionnée /api/v1/...

Commence par lire l'existant, puis génère feature par feature dans l'ordre: dashboard -> sources -> collectes -> entities -> reste.
