import { Link, useRouterState } from "@tanstack/react-router";
import { navItems } from "./nav-items";
import { cn } from "../../lib/cn";

export interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[240px] -translate-x-full flex-col border-r border-line bg-sidebar transition-transform lg:static lg:translate-x-0">
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-4">
        <span className="grid size-8 place-items-center rounded-lg bg-lime text-[15px] font-black text-[#0b1204]">
          #
        </span>
        <span className="leading-tight">
          <span className="block text-[15px] font-semibold text-ink">HashScrap</span>
          <span className="mono block text-[9px] tracking-[0.18em] text-ink-muted">BOUNDED ENGINE</span>
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Navigation principale">
        <p className="px-2 pb-2 text-[10px] tracking-[0.18em] text-ink-muted">NAVIGATION</p>
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active =
              item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13px] transition-colors",
                    active
                      ? "border border-lime/40 bg-lime-dim text-lime"
                      : "text-ink-secondary hover:bg-card hover:text-ink",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                  {active ? <span className="ml-auto size-1.5 rounded-full bg-lime" /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-2.5 border-t border-line px-4 py-3">
        <span className="grid size-8 place-items-center rounded-full bg-card-2 text-[12px] font-semibold text-ink">
          JD
        </span>
        <span className="leading-tight">
          <span className="block text-[13px] font-medium text-ink">Julien D.</span>
          <span className="flex items-center gap-1.5 text-[11px] text-ink-muted">
            <span className="size-1.5 rounded-full bg-green" />
            v1.0.0 · Live
          </span>
        </span>
      </div>
    </aside>
  );
}
