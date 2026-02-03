# Mini Jira Frontend

A project management tool inspired by Jira, built with React 19 and TypeScript. The UI is entirely in **French**.

## Tech Stack

| Category   | Technology                                      |
|------------|-------------------------------------------------|
| Framework  | React 19, TypeScript 5.9                        |
| Build      | Vite 7 with `@vitejs/plugin-react`              |
| Routing    | React Router DOM 7                              |
| Styling    | Tailwind CSS v4, shadcn/ui (`new-york` style)   |
| Icons      | Lucide React                                    |

## Commands

```bash
npm run dev      # Start development server
npm run build    # TypeScript check + Vite production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

Add a shadcn/ui component:

```bash
npx shadcn@latest add [component-name]
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives (button, input, dialog, table…)
│   ├── layout/          # AuthenticatedLayout, TopNav, SideNav, CreateModal
│   ├── issue-table/     # IssueTable, EpicRow, TaskRow
│   ├── kanban/          # KanbanBoard, KanbanColumn, KanbanCard
│   ├── backlog/         # BacklogTab, SprintSection, BacklogSection, IssueRow
│   ├── ProjectCard.tsx  # Dashboard project card
│   ├── StatusBadge.tsx  # Issue status badge
│   ├── ConfirmDialog.tsx
│   └── AssigneeCell.tsx
├── contexts/
│   └── AuthContext.tsx   # Auth provider (user, isAdmin, logout, refetchUser)
├── helpers/
│   ├── avatar.ts         # getInitials(), getAvatarColor()
│   ├── status.ts         # statusConfig: labels & classNames per status
│   └── index.ts
├── lib/
│   ├── utils.ts          # cn() — clsx + tailwind-merge
│   └── jwt.ts            # decodeJwt(), getUserFromToken(), isTokenExpired()
├── pages/
│   ├── Login.tsx          # Split-screen login
│   ├── ForgotPassword.tsx
│   ├── ResetPassword.tsx
│   ├── Dashboard.tsx      # Home: project cards + assigned tasks
│   ├── Project.tsx        # Project detail with issue table
│   ├── ActiveSprint.tsx   # Kanban board + backlog tabs
│   ├── Settings.tsx       # Admin settings (user management)
│   ├── UserForm.tsx       # Create/edit user
│   ├── project/
│   │   └── IssueDialog.tsx
│   └── settings/
│       └── TabUsers.tsx
├── services/
│   ├── auth.ts            # Login, logout, cookie management
│   ├── dashboard.ts       # GET /api/dashboard
│   ├── project.ts         # CRUD /api/projects
│   ├── issue.ts           # CRUD /api/issues + backlog + children
│   ├── sprint.ts          # GET /api/sprints, /api/sprints/all
│   ├── user.ts            # CRUD /api/users
│   └── password.ts        # Forgot/reset password
├── types/
│   └── index.ts           # All shared interfaces & types
├── App.tsx                # Routes definition
├── main.tsx               # Entry point
└── index.css              # CSS variables + Tailwind theme (oklch)
```

## Routing

### Public

| Path               | Page             |
|--------------------|------------------|
| `/login`           | Login            |
| `/forgot-password` | ForgotPassword   |
| `/reset-password`  | ResetPassword    |

### Protected (wrapped by `AuthenticatedLayout`)

| Path                          | Page         |
|-------------------------------|--------------|
| `/`                           | Dashboard    |
| `/projects/:id`               | Project      |
| `/active-sprint`              | ActiveSprint |
| `/settings`                   | Settings     |
| `/settings/users/new`         | UserForm     |
| `/settings/users/:id/edit`    | UserForm     |

## Layout

```
┌─────────────────────────────────────────────────┐
│  TopNav (h-14)                                  │
│  Logo · Search · Create · Settings* · Avatar    │
├────────────┬────────────────────────────────────┤
│  SideNav   │  Main content area                 │
│  (w-64)    │  <Outlet /> — current page         │
│            │  (flex-1, p-6, overflow-y-auto)     │
│  Dashboard │                                    │
│  Stats     │                                    │
│  Sprint    │                                    │
│  Projects  │                                    │
└────────────┴────────────────────────────────────┘
* Settings link visible to admins only (ROLE_ADMIN)
```

## Authentication

- **Provider**: `AuthContext` wraps the entire app
- **Token**: JWT stored in cookie `auth_token` (7-day expiry, SameSite=Strict)
- **Login**: `POST /auth` → returns JWT → stored in cookie → context refetch
- **Guard**: `AuthenticatedLayout` redirects to `/login` if no valid token
- **Roles**: `isAdmin` derived from `ROLE_ADMIN` in JWT payload
- **JWT decoding**: Manual Base64 in `src/lib/jwt.ts` (no external library)

## Types

```typescript
User        { id, email, firstName, lastName, roles, createdAt, updatedAt }
Project     { id, name, description, openedIssueCount, finishedIssueCount, createdAt, updatedAt, issues? }
Issue       { id, title, description, type, status, storyPoints, project, parent, assignee, reporter, comments?, issues?, children?, sprints?, createdAt, updatedAt }
Comment     { id, content, issue, author, createdAt, updatedAt }
Sprint      { id, name, startDate, endDate, isActive, issues?, createdAt, updatedAt }

