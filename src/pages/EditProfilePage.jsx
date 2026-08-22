/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  X,
  Loader2,
  MapPin,
  Link as LinkIcon,
  Plus,
  Trash2,
  User,
  Mail,
  Lock,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [socialLinks, setSocialLinks] = useState([]);
  const [newSocialLink, setNewSocialLink] = useState("");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Tags
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearch, setTagSearch] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);

  // Images
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  // Loading states for each section
  const [savingName, setSavingName] = useState(false);
  const [savingUsername, setSavingUsername] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const tagInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // جلب بيانات المستخدم الحالي
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/show-me");
      const data = response.data.data;

      setName(data.name || "");
      setUsername(data.username || "");
      setEmail(data.email || "");
      setBio(data.bio || "");
      setLocation(data.location || "");
      setWebsite(data.website || "");
      setSocialLinks(data.social_links || []);
      setSelectedTags(data.tags || []);
      setAvatarPreview(data.avatar_url || "");
      setCoverPreview(data.cover_image_url || "");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  // جلب التاجات
  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      const response = await api.get("/tags");
      setAllTags(response.data.data || []);
    } catch (err) {
      console.error("Error fetching tags:", err);
    } finally {
      setLoadingTags(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchTags();
  }, []);

  // إغلاق قائمة التاجات عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        tagInputRef.current &&
        !tagInputRef.current.contains(e.target)
      ) {
        setShowTagDropdown(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // إضافة رابط تواصل اجتماعي
  const addSocialLink = () => {
    if (!newSocialLink.trim()) return;

    try {
      new URL(newSocialLink);
    } catch {
      setError("Please enter a valid URL for social link.");
      return;
    }

    setSocialLinks([...socialLinks, newSocialLink.trim()]);
    setNewSocialLink("");
    setError("");
  };

  // إزالة رابط تواصل اجتماعي
  const removeSocialLink = (index) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // إضافة تاج
  const addTag = (tag) => {
    if (!selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagSearch("");
    setShowTagDropdown(false);
    tagInputRef.current?.focus();
  };

  // إزالة تاج
  const removeTag = (tagId) => {
    setSelectedTags(selectedTags.filter((tag) => tag.id !== tagId));
  };

  // تصفية التاجات
  const filteredTags = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !selectedTags.some((selected) => selected.id === tag.id),
  );

  // معالجة رفع الصورة الشخصية
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target.result);
    };
    reader.readAsDataURL(file);
    setError("");
  };

  // معالجة رفع صورة الغلاف
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverPreview(event.target.result);
    };
    reader.readAsDataURL(file);
    setError("");
  };

  // إزالة الصورة الشخصية
  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  // إزالة صورة الغلاف
  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview("");
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  // تغيير الاسم
  const handleChangeName = async () => {
    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!currentPassword) {
      setError("Current password is required to change name.");
      return;
    }

    setSavingName(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/change-name", {
        name: name.trim(),
        password: currentPassword,
      });

      setSuccess("Name updated successfully!");
      setCurrentPassword("");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.name = name.trim();
      localStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
      console.error("Error changing name:", err);

      if (err.response?.status === 429) {
        setError(
          "Too many name change requests. Please wait a few minutes and try again.",
        );
      } else if (err.response?.data?.message === "Name change is on cooldown") {
        setError(
          "Name change is on cooldown. Please wait a few minutes before trying again.",
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to update name. Please try again.");
      }
    } finally {
      setSavingName(false);
    }
  };

  // تغيير اسم المستخدم
  const handleChangeUsername = async () => {
    if (!username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!currentPassword) {
      setError("Current password is required to change username.");
      return;
    }

    setSavingUsername(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/updateusername", {
        username: username.trim(),
        password: currentPassword,
      });

      setSuccess("Username updated successfully!");
      setCurrentPassword("");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.username = username.trim();
      localStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
      console.error("Error changing username:", err);

      if (err.response?.status === 429) {
        setError(
          "Too many username change requests. Please wait a few minutes and try again.",
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to update username. Please try again.");
      }
    } finally {
      setSavingUsername(false);
    }
  };

  // تغيير البريد الإلكتروني
  const handleChangeEmail = async () => {
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!currentPassword) {
      setError("Current password is required to change email.");
      return;
    }

    setSavingEmail(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/updateemail", {
        email: email.trim(),
        password: currentPassword,
      });

      setSuccess("Email updated successfully!");
      setCurrentPassword("");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.email = email.trim();
      localStorage.setItem("user", JSON.stringify(user));
    } catch (err) {
      console.error("Error changing email:", err);

      if (err.response?.status === 429) {
        setError(
          "Too many email change requests. Please wait a few minutes and try again.",
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to update email. Please try again.");
      }
    } finally {
      setSavingEmail(false);
    }
  };

  // تغيير كلمة المرور
  const handleChangePassword = async () => {
    if (!currentPassword) {
      setError("Current password is required.");
      return;
    }

    if (!newPassword) {
      setError("New password is required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      setError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/change-password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      });

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");
    } catch (err) {
      console.error("Error changing password:", err);

      if (err.response?.status === 429) {
        setError(
          "Too many password change requests. Please wait a few minutes and try again.",
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to update password. Please try again.");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  // حفظ معلومات الملف الشخصي
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("bio", bio.trim() || "");
    formData.append("location", location.trim() || "");
    formData.append("website", website.trim() || "");

    socialLinks.forEach((link, index) => {
      formData.append(`social_links[${index}]`, link);
    });

    selectedTags.forEach((tag, index) => {
      formData.append(`tags[${index}]`, tag.id);
    });

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    if (coverFile) {
      formData.append("cover_image", coverFile);
    }

    try {
      const response = await api.post("/profile", formData);

      if (response.data.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      setSuccess("Profile information updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      console.error("Response data:", err.response?.data);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0]?.[0];
        setError(firstError || "Failed to update profile.");
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2 text-muted hover:text-[#5CA1FC] transition-colors group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Profile</span>
        </button>
        <h1 className="gradient-title text-2xl font-bold">Edit Profile</h1>
        <div className="w-20"></div>
      </div>

      {/* Error & Success messages */}
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

      {/* ========== SECTION 1: IMAGES ========== */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ImageIcon size={20} className="text-[#5CA1FC]" />
          Profile Images
        </h2>

        {/* Avatar */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-label mb-2">
            Profile Picture
          </label>
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={avatarPreview || "/default-avatar.png"}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-panelEdge"
              />
              {avatarPreview && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-1 -right-1 p-1 bg-error rounded-full hover:bg-error/80 transition-colors"
                >
                  <X size={14} className="text-white" />
                </button>
              )}
            </div>
            <div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 hover:text-[#5CA1FC]"
              >
                <ImageIcon size={18} />
                Upload Photo
              </label>
              <p className="text-xs text-muted mt-1">JPG, PNG, GIF (max 2MB)</p>
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-label mb-2">
            Cover Image
          </label>
          <div className="relative">
            {coverPreview ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="w-full h-32 object-cover border border-panelEdge"
                />
                <button
                  type="button"
                  onClick={removeCover}
                  className="absolute top-2 right-2 p-1.5 bg-error rounded-full hover:bg-error/80 transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            ) : (
              <div className="w-full h-32 bg-panel/50 border-2 border-dashed border-panelEdge rounded-lg flex items-center justify-center hover:border-[#5CA1FC]/30 transition-colors">
                <div className="text-center">
                  <ImageIcon size={32} className="text-muted mx-auto mb-2" />
                  <p className="text-muted text-sm">No cover image</p>
                </div>
              </div>
            )}
            <div className="mt-2">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                onChange={handleCoverChange}
                className="hidden"
                id="cover-upload"
              />
              <label
                htmlFor="cover-upload"
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-2 hover:text-[#5CA1FC]"
              >
                <ImageIcon size={18} />
                {coverPreview ? "Change Cover" : "Upload Cover"}
              </label>
              <p className="text-xs text-muted mt-1">JPG, PNG (max 5MB)</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== SECTION 2: BASIC INFORMATION ========== */}
      <div className="glass-card p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <User size={20} className="text-[#5CA1FC]" />
          Basic Information
        </h2>
        <p className="text-xs text-muted mb-4">
          Current password is required for any change in this section.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium text-label mb-1">
            Current Password <span className="text-error">*</span>
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className="input-field pr-10 focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[#5CA1FC] transition-colors"
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-xs text-muted mt-1">
            Your password is hidden by default. Click the eye icon to view it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-label mb-1">
              Name <span className="text-error">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="input-field flex-1 focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
              />
              <button
                type="button"
                onClick={handleChangeName}
                disabled={savingName || !currentPassword}
                className="px-4 py-2 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg transition-colors disabled:opacity-50 text-sm whitespace-nowrap shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
              >
                {savingName ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-label mb-1">
              Username <span className="text-error">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="input-field flex-1 focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
              />
              <button
                type="button"
                onClick={handleChangeUsername}
                disabled={savingUsername || !currentPassword}
                className="px-4 py-2 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg transition-colors disabled:opacity-50 text-sm whitespace-nowrap shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
              >
                {savingUsername ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-label mb-1">
              Email <span className="text-error">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="input-field flex-1 focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
              />
              <button
                type="button"
                onClick={handleChangeEmail}
                disabled={savingEmail || !currentPassword}
                className="px-4 py-2 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg transition-colors disabled:opacity-50 text-sm whitespace-nowrap shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
              >
                {savingEmail ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>

          {/* Password Change */}
          <div>
            <label className="block text-sm font-medium text-label mb-1">
              New Password
            </label>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 8 chars)"
                  className="input-field pr-10 focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[#5CA1FC] transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={newPasswordConfirmation}
                  onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                  placeholder="Confirm new password"
                  className="input-field pr-10 focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[#5CA1FC] transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={savingPassword || !currentPassword || !newPassword}
                className="w-full px-4 py-2 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg transition-colors disabled:opacity-50 text-sm shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
              >
                {savingPassword ? (
                  <Loader2 size={16} className="animate-spin mx-auto" />
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== SECTION 3: PROFILE INFORMATION ========== */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <User size={20} className="text-[#5CA1FC]" />
          Profile Information
        </h2>
        <p className="text-xs text-muted mb-4">
          Update your bio, location, website, social links, and tags.
        </p>

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-label mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows="3"
            className="input-field resize-none focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
            maxLength={500}
          />
          <p className="text-xs text-muted mt-1">{bio.length}/500 characters</p>
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-label mb-1">
            Location
          </label>
          <div className="relative">
            <MapPin
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="input-field pl-10 focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </div>

        {/* Website */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-label mb-1">
            Website
          </label>
          <div className="relative">
            <LinkIcon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="input-field pl-10 focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
              style={{ paddingLeft: "2.5rem" }}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-label mb-1">
            Social Links
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={newSocialLink}
              onChange={(e) => setNewSocialLink(e.target.value)}
              placeholder="https://github.com/yourusername"
              className="input-field flex-1 focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
            />
            <button
              type="button"
              onClick={addSocialLink}
              className="px-4 py-2 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg transition-colors shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
            >
              <Plus size={18} />
            </button>
          </div>
          {socialLinks.length > 0 && (
            <div className="mt-2 space-y-1">
              {socialLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-panel/50 rounded-lg border border-panelEdge"
                >
                  <span className="text-sm text-muted truncate flex-1">
                    {link}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSocialLink(index)}
                    className="p-1 hover:text-error transition-colors"
                  >
                    <Trash2 size={16} className="text-muted hover:text-error" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-label mb-1">
            Tags
          </label>
          <div className="relative" ref={dropdownRef}>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-[#5CA1FC]/10 text-[#5CA1FC] rounded-full"
                  >
                    #{tag.name}
                    <button
                      type="button"
                      onClick={() => removeTag(tag.id)}
                      className="hover:text-error transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              ref={tagInputRef}
              type="text"
              value={tagSearch}
              onChange={(e) => {
                setTagSearch(e.target.value);
                setShowTagDropdown(true);
              }}
              onFocus={() => setShowTagDropdown(true)}
              placeholder="Search tags..."
              className="input-field focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
            />
            {showTagDropdown && tagSearch && filteredTags.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-panel border border-panelEdge rounded-lg shadow-panel max-h-48 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center justify-between"
                  >
                    <span>#{tag.name}</span>
                    <Plus size={14} className="text-muted" />
                  </button>
                ))}
              </div>
            )}
            {loadingTags && (
              <p className="text-xs text-muted mt-1">Loading tags...</p>
            )}
          </div>
          <p className="text-xs text-muted mt-1">
            Select tags that represent your skills and interests
          </p>
        </div>

        {/* Save Profile Button */}
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="w-full px-4 py-3 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(92,161,252,0.25)] hover:shadow-[0_8px_32px_rgba(92,161,252,0.35)]"
        >
          {savingProfile ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Profile Information
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default EditProfilePage;
