import React from 'react';
import "@/styles/App.css";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import LecturesPage from "./pages/LecturesPage";
import LectureView from "./pages/LectureView";
import QuizzesPage from "./pages/QuizzesPage";
import QuizPage from "./pages/QuizPage";
import Rankings from "./pages/Rankings";
import Certificates from "./pages/Certificates";
import CodingProfile from "./pages/CodingProfile";
import Settings from "./pages/Settings";

// Router component that handles session_id detection
function AppRouter() {
  const location = useLocation();
  const { user, loading } = useAuth();
  
  // No external OAuth callback handling required; use standard auth flow

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={!loading && user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/login" element={!loading && user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={!loading && user ? <Navigate to="/dashboard" replace /> : <Register />} />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lectures"
        element={
          <ProtectedRoute>
            <LecturesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lectures/:lectureId"
        element={
          <ProtectedRoute>
            <LectureView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes"
        element={
          <ProtectedRoute>
            <QuizzesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes/:quizId"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rankings"
        element={
          <ProtectedRoute>
            <Rankings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedRoute>
            <Certificates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/coding"
        element={
          <ProtectedRoute>
            <CodingProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Catch all - redirect to dashboard or landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Dashboard router based on user role
function DashboardRouter() {
  const { user } = useAuth();
  const location = useLocation();
  const passedUser = location.state?.user || user;
  
  if (passedUser?.role === 'teacher') {
    return <TeacherDashboard />;
  }
  
  if (passedUser?.role === 'admin') {
    return <AdminDashboard />;
  }
  
  return <Dashboard />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
