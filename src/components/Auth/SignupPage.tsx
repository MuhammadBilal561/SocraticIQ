import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Terminal, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../store/AuthContext";

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("$ echo 'all fields required'");
      return;
    }

    if (password !== confirmPassword) {
      setError("$ error: passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("$ error: password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(email, password);
    setIsSubmitting(false);

    if (result.error) {
      setError(`$ error: ${result.error}`);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="scanline" aria-hidden="true" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm space-y-4"
        >
          <div className="w-12 h-12 rounded-xl bg-neon-green text-black flex items-center justify-center mx-auto shadow-[0_0_16px_rgba(0,255,65,0.3)]">
            <Terminal className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-heading font-bold text-neon-green glow-text">
            $ account_created
          </h1>
          <p className="text-sm font-code text-foreground/50 leading-relaxed">
            check your email for a confirmation link, then sign in to start your
            learning journey.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-code font-semibold rounded-xl bg-neon-green text-black hover:shadow-[0_0_16px_rgba(0,255,65,0.3)] transition-all duration-150"
          >
            <Terminal className="w-4 h-4" />
            $ sign_in
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="scanline" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              <Link
                to="/"
                className="inline-flex items-center gap-2 no-underline"
              >
                <div className="w-10 h-10 rounded-xl bg-neon-green text-black flex items-center justify-center shadow-[0_0_16px_rgba(0,255,65,0.3)]">
                  <Terminal className="w-5 h-5" />
                </div>
              </Link>
            </motion.div>
            <h1 className="text-xl font-heading font-bold text-neon-green glow-text">
              $ sign_up
            </h1>
            <p className="text-sm font-code text-foreground/50">
              join the socratiq terminal
            </p>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs font-code text-foreground/60 font-medium"
            >
              $ email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={isSubmitting}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 text-sm font-code border border-neon-green/20 rounded-xl bg-black/50 placeholder:text-neon-green/20 focus:outline-none focus:ring-2 focus:ring-neon-green/30 focus:border-neon-green/50 transition-all duration-150 disabled:opacity-50 text-neon-green/80"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs font-code text-foreground/60 font-medium"
            >
              $ password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={isSubmitting}
                placeholder="•••••••• (min 6 chars)"
                className="w-full px-3.5 py-2.5 pr-10 text-sm font-code border border-neon-green/20 rounded-xl bg-black/50 placeholder:text-neon-green/20 focus:outline-none focus:ring-2 focus:ring-neon-green/30 focus:border-neon-green/50 transition-all duration-150 disabled:opacity-50 text-neon-green/80"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-neon-green/30 hover:text-neon-green/60 transition-colors duration-150 cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label
              htmlFor="confirm-password"
              className="text-xs font-code text-foreground/60 font-medium"
            >
              $ confirm_password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              disabled={isSubmitting}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 text-sm font-code border border-neon-green/20 rounded-xl bg-black/50 placeholder:text-neon-green/20 focus:outline-none focus:ring-2 focus:ring-neon-green/30 focus:border-neon-green/50 transition-all duration-150 disabled:opacity-50 text-neon-green/80"
              autoComplete="new-password"
            />
          </div>

          {/* Error */}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-code text-destructive flex items-center gap-1.5"
              role="alert"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              {error}
            </motion.p>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileTap={{ scale: 0.97 }}
            className="w-full py-2.5 text-sm font-code font-semibold rounded-xl bg-neon-green text-black hover:shadow-[0_0_16px_rgba(0,255,65,0.3)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" />
                $ creating_account...
              </>
            ) : (
              <>
                <Terminal className="w-4 h-4" />
                $ sign_up
              </>
            )}
          </motion.button>

          {/* Login link */}
          <p className="text-center text-xs font-code text-foreground/40">
            already have an account?{" "}
            <Link
              to="/login"
              className="text-neon-green/70 hover:text-neon-green transition-colors duration-150"
            >
              $ sign_in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}