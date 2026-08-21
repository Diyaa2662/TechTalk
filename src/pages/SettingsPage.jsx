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

      // Theme & Language
      setTheme(data.theme || "system");
      setLanguage(data.language || "en");

      // Notification channels
      if (data.notifications?.channels) {
        setPush(data.notifications.channels.push ?? false);
        setEmail(data.notifications.channels.email ?? false);
      }

      // Notification events
      if (data.notifications?.events) {
        setNotifyLikes(data.notifications.events.likes ?? true);
        setNotifyComments(data.notifications.events.comments ?? true);
        setNotifyFollows(data.notifications.events.follows ?? true);
        setNotifyMentions(data.notifications.events.mentions ?? true);
        setNotifyHighlights(data.notifications.events.highlights ?? true);
        setNotifyVerification(data.notifications.events.verification ?? true);
        setNotifyUpdates(data.notifications.events.product_updates ?? false);
      }

      // Privacy
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
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="gradient-title text-2xl font-bold">Settings</h1>
      </div>

      {/* Error & Success */}
      {error && (
        <div className="mb-4 p-3 bg-error/20 border border-error/50 rounded-lg">
          <p className="text-error text-sm text-center">{error}</p>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-success/20 border border-success/50 rounded-lg">
          <p className="text-success text-sm text-center">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Appearance */}
        <div className="glass-card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Monitor size={18} className="text-accent" />
            Appearance
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-label mb-1">
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
                        ? "bg-accent text-white shadow-accent-sm"
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
              <label className="block text-sm font-medium text-label mb-1">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-field"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass-card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Bell size={18} className="text-accent" />
            Notifications
          </h2>

          <div className="space-y-4">
            {/* Push Notifications */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={push}
                onChange={(e) => setPush(e.target.checked)}
                className="w-4 h-4 accent-accent mt-1"
              />
              <div>
                <label className="text-sm text-gray-300 font-medium cursor-pointer">
                  Push Notifications
                </label>
                <p className="text-xs text-muted">
                  Receive push notifications even when you're not on the site.
                  Notifications will still appear in your notifications list.
                </p>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={email}
                onChange={(e) => setEmail(e.target.checked)}
                className="w-4 h-4 accent-accent mt-1"
              />
              <div>
                <label className="text-sm text-gray-300 font-medium cursor-pointer">
                  Email Notifications
                </label>
                <p className="text-xs text-muted">
                  Receive emails about platform updates, news, and important
                  announcements.
                </p>
              </div>
            </div>

            {/* Events - بدون عنوان */}
            <div className="pt-2 border-t border-panelEdge">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                  <label
                    key={ev.key}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={ev.value}
                      onChange={(e) => ev.setter(e.target.checked)}
                      className="w-4 h-4 accent-accent"
                    />
                    <ev.icon size={14} className="text-muted" />
                    <span className="text-sm text-gray-300">{ev.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="glass-card p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Shield size={18} className="text-accent" />
            Privacy
          </h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-sm text-gray-300">
                Show email on profile
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={profileDiscoverable}
                onChange={(e) => setProfileDiscoverable(e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-sm text-gray-300">
                Profile discoverable
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowFollows}
                onChange={(e) => setAllowFollows(e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-sm text-gray-300">
                Allow others to follow you
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-sm text-gray-300">
                Accept privacy policy
              </span>
            </label>
            {policyAccepted && (
              <input
                type="text"
                value={policyVersion}
                onChange={(e) => setPolicyVersion(e.target.value)}
                placeholder="Policy version (optional)"
                className="input-field mt-2 text-sm"
              />
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4 border-t border-panelEdge">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-3 bg-accent hover:bg-accentHover text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-accent-sm"
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
