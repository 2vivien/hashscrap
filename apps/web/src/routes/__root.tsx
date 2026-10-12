import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import "../styles.css";

const navGroups = [
  {
    label: "ESPACE DE TRAVAIL",
    items: [
      { label: "Vue d’ensemble", href: "/", icon: "◫" },
      { label: "Investigations", href: "/investigations", icon: "◎" },
      { label: "Sources", href: "/sources", icon: "⌁" },
      { label: "Collectes", href: "/collectes", icon: "↻" },
    ],
  },
  {
    label: "ANALYSE",
    items: [
      { label: "Entités & relations", href: "/entites", icon: "◇" },
      { label: "Chronologie", href: "/chronologie", icon: "≋" },
      { label: "Preuves", href: "/preuves", icon: "▤" },
      { label: "Rapports", href: "/rapports", icon: "▧" },
    ],
  },
];

function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navigation principale">
        <a className="brand" href="/" aria-label="HashScrap, accueil">
          <span className="brand-mark" aria-hidden="true">H</span>
          <span className="brand-copy"><strong>HashScrap</strong><small>INTELLIGENCE WORKSPACE</small></span>
        </a>
        <div className="workspace-chip">
          <span className="status-dot status-dot--success" aria-hidden="true" />
          <span>Workspace principal<small>Instance locale</small></span>
        </div>
        {navGroups.map((group) => (
          <nav className="nav-group" aria-label={group.label} key={group.label}>
            <p className="nav-label">{group.label}</p>
            {group.items.map((item) => {
              const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={active ? "nav-link nav-link--active" : "nav-link"}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                  {item.label}
                </a>
              );
            })}
          </nav>
        ))}
        <div className="sidebar-bottom">
          <a className={pathname === "/parametres" ? "nav-link nav-link--active" : "nav-link"} href="/parametres" aria-current={pathname === "/parametres" ? "page" : undefined}>
            <span className="nav-icon" aria-hidden="true">⚙</span>Paramètres
          </a>
          <div className="connection-state">
            <span className="status-dot status-dot--warning" aria-hidden="true" />
            <span>Backend non connecté<small>Mode interface uniquement</small></span>
          </div>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumb"><span>HashCode</span><span aria-hidden="true">/</span><strong>{pathname === "/" ? "Vue d’ensemble" : pathname.slice(1).replaceAll("-", " ")}</strong></div>
          <div className="topbar-meta"><span className="environment-pill">LOCAL · DEV</span><span className="user-avatar" aria-label="Profil local">HC</span></div>
        </header>
        <main id="main-content" className="page-content">{children}</main>
        <footer className="app-footer"><span>HashScrap · HashCode Intelligence</span><span>Prototype applicatif · données serveur non connectées</span></footer>
      </div>
    </div>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <AppShell><Outlet /></AppShell>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#080b10" />
        <title>HashScrap — Intelligence Workspace</title>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRoute({ component: RootComponent });
