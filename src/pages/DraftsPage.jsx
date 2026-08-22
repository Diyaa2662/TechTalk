/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  BookOpen,
  Eye,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  Lock,
  X,
  Loader2,
  Code,
  MessageCircle,
  Heart,
} from "lucide-react";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import CommentsModal from "../components/comments/CommentsModal";

// مكون بطاقة المسودة (للبوستات والمقالات)
const DraftCard = ({ item, type, onUpdate, onDelete }) => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const menuRef = useRef(null);

  // Edit states for posts
  const [editTitle, setEditTitle] = useState(item.title);
  const [editBody, setEditBody] = useState(item.body || item.subtitle || "");
  const [editCode, setEditCode] = useState(item.code || "");
  const [editCodeLanguage, setEditCodeLanguage] = useState(
    item.code_language || "",
  );
  const [editIsPublished, setEditIsPublished] = useState(false);
  const [editTags, setEditTags] = useState(item.tags || []);
  const [editTagSearch, setEditTagSearch] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [showEditTagDropdown, setShowEditTagDropdown] = useState(false);
  const [editPhotos, setEditPhotos] = useState(item.photos || []);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = item.user?.id === currentUser?.id;

  // جلب التاجات للتعديل
  useEffect(() => {
    if (isEditing) {
      const fetchTags = async () => {
        try {
          const response = await api.get("/tags");
          setAllTags(response.data.data || []);
        } catch (error) {
          console.error("Error fetching tags:", error);
        }
      };
      fetchTags();
    }
  }, [isEditing]);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // نشر البوست
  const handlePublish = async () => {
    if (!confirm(`Publish this ${type}?`)) return;

    try {
      if (type === "post") {
        await api.put(`/posts/${item.id}/content`, {
          title: item.title,
          body: item.body,
          code: item.code || null,
          code_language: item.code_language || null,
          is_published: true,
          tags: (item.tags || []).map((t) => t.id),
        });
      } else {
        await api.put(`/blogs/${item.id}/content`, {
          title: item.title,
          subtitle: item.subtitle || null,
          is_published: true,
        });
      }
      alert(`${type} published successfully!`);
      if (onUpdate) onUpdate(item.id);
    } catch (error) {
      console.error("Publish error:", error);
      alert("Failed to publish. Please try again.");
    }
  };

  // حذف المسودة
  const handleDelete = async () => {
    if (!confirm(`Delete this draft ${type}?`)) return;
    try {
      await api.delete(`/${type}s/${item.id}`);
      if (onDelete) onDelete(item.id);
      alert(`${type} deleted successfully.`);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete. Please try again.");
    }
  };

  // معالجة تعديل البوست
  const handleEditSubmit = async () => {
    if (!editTitle.trim() || !editBody.trim()) {
      setEditError("Title and body are required.");
      return;
    }

    setEditing(true);
    setEditError("");

    try {
      let response;
      if (type === "post") {
        response = await api.put(`/posts/${item.id}/content`, {
          title: editTitle.trim(),
          body: editBody.trim(),
          code: editCode.trim() || null,
          code_language: editCodeLanguage.trim() || null,
          is_published: editIsPublished,
          tags: editTags.map((t) => t.id),
        });
      } else {
        response = await api.put(`/blogs/${item.id}/content`, {
          title: editTitle.trim(),
          subtitle: editBody.trim() || null,
          is_published: editIsPublished,
        });
      }

      const updated = response.data.data;
      if (onUpdate) onUpdate(updated);
      setIsEditing(false);
      alert(`${type} updated successfully!`);
    } catch (error) {
      console.error("Edit error:", error);
      setEditError(error.response?.data?.message || "Failed to update.");
    } finally {
      setEditing(false);
    }
  };

  // إضافة تاج
  const addEditTag = (tag) => {
    if (!editTags.some((t) => t.id === tag.id)) {
      setEditTags([...editTags, tag]);
    }
    setEditTagSearch("");
    setShowEditTagDropdown(false);
  };

  // إزالة تاج
  const removeEditTag = (tagId) => {
    setEditTags(editTags.filter((t) => t.id !== tagId));
  };

  // رفع صورة
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await api.post(`/posts/${item.id}/photos`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditPhotos([...editPhotos, response.data.data]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // حذف صورة
  const handleDeletePhoto = async (photoId) => {
    if (!confirm("Delete this photo?")) return;
    try {
      await api.delete(`/posts/${item.id}/photos/${photoId}`);
      setEditPhotos(editPhotos.filter((p) => p.id !== photoId));
    } catch (error) {
      console.error("Delete photo error:", error);
      alert("Failed to delete photo.");
    }
  };

  // مودال التعديل (للبوستات)
  if (isEditing) {
    const filteredEditTags = allTags.filter(
      (tag) =>
        tag.name.toLowerCase().includes(editTagSearch.toLowerCase()) &&
        !editTags.some((t) => t.id === tag.id),
    );

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-panel border border-panelEdge rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-panel">
          <div className="flex items-center justify-between p-4 border-b border-panelEdge">
            <h2 className="text-xl font-bold text-white">
              Edit Draft {type === "post" ? "Post" : "Blog"}
            </h2>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditError("");
              }}
              className="p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={20} className="text-muted hover:text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {editError && (
              <div className="p-3 bg-error/20 border border-error/30 rounded-lg slide-up">
                <p className="text-error text-sm text-center">{editError}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-label mb-1">
                Title *
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input-field focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                placeholder="Title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-label mb-1">
                {type === "post" ? "Body *" : "Subtitle *"}
              </label>
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="input-field resize-none focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                rows={type === "post" ? 5 : 3}
                placeholder={
                  type === "post"
                    ? "Write your post content..."
                    : "Blog subtitle"
                }
              />
            </div>

            {type === "post" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-label mb-1">
                    Code (optional)
                  </label>
                  <textarea
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="input-field resize-none font-mono text-sm focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                    rows="4"
                    placeholder="Paste your code here..."
                  />
                  <input
                    type="text"
                    value={editCodeLanguage}
                    onChange={(e) => setEditCodeLanguage(e.target.value)}
                    className="input-field mt-2 focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                    placeholder="Code language (e.g., javascript, python)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-label mb-1">
                    Tags
                  </label>
                  <div className="relative">
                    {editTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {editTags.map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-[#5CA1FC]/10 text-[#5CA1FC] rounded-full"
                          >
                            #{tag.name}
                            <button
                              type="button"
                              onClick={() => removeEditTag(tag.id)}
                              className="hover:text-error transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <input
                      type="text"
                      value={editTagSearch}
                      onChange={(e) => {
                        setEditTagSearch(e.target.value);
                        setShowEditTagDropdown(true);
                      }}
                      onFocus={() => setShowEditTagDropdown(true)}
                      placeholder="Search tags..."
                      className="input-field focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                    />
                    {showEditTagDropdown &&
                      editTagSearch &&
                      filteredEditTags.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-panel border border-panelEdge rounded-lg shadow-panel max-h-48 overflow-y-auto">
                          {filteredEditTags.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => addEditTag(tag)}
                              className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center justify-between"
                            >
                              <span>#{tag.name}</span>
                              <span className="text-xs text-muted">Add</span>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-label mb-2">
                    Photos
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative group w-20 h-20 rounded-lg overflow-hidden border border-panelEdge"
                      >
                        <img
                          src={photo.url}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute top-1 right-1 p-1 bg-error/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      </div>
                    ))}
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-panelEdge flex items-center justify-center cursor-pointer hover:border-[#5CA1FC]/50 transition-colors">
                      <div className="flex flex-col items-center">
                        {uploadingPhoto ? (
                          <Loader2
                            size={24}
                            className="text-[#5CA1FC] animate-spin"
                          />
                        ) : (
                          <>
                            <span className="text-2xl text-muted">+</span>
                            <span className="text-xs text-muted">Add</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        disabled={uploadingPhoto}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-label mb-2">
                Privacy
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setEditIsPublished(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    editIsPublished
                      ? "bg-[#5CA1FC] text-white shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
                      : "bg-white/5 text-muted hover:text-white"
                  }`}
                >
                  <Globe size={16} /> Publish
                </button>
                <button
                  type="button"
                  onClick={() => setEditIsPublished(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    !editIsPublished
                      ? "bg-[#5CA1FC] text-white shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
                      : "bg-white/5 text-muted hover:text-white"
                  }`}
                >
                  <Lock size={16} /> Keep Draft
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-4 border-t border-panelEdge">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditError("");
              }}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSubmit}
              disabled={editing}
              className="flex-1 px-4 py-2 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
            >
              {editing ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card hover:border-[#5CA1FC]/40 hover:shadow-[0_4px_20px_rgba(92,161,252,0.15)] transition-all duration-300 p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full flex items-center gap-1">
            <Lock size={10} />
            Draft
          </span>
          <span className="text-xs px-2 py-0.5 bg-[#5CA1FC]/15 text-[#5CA1FC] rounded-full">
            {type === "post" ? "POST" : "BLOG"}
          </span>
          {item.is_modified && (
            <span className="text-xs text-muted">(edited)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-muted">
            <Eye size={12} />
            <span>{item.views_count || 0}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted">
            <Calendar size={12} />
            <span>{formatDate(item.created_at)}</span>
          </div>

          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <MoreHorizontal size={14} className="text-muted" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-panel border border-panelEdge rounded-lg shadow-panel z-10 py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditing(true);
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handlePublish();
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm text-green-400 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Globe size={14} /> Publish
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm text-error hover:bg-white/5 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title - رابط لصفحة التفاصيل */}
      <Link to={type === "post" ? `/posts/${item.id}` : `/blogs/${item.id}`}>
        <h3 className="text-lg font-bold text-white mb-1 hover:text-[#5CA1FC] transition-colors cursor-pointer">
          {item.title}
        </h3>
      </Link>

      {/* Body/Subtitle */}
      <p className="text-muted text-sm line-clamp-2 mb-2">
        {type === "post" ? item.body : item.subtitle}
      </p>

      {/* Code for posts */}
      {type === "post" && item.code && (
        <div className="mb-2 bg-bg/50 rounded-lg overflow-hidden border border-panelEdge">
          <div className="flex items-center justify-between px-3 py-1.5 bg-panel/50 border-b border-panelEdge">
            <span className="text-xs text-muted">
              {item.code_language || "code"}
            </span>
            <Code size={12} className="text-muted" />
          </div>
          <pre className="p-2 text-xs text-muted overflow-x-auto">
            <code>{item.code}</code>
          </pre>
        </div>
      )}

      {/* Photos for posts */}
      {type === "post" && item.photos && item.photos.length > 0 && (
        <div className="grid grid-cols-4 gap-1 mb-2">
          {item.photos.slice(0, 4).map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              alt=""
              className="w-full h-16 object-cover rounded"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-panelEdge">
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-1 text-xs text-[#5CA1FC] hover:text-[#4A8BE8] transition-colors"
        >
          <Edit size={12} />
          Edit
        </button>
        <button
          onClick={handlePublish}
          className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
        >
          <Globe size={12} />
          Publish
        </button>
      </div>
    </div>
  );
};

const DraftsPage = () => {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isLoadingRef = useRef(false);

  // جلب المسودات
  const fetchDrafts = async (pageNum = 1, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setLoading(true);

    try {
      const [postsRes, blogsRes] = await Promise.all([
        api.get(`/posts/drafts?page=${pageNum}&per_page=10`),
        api.get(`/blogs/drafts?page=${pageNum}&per_page=10`),
      ]);

      const posts = postsRes.data.data || [];
      const blogs = blogsRes.data.data || [];

      const postsWithType = posts.map((p) => ({ ...p, __type: "post" }));
      const blogsWithType = blogs.map((b) => ({ ...b, __type: "blog" }));

      let allDrafts = [...postsWithType, ...blogsWithType];
      allDrafts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (append) {
        setDrafts((prev) => [...prev, ...allDrafts]);
      } else {
        setDrafts(allDrafts);
      }

      const postsPagination = postsRes.data.pagination;
      const blogsPagination = blogsRes.data.pagination;
      setHasMore(
        postsPagination?.has_more_pages || blogsPagination?.has_more_pages,
      );
    } catch (err) {
      console.error("Error fetching drafts:", err);
      setError("Failed to load drafts. Please refresh the page.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    fetchDrafts(1, false);
  }, []);

  // تحميل المزيد
  const loadMore = () => {
    if (loadingMore || isLoadingRef.current || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchDrafts(nextPage, true);
  };

  // كشف التمرير
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 500
      ) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore]);

  // تحديث مسودة
  const handleDraftUpdate = (updatedItem) => {
    setDrafts((prev) =>
      prev.map((draft) =>
        draft.id === updatedItem.id && draft.__type === updatedItem.__type
          ? { ...updatedItem, __type: draft.__type }
          : draft,
      ),
    );
  };

  // حذف مسودة
  const handleDraftDelete = (draftId) => {
    setDrafts((prev) => prev.filter((draft) => draft.id !== draftId));
  };

  // تصفية حسب النوع
  const filteredDrafts = drafts.filter((draft) => {
    if (activeTab === "all") return true;
    return draft.__type === activeTab;
  });

  if (loading && drafts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" text="Loading drafts..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-error mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="gradient-title text-2xl font-bold flex items-center gap-2">
          <FileText size={28} className="text-[#5CA1FC]" />
          Drafts
        </h1>
        <button
          onClick={() => navigate("/profile")}
          className="text-sm text-muted hover:text-[#5CA1FC] transition-colors"
        >
          ← Back to Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-panelEdge mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === "all"
              ? "text-[#5CA1FC]"
              : "text-muted hover:text-white"
          }`}
        >
          All
          {activeTab === "all" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5CA1FC]"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("post")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === "post"
              ? "text-[#5CA1FC]"
              : "text-muted hover:text-white"
          }`}
        >
          Posts
          {activeTab === "post" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5CA1FC]"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("blog")}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === "blog"
              ? "text-[#5CA1FC]"
              : "text-muted hover:text-white"
          }`}
        >
          Blogs
          {activeTab === "blog" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5CA1FC]"></div>
          )}
        </button>
      </div>

      {/* Drafts List */}
      {filteredDrafts.length === 0 ? (
        <div className="text-center py-12 glass-card">
          <FileText size={48} className="text-[#5CA1FC]/30 mx-auto mb-3" />
          <p className="text-muted text-lg">No drafts yet</p>
          <p className="text-label text-sm mt-1">
            Drafts you save will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDrafts.map((draft) => (
            <DraftCard
              key={`${draft.__type}-${draft.id}`}
              item={draft}
              type={draft.__type}
              onUpdate={handleDraftUpdate}
              onDelete={handleDraftDelete}
            />
          ))}
        </div>
      )}

      {loadingMore && (
        <div className="flex justify-center my-6">
          <LoadingSpinner size="md" text={null} />
        </div>
      )}

      {!hasMore && filteredDrafts.length > 0 && (
        <p className="text-center text-muted text-sm py-6">
          You've seen all drafts! 🎉
        </p>
      )}
    </div>
  );
};

export default DraftsPage;
