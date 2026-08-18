import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-6 h-6 animate-spin text-neon-green mx-auto" />
          <p className="text-sm font-code text-foreground/50">$ authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Save the attempted URL so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}