import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Loader2,
  Moon,
  Sun,
  Monitor,
  Globe,
  Bell,
  Mail,
  Heart,
  UserPlus,
  AtSign,
  Award,
  Zap,
  Shield,
  MessageCircle,
} from "lucide-react";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

// ✅ مكون Toggle Switch
const Toggle = ({ checked, onChange, label, description, icon: Icon }) => {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={15} className="text-[#5CA1FC] flex-shrink-0" />}
          <label className="text-sm text-gray-300 font-medium cursor-pointer select-none">
            {label}
          </label>
        </div>
        {description && (
          <p className="text-xs text-muted mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-[#5CA1FC]" : "bg-panelEdge"
        }`}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0.5"
          } mt-0.5`}
        />
      </button>
    </div>
  );
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Settings states
  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");

  // Notification channels
  const [push, setPush] = useState(false);
  const [email, setEmail] = useState(false);

  // Notification events
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyFollows, setNotifyFollows] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [notifyHighlights, setNotifyHighlights] = useState(true);
  const [notifyVerification, setNotifyVerification] = useState(true);
  const [notifyUpdates, setNotifyUpdates] = useState(false);

  // Privacy
  const [showEmail, setShowEmail] = useState(false);
  const [profileDiscoverable, setProfileDiscoverable] = useState(true);
  const [allowFollows, setAllowFollows] = useState(true);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [policyVersion, setPolicyVersion] = useState("");

  // جلب الإعدادات
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/settings");
      const data = response.data.data?.settings || {};

      setTheme(data.theme || "system");
      setLanguage(data.language || "en");

      if (data.notifications?.channels) {
        setPush(data.notifications.channels.push ?? false);
        setEmail(data.notifications.channels.email ?? false);
      }

      if (data.notifications?.events) {
        setNotifyLikes(data.notifications.events.likes ?? true);
        setNotifyComments(data.notifications.events.comments ?? true);
        setNotifyFollows(data.notifications.events.follows ?? true);
        setNotifyMentions(data.notifications.events.mentions ?? true);
        setNotifyHighlights(data.notifications.events.highlights ?? true);
        setNotifyVerification(data.notifications.events.verification ?? true);
        setNotifyUpdates(data.notifications.events.product_updates ?? false);
      }

      if (data.privacy) {
        setShowEmail(data.privacy.show_email ?? false);
        setProfileDiscoverable(data.privacy.profile_discoverable ?? true);
        setAllowFollows(data.privacy.allow_follows ?? true);
        setPolicyAccepted(data.privacy.policy_accepted ?? false);
        setPolicyVersion(data.privacy.policy_version || "");
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      setError("Failed to load settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // حفظ الإعدادات
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const payload = {
      theme,
      language,
      notifications: {
        channels: {
          push: push,
          email: email,
        },
        events: {
          likes: notifyLikes,
          comments: notifyComments,
          follows: notifyFollows,
          mentions: notifyMentions,
          highlights: notifyHighlights,
          verification: notifyVerification,
          product_updates: notifyUpdates,
        },
      },
      privacy: {
        show_email: showEmail,
        profile_discoverable: profileDiscoverable,
        allow_follows: allowFollows,
        policy_accepted: policyAccepted,
        policy_version: policyVersion || null,
      },
    };

    try {
      await api.patch("/settings", payload);
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save settings. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-white group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
        </button>
        <h1 className="gradient-title text-2xl font-bold">Settings</h1>
      </div>

      {/* Error & Success */}
      {error && (
        <div className="mb-4 p-3 bg-error/20 border border-error/30 rounded-lg slide-up">
          <p className="text-error text-sm text-center">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-success/20 border border-success/30 rounded-lg slide-up">
          <p className="text-success text-sm text-center">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Appearance */}
        <div className="glass-card p-5 hover:border-[#5CA1FC]/20 transition-all duration-300">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2 text-base">
            <Monitor size={18} className="text-[#5CA1FC]" />
            Appearance
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-label mb-1.5">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "light", icon: Sun, label: "Light" },
                  { value: "dark", icon: Moon, label: "Dark" },
                  { value: "system", icon: Monitor, label: "System" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      theme === option.value
                        ? "bg-[#5CA1FC] text-white shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
                        : "bg-white/5 text-muted hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <option.icon size={16} />
                    <span className="text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-label mb-1.5">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field focus:ring-[#5CA1FC] focus:border-[#5CA1FC] py-2"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-5 hover:border-[#5CA1FC]/20 transition-all duration-300">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2 text-base">
            <Bell size={18} className="text-[#5CA1FC]" />
            Notifications
          </h2>

          <div className="space-y-1">
            {/* Push Notifications - Toggle */}
            <Toggle
              checked={push}
              onChange={setPush}
              label="Push Notifications"
              description="Receive push notifications even when you're not on the site."
              icon={Bell}
            />

            {/* Email Notifications - Toggle */}
            <Toggle
              checked={email}
              onChange={setEmail}
              label="Email Notifications"
              description="Receive emails about platform updates, news, and important announcements."
              icon={Mail}
            />

            {/* Events */}
            <div className="pt-2 mt-1 border-t border-panelEdge">
              <p className="text-xs text-muted mb-2">Notification Events</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
                {[
                  {
                    key: "likes",
                    label: "Likes",
                    icon: Heart,
                    value: notifyLikes,
                    setter: setNotifyLikes,
                  },
                  {
                    key: "comments",
                    label: "Comments",
                    icon: MessageCircle,
                    value: notifyComments,
                    setter: setNotifyComments,
                  },
                  {
                    key: "follows",
                    label: "Follows",
                    icon: UserPlus,
                    value: notifyFollows,
                    setter: setNotifyFollows,
                  },
                  {
                    key: "mentions",
                    label: "Mentions",
                    icon: AtSign,
                    value: notifyMentions,
                    setter: setNotifyMentions,
                  },
                  {
                    key: "highlights",
                    label: "Highlights",
                    icon: Award,
                    value: notifyHighlights,
                    setter: setNotifyHighlights,
                  },
                  {
                    key: "verification",
                    label: "Verification",
                    icon: Shield,
                    value: notifyVerification,
                    setter: setNotifyVerification,
                  },
                  {
                    key: "updates",
                    label: "Product Updates",
                    icon: Zap,
                    value: notifyUpdates,
                    setter: setNotifyUpdates,
                  },
                ].map((ev) => (
                  <Toggle
                    key={ev.key}
                    checked={ev.value}
                    onChange={ev.setter}
                    label={ev.label}
                    icon={ev.icon}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="glass-card p-5 hover:border-[#5CA1FC]/20 transition-all duration-300">
          <h2 className="text-white font-semibold mb-3 flex items-center gap-2 text-base">
            <Shield size={18} className="text-[#5CA1FC]" />
            Privacy
          </h2>
          <div className="space-y-0">
            <Toggle
              checked={showEmail}
              onChange={setShowEmail}
              label="Show email on profile"
            />
            <Toggle
              checked={profileDiscoverable}
              onChange={setProfileDiscoverable}
              label="Profile discoverable"
            />
            <Toggle
              checked={allowFollows}
              onChange={setAllowFollows}
              label="Allow others to follow you"
            />
            <Toggle
              checked={policyAccepted}
              onChange={setPolicyAccepted}
              label="Accept privacy policy"
            />
            {policyAccepted && (
              <div className="mt-2">
                <input
                  type="text"
                  value={policyVersion}
                  onChange={(e) => setPolicyVersion(e.target.value)}
                  placeholder="Policy version (optional)"
                  className="input-field text-sm focus:ring-[#5CA1FC] focus:border-[#5CA1FC] py-2"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-3 border-t border-panelEdge">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200 hover:text-[#5CA1FC] text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(92,161,252,0.25)] hover:shadow-[0_8px_32px_rgba(92,161,252,0.35)] text-sm"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
