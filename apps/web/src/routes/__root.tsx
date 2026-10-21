import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "../components/layout/AppShell";
import { TooltipProvider } from "../components/ui/tooltip";
import { createQueryClient } from "../lib/query-client";
import "../styles.css";

function RootComponent() {
  const [queryClient] = useState(createQueryClient);
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          <AppShell>
            <Outlet />
          </AppShell>
        </TooltipProvider>
      </QueryClientProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#070d1c" />
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
