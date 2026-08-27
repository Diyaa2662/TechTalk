/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
  X,
  Plus,
  Tag,
  Globe,
  Lock,
  Loader2,
  GripVertical,
  Trash2,
} from "lucide-react";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

// BASE_URL بدون /api
const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const CreateBlogPage = () => {
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  // Tags
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearch, setTagSearch] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);

  // Sections - بدون صور
  const [sections, setSections] = useState([
    { title: "", content: "", order: 1 },
  ]);

  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const tagInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // جلب التاجات من API
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
    fetchTags();
  }, []);

  // إغلاق القائمة عند الضغط خارجها
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

  // تصفية التاجات
  const filteredTags = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !selectedTags.some((selected) => selected.id === tag.id),
  );

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

  // معالجة رفع صورة الغلاف
  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCoverImage(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverPreview(event.target.result);
    };
    reader.readAsDataURL(file);
    setError("");
  };

  // إزالة صورة الغلاف
  const removeCover = () => {
    setCoverImage(null);
    setCoverPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // إضافة سكشن جديد
  const addSection = () => {
    setSections([
      ...sections,
      { title: "", content: "", order: sections.length + 1 },
    ]);
  };

  // إزالة سكشن
  const removeSection = (index) => {
    if (sections.length <= 1) {
      setError("Blog must have at least one section.");
      return;
    }
    const newSections = sections.filter((_, i) => i !== index);
    newSections.forEach((section, idx) => {
      section.order = idx + 1;
    });
    setSections(newSections);
    setError("");
  };

  // تحديث سكشن
  const updateSection = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = value;
    setSections(newSections);
  };

  // نشر المقال
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!subtitle.trim()) {
      setError("Subtitle is required.");
      return;
    }

    for (let i = 0; i < sections.length; i++) {
      if (!sections[i].content.trim()) {
        setError(`Section ${i + 1} content is required.`);
        return;
      }
    }

    setSubmitting(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("subtitle", subtitle.trim());
    formData.append("is_published", isPublished ? 1 : 0);

    if (coverImage) {
      formData.append("cover_image", coverImage);
    }

    if (selectedTags.length > 0) {
      selectedTags.forEach((tag) => {
        formData.append("tags[]", tag.id);
      });
    }

    // ✅ إضافة السكشنات بدون صور
    sections.forEach((section, index) => {
      const order = index + 1;
      formData.append(`sections[${index}][title]`, section.title || "");
      formData.append(`sections[${index}][content]`, section.content);
      formData.append(`sections[${index}][order]`, order);
    });

    console.log("===== FormData Debug =====");
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(pair[0], `[File: ${pair[1].name}, ${pair[1].size} bytes]`);
      } else {
        console.log(pair[0], pair[1]);
      }
    }
    console.log("==========================");

    try {
      const response = await api.post("/blogs", formData);
      console.log("✅ Success response:", response.data);
      const newBlog = response.data.data;
      navigate(`/blogs/${newBlog.id}`);
    } catch (err) {
      console.error("❌ Error creating blog:", err);

      if (err.response) {
        console.error("🔴 Response status:", err.response.status);
        console.error("🔴 Response data:", err.response.data);
        console.error("🔴 Response errors:", err.response.data?.errors);
        console.error("🔴 Full response:", err.response);
      }

      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        let errorMessages = [];
        Object.keys(errors).forEach((key) => {
          if (Array.isArray(errors[key])) {
            errors[key].forEach((msg) => {
              errorMessages.push(`${key}: ${msg}`);
            });
          } else {
            errorMessages.push(`${key}: ${errors[key]}`);
          }
        });
        if (errorMessages.length > 0) {
          setError(errorMessages[0]);
        } else {
          setError("Validation failed. Please check all fields.");
        }
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to create blog. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/blogs")}
          className="flex items-center gap-2 text-muted hover:text-[#5CA1FC] transition-colors group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Blogs</span>
        </button>
        <h1 className="gradient-title text-2xl font-bold">Create New Blog</h1>
        <div className="w-20"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error message */}
        {error && (
          <div className="p-3 bg-error/20 border border-error/30 rounded-lg slide-up">
            <p className="text-error text-sm text-center">{error}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-label mb-1">
            Title <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's the title of your blog?"
            className="input-field focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-label mb-1">
            Subtitle <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="A short description of your blog"
            className="input-field focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-label mb-1">
            Cover Image
          </label>
          <div className="relative">
            {coverPreview ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={coverPreview}
                  alt="Cover"
                  className="w-full h-48 object-cover border border-panelEdge"
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
                  <p className="text-muted text-sm">Upload cover image</p>
                  <p className="text-label text-xs">JPG, PNG (max 2MB)</p>
                </div>
              </div>
            )}
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
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
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
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
            Select tags relevant to your blog
          </p>
        </div>

        {/* Sections - بدون صور */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-label">
              Sections <span className="text-error">* (min 1)</span>
            </label>
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-1 text-sm text-[#5CA1FC] hover:text-[#4A8BE8] transition-colors"
            >
              <Plus size={16} />
              Add Section
            </button>
          </div>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <div
                key={index}
                className="glass-card p-4 hover:border-[#5CA1FC]/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-white font-medium">
                    Section {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="p-1 hover:text-error transition-colors"
                  >
                    <Trash2 size={16} className="text-muted hover:text-error" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-label mb-1">
                      Section Title (optional)
                    </label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) =>
                        updateSection(index, "title", e.target.value)
                      }
                      placeholder="Section title"
                      className="input-field focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-label mb-1">
                      Section Content <span className="text-error">*</span>
                    </label>
                    <textarea
                      value={section.content}
                      onChange={(e) =>
                        updateSection(index, "content", e.target.value)
                      }
                      placeholder="Write your section content..."
                      rows="4"
                      className="input-field resize-none focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                    />
                  </div>

                  {/* ❌ تم إزالة قسم رفع الصورة */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div>
          <label className="block text-sm font-medium text-label mb-2">
            Privacy
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsPublished(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isPublished
                  ? "bg-[#5CA1FC] text-white shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
                  : "bg-white/5 text-muted hover:text-white"
              }`}
            >
              <Globe size={16} />
              Publish
            </button>
            <button
              type="button"
              onClick={() => setIsPublished(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                !isPublished
                  ? "bg-[#5CA1FC] text-white shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
                  : "bg-white/5 text-muted hover:text-white"
              }`}
            >
              <Lock size={16} />
              Draft
            </button>
          </div>
          <p className="text-xs text-muted mt-2">
            {isPublished
              ? "Your blog will be visible to everyone immediately."
              : "Your blog will be saved as a draft. You can publish it later."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-panelEdge">
          <button
            type="button"
            onClick={() => navigate("/blogs")}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-3 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(92,161,252,0.25)] hover:shadow-[0_8px_32px_rgba(92,161,252,0.35)]"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Send size={18} />
                Create Blog
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlogPage;
