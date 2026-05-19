import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "/src/assets/logo.png";
import api from "../services/api";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/forgot-password", { email });

      console.log("Forgot password response:", response.data);

      // عرض رسالة النجاح
      setSuccess(true);
    } catch (err) {
      console.error("Forgot password error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkShade flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Platform Info */}
          <div className="md:w-1/2 p-8 md:p-10 bg-gradient-to-br from-darkShade to-darkShade/80">
            <div className="flex items-center gap-3 mb-8">
              <div className="relative">
                <div className="absolute inset-0 w-10 h-10 bg-yellowShade/20 rounded-full blur-lg"></div>
                <img
                  src={logo}
                  alt="TechTalk Logo"
                  className="h-8 w-auto relative z-10"
                />
              </div>
              <span className="text-yellowShade font-bold text-xl">
                TechTalk
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Reset Password
            </h2>
            <p className="text-gray-400 mb-8">
              Don't worry, it happens to the best of us.
            </p>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-yellowShade rounded-full flex items-center justify-center mt-0.5">
                  <svg
                    className="w-3 h-3 text-darkShade"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-medium">Check Your Email</h4>
                  <p className="text-gray-400 text-sm">
                    We'll send you a reset link
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-yellowShade rounded-full flex items-center justify-center mt-0.5">
                  <svg
                    className="w-3 h-3 text-darkShade"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-medium">
                    Create New Password
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Choose a strong password
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-yellowShade rounded-full flex items-center justify-center mt-0.5">
                  <svg
                    className="w-3 h-3 text-darkShade"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-white font-medium">Secure Account</h4>
                  <p className="text-gray-400 text-sm">
                    Keep your developer profile safe
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-10 pt-6 border-t border-white/10">
              <div>
                <p className="text-2xl font-bold text-yellowShade">10K+</p>
                <p className="text-gray-500 text-sm">Active Developers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellowShade">24/7</p>
                <p className="text-gray-500 text-sm">Support Available</p>
              </div>
            </div>
          </div>

          {/* Right Side - Forgot Password Form */}
          <div className="md:w-1/2 p-8 md:p-10">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white">Forgot Password</h3>
              <p className="text-gray-400 text-sm mt-1">
                Enter your email to receive a reset link
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            {success ? (
              // رسالة النجاح
              <div>
                <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      className="w-12 h-12 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-green-400 text-sm text-center">
                    If your email exists in our system, a password reset link
                    has been sent.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="w-full py-2.5 bg-yellowShade hover:bg-yellowShade/90 text-darkShade font-semibold rounded-lg transition-all duration-200"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-1"
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
                    className="w-full px-4 py-2.5 bg-white/10 border border-gray-600 rounded-lg shadow-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent transition-all"
                  />
                </div>

                {/* Send Reset Link Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 mt-2 bg-yellowShade hover:bg-yellowShade/90 text-darkShade font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}

            {/* Back to Sign In link */}
            {!success && (
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-gray-400 hover:text-yellowShade transition-colors"
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
