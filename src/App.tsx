import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/Auth/LoginPage";
import HomePage from "./pages/Dashboard/HomePage";
import GradesPage from "./pages/Dashboard/GradesPage";
import AttendancePage from "./pages/Dashboard/AttendancePage";
import UsersPage from "./pages/DashE/UsersPage";
import StudentsPage from "./pages/DashE/StudentsPage";
import AdminHome from "./pages/DashE/AdminHome";
import SubjectGroup from "./pages/DashE/SubjectGroup";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* 🔹 Ruta pública */}
          <Route path="/" element={<LoginPage />} />

          {/* 🔹 Rutas protegidas para profesores */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<HomePage />} />
            <Route path="/dashboard/grades" element={<GradesPage />} />
            <Route path="/dashboard/attendance" element={<AttendancePage />} />
          </Route>

          {/* 🔹 Rutas protegidas para administradores */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashE" element={<AdminHome />} />
            <Route path="/dashE/users" element={<UsersPage />} />
            <Route path="/dashE/students" element={<StudentsPage />} />
            <Route path="/dashE/subjects-groups" element={<SubjectGroup />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
