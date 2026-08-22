import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Code,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Loader2,
  Globe,
  Lock,
  Tag,
} from "lucide-react";
import api from "../../services/api";
import CommentsModal from "../comments/CommentsModal";
import ImageViewer from "../common/ImageViewer";

const PostCard = ({
  post,
  onLikeUpdate,
  onCommentUpdate,
  onPostUpdate,
  onPostDelete,
  isContentOwner = false,
}) => {
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [liking, setLiking] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);
  const [saving, setSaving] = useState(false);
  const [viewRecorded, setViewRecorded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const menuRef = useRef(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody] = useState(post.body);
  const [editCode, setEditCode] = useState(post.code || "");
  const [editCodeLanguage, setEditCodeLanguage] = useState(
    post.code_language || "",
  );
  const [editIsPublished, setEditIsPublished] = useState(post.is_published);
  const [editTags, setEditTags] = useState(post.tags || []);
  const [editTagSearch, setEditTagSearch] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [showEditTagDropdown, setShowEditTagDropdown] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [editPhotos, setEditPhotos] = useState(post.photos || []);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = post.user?.id === currentUser?.id;

  // تسجيل مشاهدة البوست
  useEffect(() => {
    const recordView = async () => {
      const viewedKey = `post_viewed_${post.id}`;
      const hasViewed = sessionStorage.getItem(viewedKey);

      if (!hasViewed && !viewRecorded) {
        try {
          await api.post("/views", { type: "post", id: post.id });
          setViewRecorded(true);
          sessionStorage.setItem(viewedKey, "true");
        } catch (error) {
          console.error("Error recording view:", error);
        }
      }
    };

    recordView();
  }, [post.id, viewRecorded]);

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

  // تنسيق التاريخ
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

  // معالجة الإعجاب
  const handleLike = async () => {
    if (liking) return;
    setLiking(true);

    const newLikedState = !isLiked;
    const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1;

    setIsLiked(newLikedState);
    setLikesCount(newLikesCount);

    try {
      await api.post(`/posts/${post.id}/toggle-like`, {});
      if (onLikeUpdate) onLikeUpdate(post.id, newLikedState);
    } catch (error) {
      console.error("Like error:", error);
      setIsLiked(isLiked);
      setLikesCount(likesCount);
      alert("Failed to update like. Please try again.");
    } finally {
      setLiking(false);
    }
  };

  // معالجة الحفظ
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const response = await api.post("/saves", { type: "post", id: post.id });
      setIsSaved(response.data?.data?.saved || false);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // تحديث عدد التعليقات
  const handleCommentAdded = () => {
    const newCount = commentsCount + 1;
    setCommentsCount(newCount);
    if (onCommentUpdate) onCommentUpdate(post.id, newCount);
  };

  // حذف البوست
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${post.id}`);
      if (onPostDelete) onPostDelete(post.id);
      alert("Post deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete post. Please try again.");
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
      const response = await api.put(`/posts/${post.id}/content`, {
        title: editTitle.trim(),
        body: editBody.trim(),
        code: editCode.trim() || null,
        code_language: editCodeLanguage.trim() || null,
        is_published: editIsPublished,
        tags: editTags.map((t) => t.id),
      });

      const updatedPost = response.data.data;
      if (onPostUpdate) onPostUpdate(updatedPost);
      setIsEditing(false);
      alert("Post updated successfully!");
    } catch (error) {
      console.error("Edit error:", error);
      setEditError(error.response?.data?.message || "Failed to update post.");
    } finally {
      setEditing(false);
    }
  };

  // إضافة تاج في التعديل
  const addEditTag = (tag) => {
    if (!editTags.some((t) => t.id === tag.id)) {
      setEditTags([...editTags, tag]);
    }
    setEditTagSearch("");
    setShowEditTagDropdown(false);
  };

  // إزالة تاج في التعديل
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
      const response = await api.post(`/posts/${post.id}/photos`, formData, {
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
      await api.delete(`/posts/${post.id}/photos/${photoId}`);
      setEditPhotos(editPhotos.filter((p) => p.id !== photoId));
    } catch (error) {
      console.error("Delete photo error:", error);
      alert("Failed to delete photo.");
    }
  };

  // مودال التعديل
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
            <h2 className="text-xl font-bold text-white">Edit Post</h2>
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
              <div className="p-3 bg-error/20 border border-error/50 rounded-lg">
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
                className="input-field"
                placeholder="Post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-label mb-1">
                Body *
              </label>
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                className="input-field resize-none"
                rows="5"
                placeholder="Write your post content..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-label mb-1">
                Code (optional)
              </label>
              <textarea
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                className="input-field resize-none font-mono text-sm"
                rows="4"
                placeholder="Paste your code here..."
              />
              <input
                type="text"
                value={editCodeLanguage}
                onChange={(e) => setEditCodeLanguage(e.target.value)}
                className="input-field mt-2"
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
                  className="input-field"
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
                  <Globe size={16} /> Published
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
                  <Lock size={16} /> Draft
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
    <>
      <div className="glass-card hover:border-[#5CA1FC]/40 hover:shadow-[0_4px_20px_rgba(92,161,252,0.15)] transition-all duration-300 p-5">
        {/* Header - معلومات المستخدم */}
        <div className="flex items-start justify-between mb-3">
          <Link
            to={`/profile/${post.user.username}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src={post.user.avatar_url}
              alt={post.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-white font-semibold hover:text-[#5CA1FC] transition-colors">
                  {post.user.name}
                </h4>
                <span className="text-xs px-2 py-0.5 bg-[#5CA1FC]/15 text-[#5CA1FC] rounded-full">
                  {post.user.badge}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>@{post.user.username}</span>
                <span>•</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-muted">
              <Eye size={14} />
              <span>{post.views_count || 0}</span>
            </div>

            {isOwner && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <MoreHorizontal size={16} className="text-muted" />
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

        <Link to={`/posts/${post.id}`}>
          <h3 className="text-xl font-bold text-white mb-2 hover:text-[#5CA1FC] transition-colors cursor-pointer">
            {post.title}
          </h3>
        </Link>

        <p className="text-muted mb-3 leading-relaxed">
          {post.body && post.body.length > 200
            ? `${post.body.substring(0, 200)}...`
            : post.body}
        </p>

        {/* ✅ Code Block - مع إمكانية التوسيع والطي */}
        {post.code && (
          <div className="mb-3 bg-bg/50 rounded-lg overflow-hidden border border-panelEdge">
            <div className="flex items-center justify-between px-3 py-2 bg-panel/50 border-b border-panelEdge">
              <div className="flex items-center gap-2">
                <Code size={14} className="text-[#5CA1FC]" />
                <span className="text-xs text-muted">
                  {post.code_language || "code"}
                </span>
                <span className="text-xs text-muted">
                  • {post.code.split("\n").length} lines
                </span>
              </div>
              <button
                onClick={() => {
                  const pre = document.getElementById(`code-${post.id}`);
                  const btn = document.getElementById(`code-btn-${post.id}`);
                  if (pre) {
                    if (
                      pre.style.maxHeight === "none" ||
                      pre.style.maxHeight === ""
                    ) {
                      pre.style.maxHeight = "80px";
                      pre.style.overflowY = "auto";
                      if (btn) btn.textContent = "Expand";
                    } else {
                      pre.style.maxHeight = "none";
                      pre.style.overflowY = "visible";
                      if (btn) btn.textContent = "Collapse";
                    }
                  }
                }}
                id={`code-btn-${post.id}`}
                className="text-xs text-[#5CA1FC] hover:text-[#4A8BE8] transition-colors font-medium"
              >
                Expand
              </button>
            </div>
            <pre
              id={`code-${post.id}`}
              className="p-3 text-sm text-muted font-mono whitespace-pre-wrap break-words"
              style={{
                maxHeight: "80px",
                overflowY: "auto",
                overflowX: "hidden",
              }}
            >
              <code>{post.code}</code>
            </pre>
          </div>
        )}

        {post.photos && post.photos.length > 0 && (
          <div
            className={`grid gap-2 mb-3 ${post.photos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
          >
            {post.photos.map((photo, idx) => (
              <div
                key={photo.id || idx}
                className="relative rounded-lg overflow-hidden bg-panel/50"
                style={{ aspectRatio: "4/3" }}
              >
                <img
                  src={photo.url || photo}
                  alt={`Post ${idx + 1}`}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity hover:scale-[1.02]"
                  onClick={() => {
                    setViewerIndex(idx);
                    setViewerOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-1 bg-[#5CA1FC]/10 text-[#5CA1FC] rounded-full hover:bg-[#5CA1FC]/20 transition-colors cursor-pointer"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-around pt-3 border-t border-panelEdge">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all duration-200 ${
              isLiked
                ? "text-error bg-error/10"
                : "text-muted hover:text-error hover:bg-error/10"
            } ${liking ? "scale-90" : "scale-100"} active:scale-75`}
          >
            <Heart
              size={18}
              className={`${isLiked ? "fill-error" : ""} transition-all duration-200 ${
                liking ? "animate-pulse" : ""
              }`}
            />
            <span className="text-sm">{likesCount}</span>
          </button>

          <button
            onClick={() => setIsCommentsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-muted hover:text-[#5CA1FC] hover:bg-[#5CA1FC]/10 transition-all duration-200"
          >
            <MessageCircle size={18} />
            <span className="text-sm">{commentsCount}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all duration-200 ${
              isSaved
                ? "text-[#5CA1FC] bg-[#5CA1FC]/10"
                : "text-muted hover:text-[#5CA1FC] hover:bg-[#5CA1FC]/10"
            } ${saving ? "scale-90" : "scale-100"} active:scale-75`}
          >
            <Bookmark
              size={18}
              className={`${isSaved ? "fill-[#5CA1FC]" : ""} transition-all duration-200`}
            />
          </button>
        </div>
      </div>

      {viewerOpen && (
        <ImageViewer
          images={post.photos}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}

      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        postId={post.id}
        type="post"
        onCommentAdded={handleCommentAdded}
        isContentOwner={isContentOwner}
      />
    </>
  );
};

export default PostCard;
