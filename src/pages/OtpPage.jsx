import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Mail,
  Shield,
  Sparkles,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import logo from "/src/assets/logo.png";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

const OtpPage = () => {
  const navigate = useNavigate();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // جلب الإيميل من localStorage عند تحميل الصفحة
  useEffect(() => {
    const tempEmail = localStorage.getItem("temp_email");
    if (tempEmail) {
      setEmail(tempEmail);
    } else {
      navigate("/signup");
    }
  }, [navigate]);

  // مؤقت إعادة الإرسال
  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const otpCode = code.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit verification code");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/otp/verify", {
        email,
        code: otpCode,
      });

      console.log("OTP verification success:", response.data);

      if (response.data.data?.access_token) {
        localStorage.setItem("authToken", response.data.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));

        localStorage.removeItem("temp_email");
        localStorage.removeItem("temp_user_id");

        navigate("/");
      }
    } catch (err) {
      console.error("OTP verification error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError("");

    try {
      await api.post("/otp/resend", { email });

      setCountdown(60);
      setCanResend(false);
      setCode(["", "", "", "", "", ""]);

      const firstInput = document.getElementById("otp-input-0");
      if (firstInput) firstInput.focus();
    } catch (err) {
      console.error("Resend error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to resend code. Please try again.",
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoadingSpinner size="lg" text="Verifying..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full glass-card overflow-hidden scale-in">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Platform Info */}
          <div className="md:w-1/2 p-8 md:p-10 bg-gradient-to-br from-bg via-bg to-[#5CA1FC]/5 relative overflow-hidden">
            {/* Glow Effects */}
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
                Verify Your Email
              </h2>
              <p className="text-muted mb-8">
                We've sent a verification code to your email address.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-3 group">
                  <div className="w-5 h-5 bg-[#5CA1FC]/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-[#5CA1FC]/30 transition-all duration-300">
                    <Mail size={12} className="text-[#5CA1FC]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Check Your Inbox</h4>
                    <p className="text-muted text-sm">
                      Enter the 6-digit code we sent to:
                    </p>
                    <p className="text-[#5CA1FC] text-sm font-medium mt-1 break-all">
                      {email || "your email"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-5 h-5 bg-[#5CA1FC]/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-[#5CA1FC]/30 transition-all duration-300">
                    <Shield size={12} className="text-[#5CA1FC]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      Secure Verification
                    </h4>
                    <p className="text-muted text-sm">
                      Protecting your developer account
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 group">
                  <div className="w-5 h-5 bg-[#5CA1FC]/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0 group-hover:bg-[#5CA1FC]/30 transition-all duration-300">
                    <CheckCircle size={12} className="text-[#5CA1FC]" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Get Started</h4>
                    <p className="text-muted text-sm">
                      Access all TechTalk features
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - OTP Form */}
          <div className="md:w-1/2 p-8 md:p-10">
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <Sparkles size={24} className="text-[#5CA1FC]" />
                <h3 className="text-2xl font-bold text-white">
                  Verification Code
                </h3>
              </div>
              <p className="text-muted text-sm mt-1">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error/20 border border-error/30 rounded-lg slide-up">
                <p className="text-error text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* OTP Input Fields */}
              <div className="flex justify-between gap-2 mb-6">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-semibold text-white bg-panel border-2 border-panelEdge rounded-xl focus:outline-none focus:border-[#5CA1FC] focus:ring-2 focus:ring-[#5CA1FC]/30 transition-all duration-200 hover:border-[#5CA1FC]/30"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mb-4 gradient-button text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(92,161,252,0.25)] hover:shadow-[0_8px_32px_rgba(92,161,252,0.35)] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Code
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>

              {/* Resend Section */}
              <div className="text-center">
                <p className="text-sm text-muted">
                  Didn't receive the code?{" "}
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendLoading}
                      className="text-[#5CA1FC] hover:text-[#4A8BE8] font-medium transition-colors disabled:opacity-50 hover:underline inline-flex items-center gap-1"
                    >
                      {resendLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#5CA1FC]/30 border-t-[#5CA1FC] rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <RotateCcw size={14} />
                          Resend Code
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-label">
                      Resend in {countdown} seconds
                    </span>
                  )}
                </p>
              </div>
            </form>

            {/* Back to Signup */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/signup")}
                className="text-sm text-muted hover:text-[#5CA1FC] transition-colors hover:underline inline-flex items-center gap-1"
              >
                ← Back to Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
