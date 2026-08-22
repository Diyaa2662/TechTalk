import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Users,
  Code,
  Network,
} from "lucide-react";
import logo from "/src/assets/logo.png";
import api from "../services/api";

const SignupPage = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== password_confirmation) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long!");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/register", {
        name,
        email,
        username,
        password,
        password_confirmation,
      });

      console.log("Signup success:", response.data);

      if (response.data.data?.user_id) {
        localStorage.setItem("temp_user_id", response.data.data.user_id);
        localStorage.setItem("temp_email", email);
      }

      alert(
        response.data.message ||
          "Account created successfully! Please verify your OTP.",
      );
      navigate("/verify-otp");
    } catch (err) {
      console.error("Signup error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        setError(firstError || "Something went wrong. Please try again.");
      } else {
        setError("Network error. Please check your connection.");
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
          <div className="md:w-1/2 p-8 md:p-10 bg-gradient-to-br from-bg via-bg to-accent/5 relative overflow-hidden">
            {/* Glow Effects - محدثة باللون الجديد */}
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
                Join Our Community!
              </h2>
              <p className="text-muted mb-8">
                Create your account to connect with developers worldwide.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-3 group">
                  <div className="w-5 h-5 bg-[#5CA1FC]/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-[#5CA1FC]/30 transition-all duration-300">
                    <Code size={12} className="text-[#5CA1FC]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Share Your Code</h4>
                    <p className="text-muted text-sm">
                      Post snippets and get feedback
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-5 h-5 bg-[#5CA1FC]/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-[#5CA1FC]/30 transition-all duration-300">
                    <Users size={12} className="text-[#5CA1FC]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      Solve Problems Together
                    </h4>
                    <p className="text-muted text-sm">
                      Get help from expert developers
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-5 h-5 bg-[#5CA1FC]/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-[#5CA1FC]/30 transition-all duration-300">
                    <Network size={12} className="text-[#5CA1FC]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      Build Your Network
                    </h4>
                    <p className="text-muted text-sm">
                      Connect with tech professionals
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

          {/* Right Side - Signup Form */}
          <div className="md:w-1/2 p-8 md:p-10">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <Sparkles size={24} className="text-[#5CA1FC]" />
                <h3 className="text-2xl font-bold text-white">
                  Create Account
                </h3>
              </div>
              <p className="text-muted text-sm mt-1">
                Enter your details to get started
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error/20 border border-error/30 rounded-lg slide-up">
                <p className="text-error text-sm text-center">{error}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-label mb-1"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="input-field"
                />
              </div>

              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-label mb-1"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="input-field"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-label mb-1"
                >
                  Email Address
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
                  className="input-field"
                />
              </div>

              {/* Password with eye icon */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-label mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pr-11"
                  />
                  {password && password.length < 8 && (
                    <p className="text-error text-xs mt-1 animate-pulse">
                      * Password must be at least 8 characters
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-[#5CA1FC] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password with eye icon */}
              <div>
                <label
                  htmlFor="password_confirmation"
                  className="block text-sm font-medium text-label mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password_confirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-[#5CA1FC] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign Up Button - يستخدم gradient-button من CSS */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 gradient-button text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(92,161,252,0.25)] hover:shadow-[0_8px_32px_rgba(92,161,252,0.35)] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </>
                ) : (
                  <>
                    Sign Up
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
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-[#5CA1FC] hover:text-[#4A8BE8] transition-colors hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