IssueType   = "epic" | "task" | "bug" | "sub_task"
IssueStatus = "todo" | "in_progress" | "done"
```

## API Services

All services use `fetch` with `Bearer` token from `auth_token` cookie. Base URL: `VITE_API_URL + "/api"` (except auth & password routes which use `VITE_API_URL` directly).

| Service      | Endpoints                                                                |
|--------------|--------------------------------------------------------------------------|
| `auth`       | `POST /auth`                                                             |
| `dashboard`  | `GET /api/dashboard` → `{ projects, myTasks: { inProgress, todo } }`     |
| `project`    | `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/:id`           |
| `issue`      | `GET/PATCH/DELETE /api/issues/:id`, `POST /api/issues`                   |
|              | `GET /api/issues/backlog`, `GET /api/issues/:id/children`                |
| `sprint`     | `GET /api/sprints` (active), `GET /api/sprints/all`                      |
| `user`       | `GET/POST /api/users`, `GET/PATCH/DELETE /api/users/:id`                 |
| `password`   | `POST /password/forgot`, `POST /password/reset`                          |

## Theme & Colors

Colors are defined in `src/index.css` using **oklch** format. Key values:

| Variable         | Role             | Approx. value |
|------------------|------------------|---------------|
| `--primary`      | Primary blue     | #0864D1       |
| `--secondary`    | Light gray       | #F6F8FA       |
| `--background`   | Cream white      | —             |
| `--destructive`  | Error red        | —             |

Dark mode variables are defined but not actively toggled.

## Key Patterns

- **Drag & Drop**: Native HTML drag events on Kanban cards and backlog issues (custom MIME types: `application/kanban-issue-id`, `application/issue-id`)
- **Optimistic Updates**: Kanban status changes and backlog reordering update state immediately, rollback on API error
- **Lazy Loading**: Epic children fetched on expand only (`issueService.getChildren`)
- **Confirmation Dialog**: Required when moving an issue to `done` status from Kanban

## Conventions

- **Imports**: Use `@/` path alias (maps to `src/`)
- **Pages**: `src/pages/` — one file per route
- **Components**: `src/components/` — reusable, grouped by feature domain
- **Services**: `src/services/` — one file per API resource, exports a singleton object
- **UI primitives**: `src/components/ui/` — shadcn/ui only, do not edit manually
- **Buttons**: Always include `cursor-pointer` class
- **Styling**: Use Tailwind utility classes and theme CSS variables (`bg-primary`, `text-muted-foreground`…)
- **Localization**: All user-facing text is in French
- **Status labels**: `"A FAIRE"` (todo), `"EN COURS"` (in_progress), `"TERMINE"` (done)
- **State management**: React Context for auth, local `useState` elsewhere — no Redux/Zustand
- **Barrel exports**: Feature folders use `index.ts` for re-exports

## Dev Proxy (vite.config.ts)

In development, Vite proxies API requests to `https://localhost`:

- `/api` → `https://localhost`
- `/password` → `https://localhost`
- `/auth` → `https://localhost`

## Environment

```
VITE_API_URL=   # Backend API base URL (leave empty when using dev proxy)
```
