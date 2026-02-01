import { Navigate, Outlet } from "react-router-dom";
import { authService } from "@/services/auth";

export default function Layout() {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </div>
            <span className="font-semibold text-lg">Mini Jira</span>
          </div>

          <button
            onClick={() => {
              authService.logout();
              window.location.href = "/login";
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
