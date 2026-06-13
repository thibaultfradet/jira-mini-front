import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACK = path.resolve(__dirname, "../../jira-mini-back");

// The 3 compose files: base + dev override (build, volumes, mailer) + test override (APP_ENV=test).
const COMPOSE = "docker compose -f compose.yaml -f compose.override.yaml -f compose.test.yaml";

function run(cmd: string): void {
  execSync(cmd, { cwd: BACK, stdio: "inherit" });
}

/**
 * Starts the backend in test env, then creates/migrates/seeds the app_test database.
 * Idempotent: safe to re-run on every E2E execution.
 */
export default function globalSetup(): void {
  // 1. Backend in test env on port 80 (recreates the php container if needed).
  run(`${COMPOSE} up -d --wait`);

  // 2. The "app" MySQL user cannot create another database → root GRANT (idempotent).
  run(
    `${COMPOSE} exec -T database mysql -uroot -proot ` +
      `-e "CREATE DATABASE IF NOT EXISTS app_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; ` +
      `GRANT ALL PRIVILEGES ON \\\`app_test\\\`.* TO 'app'@'%'; FLUSH PRIVILEGES;"`,
  );

  // 3. Schema + deterministic dataset (purge then reload).
  run(`${COMPOSE} exec -T php php bin/console --env=test doctrine:migrations:migrate --no-interaction`);
  run(`${COMPOSE} exec -T php php bin/console --env=test doctrine:fixtures:load --no-interaction`);
}
