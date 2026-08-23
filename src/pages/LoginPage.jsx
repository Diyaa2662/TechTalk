import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  LogIn,
  Users,
  MessageSquare,
  Code,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import logo from "/src/assets/logo.png";
import api from "../services/api";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const translateErrorMessage = (message) => {
    if (message.includes("invalid credentials")) {
      return "Invalid email or password. Please check your credentials and try again.";
    }
    if (message.includes("account not found")) {
      return "No account found with this email. Please sign up first.";
    }
    if (message.includes("account is locked")) {
      return "Your account has been temporarily locked due to multiple failed attempts. Please try again later.";
    }
    if (message.includes("verify your email")) {
      return "Please verify your email address before logging in. Check your inbox for the verification code.";
    }
    if (message.includes("too many attempts")) {
      return "Too many failed login attempts. Please wait a few minutes before trying again.";
    }
    return message;
  };

  const handleSubmit = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      console.log("Login success:", response.data);

      if (response.data.data?.access_token) {
        localStorage.setItem("authToken", response.data.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
        localStorage.setItem("last_login", new Date().toISOString());
        navigate("/");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err.response?.status === 401) {
        setError(
          "Invalid email or password. Please double-check your credentials.",
        );
      } else if (err.response?.data?.message) {
        setError(translateErrorMessage(err.response.data.message));
      } else if (err.code === "ERR_NETWORK") {
        setError(
          "Unable to connect to the server. Please check your internet connection and try again.",
        );
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full glass-card overflow-hidden scale-in">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Platform Info */}
          <div className="md:w-1/2 p-8 md:p-10 bg-gradient-to-br from-bg via-bg to-[#5CA1FC]/5 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#5CA1FC]/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#5CA1FC]/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="relative">
                  <div className="absolute inset-0 w-10 h-10 bg-[#5CA1FC]/30 rounded-full blur-xl animate-pulse"></div>
                  <img
                    src={logo}
                    alt="TechTalk Logo"
                    className="h-8 w-auto relative z-10"
                  />
                </div>
                <span className="gradient-title font-bold text-xl">
                  TechTalk
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Welcome Back! 👋
              </h2>
              <p className="text-muted mb-8">
                Sign in to continue your developer journey with TechTalk.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-3 group">
                  <div className="w-5 h-5 bg-[#5CA1FC]/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-[#5CA1FC]/30 transition-all duration-300">
                    <LogIn size={12} className="text-[#5CA1FC]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      Access Your Account
                    </h4>
                    <p className="text-muted text-sm">
                      View your posts and activity
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-5 h-5 bg-[#5CA1FC]/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-[#5CA1FC]/30 transition-all duration-300">
                    <Users size={12} className="text-[#5CA1FC]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      Connect With Developers
                    </h4>
                    <p className="text-muted text-sm">
                      Join technical discussions
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-5 h-5 bg-[#5CA1FC]/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-[#5CA1FC]/30 transition-all duration-300">
                    <Code size={12} className="text-[#5CA1FC]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      Share Your Knowledge
                    </h4>
                    <p className="text-muted text-sm">
                      Post code snippets and blogs
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-10 pt-6 border-t border-panelEdge/50">
                <div>
                  <p className="text-2xl font-bold text-[#5CA1FC]">10K+</p>
                  <p className="text-label text-sm">Active Developers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#5CA1FC]">4.9</p>
                  <p className="text-label text-sm">Community Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="md:w-1/2 p-8 md:p-10">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <Sparkles size={24} className="text-[#5CA1FC]" />
                <h3 className="text-2xl font-bold text-white">Sign In</h3>
              </div>
              <p className="text-muted text-sm mt-1">
                Enter your credentials to access your account
              </p>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-error/20 border border-error/30 rounded-lg slide-up">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-error/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle size={14} className="text-error" />
                  </div>
                  <div>
                    <p className="text-error text-sm font-medium">
                      {error.includes("Please") ? error : `Oops! ${error}`}
                    </p>
                    {error.includes("email") && (
                      <p className="text-error/70 text-xs mt-0.5">
                        Tip: Make sure you're using the email you registered
                        with.
                      </p>
                    )}
                    {error.includes("password") && (
                      <p className="text-error/70 text-xs mt-0.5">
                        Tip: Passwords are case-sensitive. Check your caps lock.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }}
            >
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-label mb-1"
                >
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="input-field focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-label mb-1"
                >
                  Password <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pr-11 focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-[#5CA1FC] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-muted mt-1">
                  Password is case-sensitive. Make sure caps lock is off.
                </p>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#5CA1FC] hover:text-[#4A8BE8] transition-colors hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 gradient-button text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(92,161,252,0.25)] hover:shadow-[0_8px_32px_rgba(92,161,252,0.35)] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-[#5CA1FC] hover:text-[#4A8BE8] transition-colors hover:underline"
                >
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
