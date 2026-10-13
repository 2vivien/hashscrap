/**
 * One-command local stack for the HashScrap web UI.
 *
 * Sequence: start the PostgreSQL service, apply migrations, then run the Vite dev server.
 * No dependency is added: this uses only Node built-ins.
 *
 * Safety: it never runs `docker compose down -v`; the database volume is preserved.
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(webRoot, "..", "..");
const composeFile = join(repoRoot, "compose.yaml");
const envFile = join(repoRoot, ".env");

function fail(message, hint) {
  console.error(`\n[dev:stack] ${message}`);
  if (hint) console.error(`[dev:stack] ${hint}\n`);
  process.exit(1);
}

function docker(args, options = {}) {
  const result = spawnSync("docker", ["compose", "-f", composeFile, ...args], {
    cwd: repoRoot,
    stdio: "inherit",
    ...options,
  });
  if (result.error) {
    fail("docker n’est pas disponible dans le PATH.", "Installer Docker Desktop, ou lancer `npm run dev` pour l’interface seule.");
  }
  if (result.status !== 0) {
    fail(`\`docker compose ${args.join(" ")}\` a échoué (code ${result.status}).`);
  }
}

if (!existsSync(composeFile)) {
  fail(`compose.yaml introuvable dans ${repoRoot}.`);
}

if (!existsSync(envFile)) {
  fail(
    "Fichier .env absent à la racine du dépôt.",
    "Copier .env.example vers .env, définir POSTGRES_PASSWORD, puis relancer `npm run dev:stack`.",
  );
}

const envContent = readFileSync(envFile, "utf8");
if (!/^POSTGRES_PASSWORD=.+$/m.test(envContent)) {
  fail(
    "POSTGRES_PASSWORD n’est pas défini dans .env.",
    "Le service PostgreSQL refuse de démarrer sans ce secret ; ne pas le commiter.",
  );
}

console.log("[dev:stack] Démarrage de PostgreSQL…");
docker(["up", "-d", "db"]);

console.log("[dev:stack] Application des migrations (construction de l’image si nécessaire)…");
docker(["run", "--rm", "app", "alembic", "upgrade", "head"]);

console.log("[dev:stack] Base prête. Démarrage de l’interface sur http://localhost:5173\n");

const vite = spawn("npx", ["vite", "--host", "0.0.0.0"], { cwd: webRoot, stdio: "inherit", shell: true });

const shutdown = () => {
  if (!vite.killed) vite.kill();
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

vite.on("exit", (code) => {
  console.log(`\n[dev:stack] Serveur de développement arrêté (code ${code ?? 0}). PostgreSQL reste démarré.`);
  console.log("[dev:stack] Pour arrêter la base : npm run stack:down");
  process.exit(code ?? 0);
});