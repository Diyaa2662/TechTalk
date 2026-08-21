/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Bookmark,
  Eye,
  MessageCircle,
  ArrowLeft,
  Calendar,
  Code,
  Send,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  User,
  X,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
  Globe,
  Lock,
  Tag,
} from "lucide-react";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";
import CommentsModal from "../components/comments/CommentsModal";

const PostDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [liking, setLiking] = useState(false);

  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editCodeLanguage, setEditCodeLanguage] = useState("");
  const [editIsPublished, setEditIsPublished] = useState(true);
  const [editTags, setEditTags] = useState([]);
  const [editTagSearch, setEditTagSearch] = useState("");
  const [allTags, setAllTags] = useState([]);
  const [showEditTagDropdown, setShowEditTagDropdown] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [editPhotos, setEditPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser?.id;
  const isOwner = post?.user?.id === currentUser?.id;

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

  // عند تحميل البوست، نحدد قيم التعديل
  useEffect(() => {
    if (post) {
      setEditTitle(post.title);
      setEditBody(post.body);
      setEditCode(post.code || "");
      setEditCodeLanguage(post.code_language || "");
      setEditIsPublished(post.is_published);
      setEditTags(post.tags || []);
      setEditPhotos(post.photos || []);
      setCommentsCount(post.comments_count || 0);
    }
  }, [post]);

  // تسجيل مشاهدة البوست
  useEffect(() => {
    const recordView = async () => {
      const viewedKey = `post_viewed_${id}`;
      const hasViewed = sessionStorage.getItem(viewedKey);
      if (!hasViewed) {
        try {
          await api.post("/views", { type: "post", id: parseInt(id) });
          sessionStorage.setItem(viewedKey, "true");
        } catch (error) {
          console.error("Error recording view:", error);
        }
      }
    };
    recordView();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${id}`);
      const postData = response.data.data;
      setPost(postData);
      setIsLiked(postData.is_liked_by_user || false);
      setLikesCount(postData.likes_count || 0);
      setIsSaved(postData.is_saved || false);
      setCommentsCount(postData.comments_count || 0);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError("Failed to load post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  // حذف البوست
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/posts/${id}`);
      alert("Post deleted successfully.");
      navigate("/");
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
      const response = await api.put(`/posts/${id}/content`, {
        title: editTitle.trim(),
        body: editBody.trim(),
        code: editCode.trim() || null,
        code_language: editCodeLanguage.trim() || null,
        is_published: editIsPublished,
        tags: editTags.map((t) => t.id),
      });

      const updatedPost = response.data.data;
      setPost(updatedPost);
      setIsEditing(false);
      alert("Post updated successfully!");
      fetchPost();
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
      const response = await api.post(`/posts/${id}/photos`, formData, {
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
      await api.delete(`/posts/${id}/photos/${photoId}`);
      setEditPhotos(editPhotos.filter((p) => p.id !== photoId));
    } catch (error) {
      console.error("Delete photo error:", error);
      alert("Failed to delete photo.");
    }
  };

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    const newLikedState = !isLiked;
    const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1;
    setIsLiked(newLikedState);
    setLikesCount(newLikesCount);
    try {
      await api.post(`/posts/${id}/toggle-like`, {});
    } catch (error) {
      setIsLiked(isLiked);
      setLikesCount(likesCount);
    } finally {
      setLiking(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);
    try {
      const response = await api.post("/saves", {
        type: "post",
        id: parseInt(id),
      });
      setIsSaved(response.data?.data?.saved || newSavedState);
    } catch (error) {
      setIsSaved(isSaved);
    } finally {
      setSaving(false);
    }
  };

  const handleCommentAdded = () => {
    setCommentsCount((prev) => prev + 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" text="Loading post..." />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-error mb-3">{error || "Post not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

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
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-accent/10 text-accent rounded-full"
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
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-panelEdge flex items-center justify-center cursor-pointer hover:border-accent/50 transition-colors">
                  <div className="flex flex-col items-center">
                    {uploadingPhoto ? (
                      <Loader2 size={24} className="text-accent animate-spin" />
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
                      ? "bg-accent text-white shadow-accent-sm"
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
                      ? "bg-accent text-white shadow-accent-sm"
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
              className="flex-1 px-4 py-2 bg-accent hover:bg-accentHover text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
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
    <div className="max-w-4xl mx-auto py-6 px-4">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-muted hover:text-accent mb-6"
      >
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="glass-card p-6 mb-8">
        <h1 className="gradient-title text-3xl md:text-4xl font-bold mb-4">
          {post.title}
        </h1>
        <p className="text-muted text-lg mb-6 leading-relaxed">{post.body}</p>

        {/* Photos */}
        {post.photos && post.photos.length > 0 && (
          <div className="mb-6">
            <div
              className={`grid gap-3 ${post.photos.length === 1 ? "grid-cols-1" : "grid-cols-2 md:grid-cols-3"}`}
            >
              {post.photos.map((photo, idx) => (
                <img
                  key={photo.id || idx}
                  src={photo.url}
                  alt={`Post image ${idx + 1}`}
                  className="rounded-xl w-full h-48 md:h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                />
              ))}
            </div>
          </div>
        )}

        {post.code && (
          <div className="mb-6 bg-bg/50 rounded-lg overflow-hidden border border-panelEdge">
            <div className="flex items-center justify-between px-3 py-2 bg-panel/50 border-b border-panelEdge">
              <div className="flex items-center gap-2">
                <Code size={14} className="text-accent" />
                <span className="text-xs text-muted">
                  {post.code_language || "code"}
                </span>
              </div>
            </div>
            <pre className="p-4 text-sm text-muted overflow-x-auto font-mono">
              <code>{post.code}</code>
            </pre>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-panelEdge">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={post.user.avatar_url}
                alt={post.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-semibold">{post.user.name}</h4>
                  <span className="text-xs px-2 py-0.5 bg-accent/15 text-accent rounded-full">
                    {post.user.badge}
                  </span>
                </div>
                <div className="text-xs text-muted">@{post.user.username}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted">
              <Calendar size={14} />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-muted">
              <Eye size={14} />
              <span>{post.views_count || 0} views</span>
            </div>

            {/* 3 Dots Menu - للمالك فقط */}
            {isOwner && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <MoreHorizontal size={18} className="text-muted" />
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
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isLiked
                ? "text-error bg-error/10"
                : "text-muted hover:text-error hover:bg-error/10"
            }`}
          >
            <Heart size={20} className={isLiked ? "fill-error" : ""} />
            <span>{likesCount}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isSaved
                ? "text-accent bg-accent/10"
                : "text-muted hover:text-accent hover:bg-accent/10"
            }`}
          >
            <Bookmark size={20} className={isSaved ? "fill-accent" : ""} />
          </button>
          <button
            onClick={() => setIsCommentsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-all duration-200"
          >
            <MessageCircle size={20} />
            <span>{commentsCount}</span>
          </button>
        </div>
      </div>

      {/* Comments Modal - استخدام المكون المركزي */}
      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        postId={parseInt(id)}
        type="post"
        onCommentAdded={handleCommentAdded}
        isContentOwner={isOwner}
      />
    </div>
  );
};

export default PostDetailsPage;
