import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "/src/assets/logo.png";
import api from "../services/api";

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
      // إذا ما في إيميل، نرجّع المستخدم للتسجيل
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

    // التركيز تلقائيًا على الحقل التالي
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // الرجوع للحقل السابق عند الضغط على Backspace
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

      // تخزين التوكن والمعلومات
      if (response.data.data?.access_token) {
        localStorage.setItem("authToken", response.data.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));

        // تنظيف البيانات المؤقتة
        localStorage.removeItem("temp_email");
        localStorage.removeItem("temp_user_id");

        // التوجيه إلى الصفحة الرئيسية
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
      // إرسال طلب إعادة إرسال الـ OTP
      await api.post("/otp/resend", { email });

      // إعادة تعيين المؤقت
      setCountdown(60);
      setCanResend(false);
      setCode(["", "", "", "", "", ""]);

      // تركيز على أول حقل
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
              Verify Your Email
            </h2>
            <p className="text-gray-400 mb-8">
              We've sent a verification code to your email address.
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
                  <h4 className="text-white font-medium">Check Your Inbox</h4>
                  <p className="text-gray-400 text-sm">
                    Enter the 6-digit code we sent to:
                  </p>
                  <p className="text-yellowShade text-sm font-medium mt-1">
                    {email || "your email"}
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
                    Secure Verification
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Protecting your developer account
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
                  <h4 className="text-white font-medium">Get Started</h4>
                  <p className="text-gray-400 text-sm">
                    Access all TechTalk features
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - OTP Form */}
          <div className="md:w-1/2 p-8 md:p-10">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white">
                Verification Code
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
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
                    className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-semibold text-white bg-white/10 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent transition-all"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mb-4 bg-yellowShade hover:bg-yellowShade/90 text-darkShade font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              {/* Resend Section */}
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Didn't receive the code?{" "}
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={resendLoading}
                      className="text-yellowShade hover:text-yellowShade/80 font-medium transition-colors disabled:opacity-50"
                    >
                      {resendLoading ? "Sending..." : "Resend Code"}
                    </button>
                  ) : (
                    <span className="text-gray-500">
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
                className="text-sm text-gray-400 hover:text-yellowShade transition-colors"
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
