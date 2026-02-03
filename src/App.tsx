import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import UserForm from "@/pages/UserForm";
import Project from "@/pages/Project";
import ActiveSprint from "@/pages/ActiveSprint";
import { AuthenticatedLayout } from "./components/layout";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Routes protégées avec Layout */}
          <Route element={<AuthenticatedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects/:id" element={<Project />} />
            <Route path="/active-sprint" element={<ActiveSprint />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/users/new" element={<UserForm />} />
            <Route path="/settings/users/:id/edit" element={<UserForm />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
