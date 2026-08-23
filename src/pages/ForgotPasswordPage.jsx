import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Mail,
  Key,
  Shield,
  Sparkles,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import logo from "/src/assets/logo.png";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      console.log("Forgot password response:", response.data);

      setSuccess(true);
    } catch (err) {
      console.error("Forgot password error:", err);

      if (err.response?.status === 404) {
        setError(
          "No account found with this email address. Please sign up first.",
        );
      } else if (err.response?.data?.message) {
        const translated = translateErrorMessage(err.response.data.message);
        setError(translated);
      } else if (err.code === "ERR_NETWORK") {
        setError(
          "Unable to connect to the server. Please check your internet connection.",
        );
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ دالة لترجمة رسائل الخطأ
  const translateErrorMessage = (message) => {
    if (message.includes("not found")) {
      return "No account found with this email address. Please sign up first.";
    }
    if (message.includes("invalid")) {
      return "Please enter a valid email address.";
    }
    if (message.includes("rate limit") || message.includes("too many")) {
      return "Too many requests. Please wait a few minutes before trying again.";
    }
    return message;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoadingSpinner size="lg" text="Sending reset link..." />
      </div>
    );
  }

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
                Reset Password 🔑
              </h2>
              <p className="text-muted mb-8">
                Don't worry, it happens to the best of us.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-3 group">
                  <div className="w-5 h-5 bg-[#5CA1FC]/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-[#5CA1FC]/30 transition-all duration-300">
                    <Mail size={12} className="text-[#5CA1FC]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Check Your Email</h4>
                    <p className="text-muted text-sm">
                      We'll send you a reset link
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-5 h-5 bg-[#5CA1FC]/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-[#5CA1FC]/30 transition-all duration-300">
                    <Key size={12} className="text-[#5CA1FC]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      Create New Password
                    </h4>
                    <p className="text-muted text-sm">
                      Choose a strong password
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-5 h-5 bg-[#5CA1FC]/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-[#5CA1FC]/30 transition-all duration-300">
                    <Shield size={12} className="text-[#5CA1FC]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Secure Account</h4>
                    <p className="text-muted text-sm">
                      Keep your developer profile safe
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
                  <p className="text-2xl font-bold text-[#5CA1FC]">24/7</p>
                  <p className="text-label text-sm">Support Available</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Forgot Password Form */}
          <div className="md:w-1/2 p-8 md:p-10">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <Sparkles size={24} className="text-[#5CA1FC]" />
                <h3 className="text-2xl font-bold text-white">
                  Forgot Password
                </h3>
              </div>
              <p className="text-muted text-sm mt-1">
                Enter your email to receive a reset link
              </p>
            </div>

            {/* ✅ رسالة الخطأ المحسّنة */}
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
                    {error.includes("account") && (
                      <p className="text-error/70 text-xs mt-0.5">
                        Tip: If you don't have an account, please sign up first.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {success ? (
              // ✅ رسالة النجاح المحسّنة
              <div className="slide-up">
                <div className="mb-6 p-6 bg-success/10 border border-success/30 rounded-xl text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center pulse-ring">
                      <CheckCircle size={40} className="text-success" />
                    </div>
                  </div>
                  <h4 className="text-white font-semibold text-lg mb-2">
                    Check Your Email 📧
                  </h4>
                  <p className="text-success text-sm">
                    If your email exists in our system, a password reset link
                    has been sent.
                  </p>
                  <p className="text-success/70 text-xs mt-2">
                    Please check your inbox (and spam folder) for the reset
                    link.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-3 gradient-button text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(92,161,252,0.25)] hover:shadow-[0_8px_32px_rgba(92,161,252,0.35)] active:scale-[0.98]"
                >
                  Back to Sign In
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(e);
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 gradient-button text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(92,161,252,0.25)] hover:shadow-[0_8px_32px_rgba(92,161,252,0.35)] active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Sign In link */}
            {!success && (
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-muted hover:text-[#5CA1FC] transition-colors hover:underline inline-flex items-center gap-1"
                >
                  ← Back to Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
