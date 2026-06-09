import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthenticatedLayout } from './components/layout';
import { AdminRoute } from '@/router/guards';

import Login from '@/pages/Login';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import UserForm from '@/pages/UserForm';
import Project from '@/pages/Project';
import Backlog from '@/pages/Backlog';
import SprintBoard from '@/pages/SprintBoard';
import Profile from '@/pages/Profile';
import Stats from '@/pages/Stats';
import StatsChart from '@/pages/StatsChart';
import AdminTeams from '@/pages/admin/Teams';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects/:id" element={<Project />} />
            <Route path="/backlog" element={<Backlog />} />
            <Route path="/teams/:teamId/sprint" element={<SprintBoard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/stats/:chartType" element={<StatsChart />} />

            {/* Admin-only routes */}
            <Route element={<AdminRoute />}>
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/users/new" element={<UserForm />} />
              <Route path="/settings/users/:id/edit" element={<UserForm />} />
              <Route path="/settings/teams" element={<AdminTeams />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
