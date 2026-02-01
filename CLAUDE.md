# Mini Jira Frontend

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build**: Vite 7
- **Routing**: React Router DOM 7
- **Styling**: Tailwind CSS v4 with shadcn/ui ("new-york" style)
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components (Button, Input, Label, Card)
│   └── Layout.tsx    # Main layout with header (protected routes)
├── pages/
│   ├── Login.tsx     # Login page (split-screen design)
│   └── Dashboard.tsx # Home page after login
├── services/
│   └── auth.ts       # Authentication service + cookie management
├── lib/
│   └── utils.ts      # cn() utility for Tailwind classes
├── App.tsx           # Main routing
├── main.tsx          # Entry point
└── index.css         # CSS variables + Tailwind theme
```

## Color Palette

| Variable | Value | Description |
|----------|-------|-------------|
| `--primary` | #0864D1 | Primary blue |
| `--secondary` | #F6F8FA | Light gray |
| `--background` | Cream white | App background |

Colors are defined in `src/index.css` using oklch format.

## Authentication

- **Service**: `src/services/auth.ts`
- **Token**: Stored in cookies (7 days expiry)
- **API URL**: Configured via `VITE_API_URL` in `.env`
- **Login endpoint**: `POST /auth`

### Auth Flow

1. Unauthenticated users are redirected to `/login`
2. On successful login, token is stored in cookies
3. `Layout` component checks token and protects routes

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Conventions

- Use `@/` alias for imports (e.g., `@/components/ui/button`)
- Use shadcn/ui components for UI
- Use theme CSS variables (`bg-primary`, `text-muted-foreground`, etc.)
- Pages go in `src/pages/`
- Reusable components go in `src/components/`
- Services/API calls go in `src/services/`

## Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

Examples: `button`, `input`, `card`, `dialog`, `dropdown-menu`, `table`, etc.
