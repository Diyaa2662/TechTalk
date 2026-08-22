/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  X,
  Plus,
  Tag,
  Globe,
  Lock,
  Loader2,
  Trash2,
  Edit,
} from "lucide-react";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

// BASE_URL بدون /api
const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const EditBlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Blog data
  const [blog, setBlog] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");
  const [removeCover, setRemoveCover] = useState(false);

  // Tags
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearch, setTagSearch] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);

  // Sections
  const [sections, setSections] = useState([]);
  const [editingSection, setEditingSection] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSection, setNewSection] = useState({
    title: "",
    content: "",
    order: 1,
    image: null,
  });
  const [sectionLoading, setSectionLoading] = useState(false);

  const tagInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  // جلب بيانات البلوغ
  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blogs/${id}`);
      const data = response.data.data;
      setBlog(data);
      setTitle(data.title || "");
      setSubtitle(data.subtitle || "");
      setIsPublished(
        data.is_published !== undefined ? data.is_published : true,
      );
      setSelectedTags(data.tags || []);
      setSections(data.sections || []);
      setCoverPreview(data.cover_image_url || "");
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Failed to load blog. Please try again.");
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
    fetchBlog();
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // إغلاق قائمة التاجات
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
    setRemoveCover(false);
    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverPreview(event.target.result);
    };
    reader.readAsDataURL(file);
    setError("");
  };

  // إزالة صورة الغلاف
  const handleRemoveCover = () => {
    setCoverImage(null);
    setCoverPreview("");
    setRemoveCover(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // إضافة سكشن
  const addSection = () => {
    setSections([
      ...sections,
      { title: "", content: "", image: null, order: sections.length + 1 },
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

  // رفع صورة سكشن
  const handleSectionImageChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const newSections = [...sections];
    newSections[index].image = file;
    setSections(newSections);
    setError("");
  };

  // إزالة صورة سكشن
  const removeSectionImage = (index) => {
    const newSections = [...sections];
    newSections[index].image = null;
    setSections(newSections);
  };

  // إضافة سكشن جديد عبر API
  const handleAddSectionAPI = async () => {
    if (!newSection.content.trim()) {
      alert("Section content is required.");
      return;
    }

    setSectionLoading(true);
    const formData = new FormData();
    formData.append("title", newSection.title || "");
    formData.append("content", newSection.content);
    formData.append("order", sections.length + 1);
    if (newSection.image) {
      formData.append("image", newSection.image);
    }

    try {
      const response = await api.post(`/blogs/${id}/sections`, formData);
      setSections([...sections, response.data.data]);
      setNewSection({
        title: "",
        content: "",
        order: sections.length + 2,
        image: null,
      });
      setShowAddSection(false);
      alert("Section added successfully!");
    } catch (error) {
      console.error("Error adding section:", error);
      alert("Failed to add section. Please try again.");
    } finally {
      setSectionLoading(false);
    }
  };

  // حذف سكشن عبر API
  const handleDeleteSectionAPI = async (sectionId) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    try {
      await api.delete(`/blogs/${id}/sections/${sectionId}`);
      setSections(sections.filter((s) => s.id !== sectionId));
      alert("Section deleted successfully.");
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Failed to delete section. Please try again.");
    }
  };

  // تعديل سكشن عبر API
  const handleEditSectionAPI = async (sectionId, updatedData) => {
    setSectionLoading(true);
    const formData = new FormData();
    if (updatedData.title !== undefined)
      formData.append("title", updatedData.title || "");
    if (updatedData.content !== undefined)
      formData.append("content", updatedData.content);
    if (updatedData.order !== undefined)
      formData.append("order", updatedData.order);
    if (updatedData.image) formData.append("image", updatedData.image);
    if (updatedData.remove_image) formData.append("remove_image", "true");

    try {
      const response = await api.put(
        `/blogs/${id}/sections/${sectionId}`,
        formData,
      );
      setSections(
        sections.map((s) => (s.id === sectionId ? response.data.data : s)),
      );
      setEditingSection(null);
      alert("Section updated successfully!");
    } catch (error) {
      console.error("Error editing section:", error);
      alert("Failed to update section. Please try again.");
    } finally {
      setSectionLoading(false);
    }
  };

  // حفظ التعديلات
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("subtitle", subtitle.trim() || "");
    formData.append("is_published", isPublished ? 1 : 0);

    if (selectedTags.length > 0) {
      selectedTags.forEach((tag) => {
        formData.append("tags[]", tag.id);
      });
    }

    if (coverImage) {
      formData.append("cover_image", coverImage);
    }

    if (removeCover) {
      formData.append("remove_cover_image", "true");
    }

    console.log("===== Edit FormData =====");
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(pair[0], `[File: ${pair[1].name}, ${pair[1].size} bytes]`);
      } else {
        console.log(pair[0], pair[1]);
      }
    }
    console.log("========================");

    try {
      const response = await api.post(`/updateblog/${id}`, formData);
      console.log("✅ Update response:", response.data);

      if (response.data.data) {
        setSuccess("Blog updated successfully!");
        setTimeout(() => {
          navigate(`/blogs/${id}`);
        }, 1500);
      }
    } catch (err) {
      console.error("❌ Error updating blog:", err);

      if (err.response) {
        console.error("🔴 Response status:", err.response.status);
        console.error("🔴 Response data:", err.response.data);
        console.error("🔴 Response errors:", err.response.data?.errors);

        if (err.response.data?.errors) {
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
        } else if (err.response.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("Failed to update blog. Please try again.");
        }
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" text="Loading blog..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(`/blogs/${id}`)}
          className="flex items-center gap-2 text-muted hover:text-[#5CA1FC] transition-colors group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Blog</span>
        </button>
        <h1 className="gradient-title text-2xl font-bold">Edit Blog</h1>
        <div className="w-20"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error & Success messages */}
        {error && (
          <div className="p-3 bg-error/20 border border-error/30 rounded-lg slide-up">
            <p className="text-error text-sm text-center">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-3 bg-success/20 border border-success/30 rounded-lg slide-up">
            <p className="text-success text-sm text-center">{success}</p>
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
            placeholder="Blog title"
            className="input-field focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
          />
        </div>

        {/* Subtitle */}
        <div>
          <label className="block text-sm font-medium text-label mb-1">
            Subtitle
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Blog subtitle"
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
                  key={coverPreview || "no-cover"}
                  src={
                    coverPreview?.startsWith("data:")
                      ? coverPreview
                      : `${BASE_URL}${coverPreview}`
                  }
                  alt="Cover"
                  className="w-full h-48 object-cover border border-panelEdge"
                />
                <button
                  type="button"
                  onClick={handleRemoveCover}
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
              <Globe size={16} /> Published
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
              <Lock size={16} /> Draft
            </button>
          </div>
        </div>

        {/* Sections */}
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
              <Plus size={16} /> Add Section
            </button>
          </div>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <div
                key={section.id || index}
                className="glass-card p-4 hover:border-[#5CA1FC]/20 transition-all duration-300"
              >
                {editingSection === section.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-label mb-1">
                        Section Title
                      </label>
                      <input
                        type="text"
                        defaultValue={section.title}
                        placeholder="Section title"
                        className="input-field focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                        ref={(el) => {
                          if (el) {
                            el.value = section.title || "";
                            el.onchange = (e) => {
                              section._editTitle = e.target.value;
                            };
                          }
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-label mb-1">
                        Section Content *
                      </label>
                      <textarea
                        defaultValue={section.content}
                        placeholder="Section content"
                        rows="3"
                        className="input-field resize-none focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                        ref={(el) => {
                          if (el) {
                            el.value = section.content;
                            el.onchange = (e) => {
                              section._editContent = e.target.value;
                            };
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const updatedData = {
                            title:
                              section._editTitle !== undefined
                                ? section._editTitle
                                : section.title,
                            content:
                              section._editContent !== undefined
                                ? section._editContent
                                : section.content,
                          };
                          handleEditSectionAPI(section.id, updatedData);
                        }}
                        disabled={sectionLoading}
                        className="px-3 py-1 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg text-sm shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingSection(null)}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSectionAPI(section.id)}
                        className="px-3 py-1 bg-error/20 hover:bg-error/30 text-error rounded-lg text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {section.title && (
                        <h4 className="text-white font-medium">
                          {section.title}
                        </h4>
                      )}
                      <p className="text-muted text-sm line-clamp-2">
                        {section.content}
                      </p>
                      <span className="text-xs text-muted">
                        Order: {section.order || index + 1}
                      </span>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <button
                        type="button"
                        onClick={() => setEditingSection(section.id)}
                        className="p-1 hover:text-[#5CA1FC] transition-colors"
                      >
                        <Edit
                          size={14}
                          className="text-muted hover:text-[#5CA1FC]"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSectionAPI(section.id)}
                        className="p-1 hover:text-error transition-colors"
                      >
                        <Trash2
                          size={14}
                          className="text-muted hover:text-error"
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Section Form */}
          {showAddSection && (
            <div className="mt-4 p-4 glass-card border border-[#5CA1FC]/10">
              <h4 className="text-white font-medium mb-3">New Section</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) =>
                    setNewSection({ ...newSection, title: e.target.value })
                  }
                  placeholder="Section title (optional)"
                  className="input-field focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                />
                <textarea
                  value={newSection.content}
                  onChange={(e) =>
                    setNewSection({ ...newSection, content: e.target.value })
                  }
                  placeholder="Section content *"
                  rows="3"
                  className="input-field resize-none focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setNewSection({ ...newSection, image: file });
                  }}
                  className="hidden"
                  id="new-section-image"
                />
                <label
                  htmlFor="new-section-image"
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-sm hover:text-[#5CA1FC]"
                >
                  <ImageIcon size={14} /> Add Image
                </label>
                {newSection.image && (
                  <div className="flex items-center gap-2 text-xs text-[#5CA1FC]">
                    <span>Image attached</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewSection({ ...newSection, image: null })
                      }
                      className="text-error"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddSectionAPI}
                    disabled={sectionLoading}
                    className="px-4 py-1.5 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg text-sm shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
                  >
                    {sectionLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Add Section"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSection(false)}
                    className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {!showAddSection && (
            <button
              type="button"
              onClick={() => setShowAddSection(true)}
              className="mt-3 text-sm text-[#5CA1FC] hover:text-[#4A8BE8] transition-colors flex items-center gap-1"
            >
              <Plus size={16} /> Add New Section
            </button>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4 border-t border-panelEdge">
          <button
            type="button"
            onClick={() => navigate(`/blogs/${id}`)}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-3 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(92,161,252,0.25)] hover:shadow-[0_8px_32px_rgba(92,161,252,0.35)]"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBlogPage;
