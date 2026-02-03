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

<!-- Add a screenshot of the app here -->
<!-- ![App Screenshot](docs/screenshot.png) -->

---

## About The Project

Mini Jira Frontend provides a complete project management UI with a Kanban board, backlog management, sprint planning, and user administration. It communicates with the backend API to deliver a full Jira-like experience.

### Built With

| Technology | Role |
|---|---|
| [React 19](https://react.dev/) | UI library |
| [TypeScript 5.9](https://www.typescriptlang.org/) | Static typing |
| [Vite 7](https://vite.dev/) | Build tool & dev server |
| [Tailwind CSS 4](https://tailwindcss.com/) | Utility-first CSS |
| [shadcn/ui](https://ui.shadcn.com/) | UI components (Radix UI) |
| [Lucide React](https://lucide.dev/) | Icons |
| [React Router 7](https://reactrouter.com/) | Client-side routing |

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

In development, Vite proxies `/api`, `/auth`, and `/password` requests to `https://localhost` (the backend).

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (empty by default — uses Vite proxy in dev) |

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Usage

### Authentication
- Login with email & password
- Forgot password & reset password flow

### Projects
- Create projects from the top navigation
- Browse projects in the sidebar (with search)
- View a project's issues in a table with expandable epics

### Kanban Board
- Drag-and-drop issues between To Do, In Progress, and Done columns
- Confirmation dialog when marking an issue as Done
- Story point totals per column

### Backlog & Sprints
- View all sprints with their issues in collapsible sections
- Drag issues from the backlog into active sprints
- Story point and issue count aggregation

### Issue Management
- Create epics, tasks, and bugs with a step-by-step modal
- Parent-child hierarchy (Epic → Tasks)
- Assign users, set story points, update status

### User Administration (Admin only)
- Create, edit, and delete user accounts
- Toggle admin role

---

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI primitives (shadcn/ui)
│   ├── layout/          # App shell (TopNav, SideNav, CreateModal)
│   ├── kanban/          # Kanban board (Board, Column, Card)
│   ├── backlog/         # Backlog & sprint sections
│   └── issue-table/     # Issue table with expandable epics
├── contexts/            # Global auth state (React Context)
├── helpers/             # Utility functions (avatars, status config)
├── lib/                 # JWT decoding, Tailwind class merging
├── pages/               # Route-level page components
├── services/            # API client layer (auth, projects, issues, sprints, users)
└── types/               # TypeScript interfaces
```

---

## Roadmap

- [x] User authentication (login, password reset)
- [x] Project management (CRUD, sidebar navigation)
- [x] Issue tracking with epic/task hierarchy
- [x] Kanban board with drag-and-drop
- [x] Backlog & sprint planning
- [x] Admin user management
- [ ] Statistics & analytics dashboard
- [ ] Full sprint CRUD (create, edit, close sprints)
- [ ] Issue detail dialog (full view with comments)
- [ ] Comment system on issues
- [ ] Theme management
- [ ] Internationalization (English-based i18n)
- [ ] Search functionality
- [ ] Issue filtering & sorting

---

## Contributing

Contributions are welcome! Here's how:

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
