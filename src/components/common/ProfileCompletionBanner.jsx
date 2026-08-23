// src/components/common/ProfileCompletionBanner.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  X,
  User,
  MapPin,
  Link as LinkIcon,
  Image,
  AlertCircle,
} from "lucide-react";
import api from "../../services/api";

const ProfileCompletionBanner = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [missingFields, setMissingFields] = useState([]);

  const handleDismiss = () => {
    sessionStorage.setItem("profile_banner_shown", "true");
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
    }, 300);
  };

  const handleComplete = () => {
    sessionStorage.setItem("profile_banner_shown", "true");
    setFadeOut(true);
    setTimeout(() => {
      setVisible(false);
      navigate("/edit-profile");
    }, 300);
  };

  useEffect(() => {
    const checkProfile = async () => {
      // ✅ التحقق إذا كان الـ Banner ظهر في هذه الجلسة
      const hasBeenShown =
        sessionStorage.getItem("profile_banner_shown") === "true";
      if (hasBeenShown) return;

      try {
        const response = await api.get("/show-me");
        const profile = response.data.data;

        // ✅ التحقق من العناصر الناقصة
        const missing = [];

        const hasBio = profile.bio && profile.bio.trim().length > 0;
        if (!hasBio) missing.push({ key: "bio", label: "Bio", icon: User });

        const hasAvatar =
          profile.avatar_url &&
          !profile.avatar_url.includes("default-avatar.png");
        if (!hasAvatar)
          missing.push({
            key: "avatar",
            label: "Profile Picture",
            icon: Image,
          });

        const hasLocation =
          profile.location && profile.location.trim().length > 0;
        if (!hasLocation)
          missing.push({ key: "location", label: "Location", icon: MapPin });

        const hasSocialLinks =
          profile.social_links && profile.social_links.length > 0;
        if (!hasSocialLinks)
          missing.push({
            key: "social",
            label: "Social Links",
            icon: LinkIcon,
          });

        setMissingFields(missing);

        // ✅ إذا كان في عناصر ناقصة، نعرض الـ Banner
        if (missing.length > 0) {
          setVisible(true);
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      }
    };

    checkProfile();
  }, []);

  // ✅ Effect منفصل للـ timeout
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, 10000); // ✅ 10 ثواني عشان المستخدم يقرأ

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full mx-4 transition-all duration-300 ${
        fadeOut ? "opacity-0 translate-y-[-10px]" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="glass-card p-4 border-[#5CA1FC]/30 bg-gradient-to-r from-[#5CA1FC]/10 via-panel/80 to-transparent shadow-[0_4px_20px_rgba(92,161,252,0.15)]">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#5CA1FC]/20 flex items-center justify-center animate-pulse mt-0.5">
            <Sparkles size={20} className="text-[#5CA1FC]" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm flex items-center gap-2">
              Complete Your Profile! 🚀
              <span className="text-xs text-yellow-400 font-normal">
                {missingFields.length}{" "}
                {missingFields.length === 1 ? "item" : "items"} missing
              </span>
            </h4>

            {/* ✅ عرض العناصر الناقصة */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {missingFields.map((field) => (
                <span
                  key={field.key}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-[#5CA1FC]/10 text-[#5CA1FC] rounded-full"
                >
                  <field.icon size={12} />
                  {field.label}
                </span>
              ))}
            </div>

            <p className="text-muted text-xs mt-1.5">
              Add these details to help others know you better and unlock more
              features.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
            <button
              onClick={handleComplete}
              className="px-3 py-1.5 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white text-xs font-medium rounded-lg transition-all hover:scale-105 shadow-[0_4px_12px_rgba(92,161,252,0.3)]"
            >
              Complete Now
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-white"
              title="Dismiss"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;
