<p align="center">
  <img src="https://img.icons8.com/color/96/sprint-iteration.png" alt="Mini Jira Logo" width="80"/>
</p>

<h1 align="center">Mini Jira — Frontend</h1>

<p align="center">
  A modern project management interface inspired by Jira, built with React 19 and TypeScript.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind"/>
</p>

> **This repository contains the frontend only.** The backend lives in [jira-mini-back](../jira-mini-back/).

---

## About The Project

Mini Jira is a simplified Jira clone that lets teams manage their projects, backlogs, sprints and tasks. The frontend provides a Kanban board with drag-and-drop, backlog management, sprint planning, burnup/burndown charts, in-app notifications, and user/team administration.

### Built With

| Technology | Role |
|---|---|
| [React 19](https://react.dev/) | UI library |
| [TypeScript 5.9](https://www.typescriptlang.org/) | Static typing |
| [Vite 7](https://vite.dev/) | Build tool & dev server |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) | UI component library (Radix UI, new-york style) |
| [React Router 7](https://reactrouter.com/) | Client-side routing |
| [Lucide React](https://lucide.dev/) | Icons |
| [Sonner](https://sonner.emilkowal.ski/) | Toast notifications |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- The **backend** [jira-mini-back](../jira-mini-back/) must be running

### Installation

```bash
git clone <repo-url>
cd mini-jira-front
npm install
npm run dev
```

The app is available at `http://localhost:5173`.

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:8000`) |

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Features

### Authentication
- Login with email & password — JWT stored in a cookie (7 days)
- Silent token refresh via `POST /auth/refresh`
- Forgot password & reset password flow by email
- Auto-redirect to `/login` on 401

### Projects
- Create projects from the top navigation
- Browse projects in the sidebar with live search
- View a project's epics and tasks in an expandable table

### Issues
- Create epics, stories, tasks, and bugs with a step-by-step modal
- Parent-child hierarchy: epic → tasks
- Set story points, urgency (`low` / `medium` / `high` / `critical`) and deadline
- Color-coded deadline indicator (green → orange → red)
- Full issue detail dialog: description, subtasks (checklist), comments, assignee, status

### Kanban Board
- Active sprint board with three columns: To Do / In Progress / Done
- Drag-and-drop issues between columns
- Story point totals per column

### Backlog & Sprints
- Backlog view with filters (project, assignee, status, urgency)
- Create, edit, and delete sprints
- Start a sprint (one active sprint per team enforced)
- Close a sprint: move unfinished tasks to the next planned sprint or the backlog via a confirmation modal
- Assign/unassign issues between backlog and sprints

### Statistics
- Burnup and burndown charts per sprint
- Team velocity chart across past sprints

### Notifications
- Bell icon with unread badge in the top navigation
- Dropdown with the latest notifications
- Mark individual or all notifications as read
- Click a notification to navigate to the related issue

### Profile
- Edit personal information (first name, last name, email)
- Change password with current password confirmation

### Administration (admin only)
- User management: create, edit, activate/deactivate accounts, toggle admin role
- Team management: create, edit, delete teams, add/remove members

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui primitives (never modified)
│   ├── layout/          # App shell (AuthenticatedLayout, TopNav, SideNav, CreateModal)
│   ├── issue-table/     # Expandable epic/task table
│   ├── sprint/          # Sprint issue card
│   ├── stats/           # Chart components
│   └── ConfirmDialog.tsx
├── contexts/            # Auth state (AuthContext, AuthProvider, useAuth)
├── router/              # Route guards (AdminRoute)
├── pages/               # Route-level components (Dashboard, Project, Backlog,
│                        #   SprintBoard, Stats, Profile, Settings, admin/Teams…)
├── services/            # API client layer (one file per domain)
├── types/               # TypeScript interfaces (one file per Doctrine entity)
├── utils/               # fetchWithRefresh, toastHelpers, dateUtils, avatarUtils, issueUtils
└── lib/                 # cn() (clsx + tailwind-merge), JWT decoding
```

---

## Roadmap

- [x] JWT authentication + silent refresh
- [x] Password reset by email
- [x] Project management (CRUD, sidebar navigation)
- [x] Issue tracking with epic/task hierarchy, urgency and deadline
- [x] Full issue detail dialog (subtasks, comments, assignee, status)
- [x] Kanban board with drag-and-drop
- [x] Backlog management with filters
- [x] Full sprint lifecycle (create, start, close with task redistribution)
- [x] Burnup/burndown and velocity charts
- [x] In-app notifications (bell, badge, dropdown, mark as read)
- [x] User profile (edit info, change password)
- [x] Admin user management
- [x] Admin team management
- [ ] File attachments on issues
- [ ] Search across issues and projects
- [ ] Internationalization (i18n)

---

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Top Contributors

<a href="https://github.com/thibaultfradet">
  <img src="https://github.com/thibaultfradet.png" width="50" style="border-radius:50%" alt="thibaultfradet"/>
</a>
