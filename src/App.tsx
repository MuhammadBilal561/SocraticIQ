// SocratIQ - AI-powered Socratic learning platform
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SessionProvider } from "./store/SessionContext";
import { AuthProvider } from "./store/AuthContext";
import Layout from "./components/Layout";
import LandingPage from "./components/Landing/LandingPage";
import ProblemScreen from "./components/ProblemScreen/ProblemScreen";
import Dashboard from "./components/Dashboard/Dashboard";
import HistoryPage from "./components/History/History";
import LoginPage from "./components/Auth/LoginPage";
import SignupPage from "./components/Auth/SignupPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected routes */}
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProblemScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HistoryPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </SessionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}