import { Link, createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { HOME_LABEL, getBreadcrumbLabel, navGroups, settingsNavItem } from "../lib/sections";
import "../styles.css";

function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Aller au contenu principal
      </a>
      <aside className="sidebar" aria-label="Navigation principale">
        <Link className="brand" to="/" aria-label="HashScrap, accueil">
          <span className="brand-mark" aria-hidden="true">
            H
          </span>
          <span className="brand-copy">
            <strong>HashScrap</strong>
            <small>INTELLIGENCE WORKSPACE</small>
          </span>
        </Link>
        <div className="workspace-chip">
          <span className="status-dot status-dot--success" aria-hidden="true" />
          <span>
            Espace de travail principal
            <small>Instance locale</small>
          </span>
        </div>
        {navGroups.map((group) => (
          <nav className="nav-group" aria-label={group.label} key={group.label}>
            <p className="nav-label">{group.label}</p>
            {group.items.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const className = active ? "nav-link nav-link--active" : "nav-link";
              return item.section === "" ? (
                <Link
                  key={item.href}
                  to="/"
                  className={className}
                  aria-current={active ? "page" : undefined}
                  title={item.label}
                >
                  <span className="nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              ) : (
                <Link
                  key={item.href}
                  to="/$section"
                  params={{ section: item.section }}
                  className={className}
                  aria-current={active ? "page" : undefined}
                  title={item.label}
                >
                  <span className="nav-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        ))}
        <div className="sidebar-bottom">
          <Link
            to="/$section"
            params={{ section: settingsNavItem.section }}
            className={
              pathname.startsWith(settingsNavItem.href) ? "nav-link nav-link--active" : "nav-link"
            }
            aria-current={pathname.startsWith(settingsNavItem.href) ? "page" : undefined}
            title={settingsNavItem.label}
          >
            <span className="nav-icon" aria-hidden="true">
              {settingsNavItem.icon}
            </span>
            <span>{settingsNavItem.label}</span>
          </Link>
          <div className="connection-state">
            <span className="status-dot status-dot--warning" aria-hidden="true" />
            <span>
              Connexion partielle
              <small>Collectes · lecture seule</small>
            </span>
          </div>
        </div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <nav className="breadcrumb" aria-label="Fil d’Ariane">
            <span>HashCode</span>
            <span aria-hidden="true">/</span>
            <strong>{getBreadcrumbLabel(pathname)}</strong>
          </nav>
          <div className="topbar-meta">
            <span className="environment-pill">LOCAL · DEV</span>
            <span className="user-avatar" aria-label="Profil local">
              HC
            </span>
          </div>
        </header>
        <main id="main-content" className="page-content">
          {children}
        </main>
        <footer className="app-footer">
          <span>HashScrap · HashCode Intelligence</span>
          <span>
            Collectes lues via l’API (lecture seule) · autres vues non connectées · vue d’accueil :{" "}
            {HOME_LABEL}
          </span>
        </footer>
      </div>
    </div>
  );
}

function RootComponent() {
  return (
    <RootDocument>
      <AppShell>
        <Outlet />
      </AppShell>
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