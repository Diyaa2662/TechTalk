import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Code,
  Image as ImageIcon,
  X,
  Plus,
  Tag,
  Globe,
  Lock,
  Loader2,
} from "lucide-react";
import api from "../services/api";

const CreatePostPage = () => {
  const navigate = useNavigate();

  // Form states
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [code, setCode] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [photoFiles, setPhotoFiles] = useState([]); // Store files for upload after post creation

  // Tags from API
  const [allTags, setAllTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // UI states
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [error, setError] = useState("");
  const [showCodeBlock, setShowCodeBlock] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [photoUploading, setPhotoUploading] = useState(false);

  const fileInputRef = useRef(null);
  const tagInputRef = useRef(null);
  const dropdownRef = useRef(null);

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

  // تصفية التاجات حسب البحث
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

  // معالجة اختيار الصور (تخزين الملفات مؤقتاً)
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // عرض معاينة الصور
    const newPhotos = [];
    const newFiles = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        newPhotos.push(event.target.result);
        if (newPhotos.length === files.length) {
          setPhotos((prev) => [...prev, ...newPhotos]);
        }
      };
      reader.readAsDataURL(file);
      newFiles.push(file);
    });

    setPhotoFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // رفع الصور إلى endpoint /posts/:post/photos
  const uploadPhotos = async (postId) => {
    if (photoFiles.length === 0) return;

    setUploadingPhotos(true);
    let successCount = 0;

    for (const file of photoFiles) {
      const formData = new FormData();
      formData.append("photo", file);

      try {
        await api.post(`/posts/${postId}/photos`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        successCount++;
      } catch (err) {
        console.error("Error uploading photo:", err);
      }
    }

    setUploadingPhotos(false);
    if (successCount !== photoFiles.length) {
      console.warn(`Uploaded ${successCount}/${photoFiles.length} photos`);
    }
  };

  // إزالة صورة من المعاينة (قبل الرفع)
  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoFiles(photoFiles.filter((_, i) => i !== index));
  };

  // نشر البوست
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!body.trim()) {
      setError("Body is required");
      return;
    }

    setSubmitting(true);

    const payload = {
      title: title.trim(),
      body: body.trim(),
      is_published: isPublished,
      code: code.trim() || null,
      code_language: codeLanguage.trim() || null,
      tags: selectedTags.map((tag) => tag.id),
      photos: null, // سيتم رفع الصور بعد إنشاء البوست
    };

    try {
      const response = await api.post("/posts", payload);
      const newPost = response.data.data;

      // رفع الصور بعد إنشاء البوست
      if (photoFiles.length > 0) {
        await uploadPhotos(newPost.id);
      }

      navigate(`/posts/${newPost.id}`);
    } catch (err) {
      console.error("Error creating post:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create post. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // حفظ كمسودة
  const handleSaveDraft = async () => {
    setError("");

    if (!title.trim() && !body.trim()) {
      setError("Add at least a title or body to save as draft");
      return;
    }

    setSubmitting(true);

    const payload = {
      title: title.trim() || "Untitled",
      body: body.trim() || " ",
      is_published: false,
      code: code.trim() || null,
      code_language: codeLanguage.trim() || null,
      tags: selectedTags.map((tag) => tag.id),
      photos: null,
    };

    try {
      const response = await api.post("/posts", payload);
      const newPost = response.data.data;

      if (photoFiles.length > 0) {
        await uploadPhotos(newPost.id);
      }

      navigate(`/posts/${newPost.id}`);
    } catch (err) {
      console.error("Error saving draft:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save draft. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-yellowShade transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </button>
        <h1 className="text-2xl font-bold text-white">Create New Post</h1>
        <div className="w-20"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's the title of your post?"
            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent transition-all"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Content <span className="text-red-400">*</span>
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your post content here..."
            rows="8"
            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent resize-none transition-all"
          />
        </div>

        {/* Code Block Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowCodeBlock(!showCodeBlock)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-yellowShade transition-colors"
          >
            <Code size={16} />
            {showCodeBlock ? "Hide code block" : "Add code block"}
          </button>
        </div>

        {/* Code Block */}
        {showCodeBlock && (
          <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Code Language
                </label>
                <input
                  type="text"
                  value={codeLanguage}
                  onChange={(e) => setCodeLanguage(e.target.value)}
                  placeholder="e.g., javascript, python, php"
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Code Snippet
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                rows="6"
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Tags - Multi-select with dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Tags
          </label>
          <div className="relative" ref={dropdownRef}>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-yellowShade/10 text-yellowShade rounded-full"
                  >
                    #{tag.name}
                    <button
                      type="button"
                      onClick={() => removeTag(tag.id)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative">
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
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent text-sm"
              />
              <Tag
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            {showTagDropdown && tagSearch && filteredTags.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-darkShade border border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-between"
                  >
                    <span>#{tag.name}</span>
                    <Plus size={14} className="text-gray-400" />
                  </button>
                ))}
              </div>
            )}

            {loadingTags && (
              <p className="text-xs text-gray-500 mt-1">Loading tags...</p>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Search and select tags relevant to your post
          </p>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Photos
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <ImageIcon size={18} />
              {photoUploading ? "Uploading..." : "Upload Images"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>
          {photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Images will be uploaded after post creation
          </p>
        </div>

        {/* Privacy / Publication Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Privacy
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setIsPublished(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isPublished
                  ? "bg-yellowShade text-darkShade"
                  : "bg-white/10 text-gray-400 hover:text-white"
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
                  ? "bg-yellowShade text-darkShade"
                  : "bg-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <Lock size={16} />
              Draft
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {isPublished
              ? "Your post will be visible to everyone immediately."
              : "Your post will be saved as a draft. You can publish it later."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2.5 bg-yellowShade hover:bg-yellowShade/90 text-darkShade font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {uploadingPhotos ? "Uploading photos..." : "Creating..."}
              </>
            ) : (
              <>
                <Send size={18} />
                Create Post
              </>
            )}
          </button>
          {isPublished && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={submitting}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              Save as Draft
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreatePostPage;
