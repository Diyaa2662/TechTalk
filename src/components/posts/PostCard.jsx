import { useState, useEffect } from "react";
import { Heart, MessageCircle, Bookmark, Code, Eye } from "lucide-react";
import api from "../../services/api";
import CommentsModal from "../comments/CommentsModal";

const PostCard = ({ post, onLikeUpdate, onCommentUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [liking, setLiking] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewRecorded, setViewRecorded] = useState(false);

  // تسجيل مشاهدة البوست (مرة واحدة فقط)
  useEffect(() => {
    const recordView = async () => {
      // نتحقق إذا كان البوست تمت مشاهدته قبل هيك في هذه الجلسة
      const viewedKey = `post_viewed_${post.id}`;
      const hasViewed = sessionStorage.getItem(viewedKey);

      if (!hasViewed && !viewRecorded) {
        try {
          const response = await api.post("/views", {
            type: "post",
            id: post.id,
          });
          console.log("View recorded:", response.data);
          setViewRecorded(true);
          sessionStorage.setItem(viewedKey, "true");
        } catch (error) {
          console.error("Error recording view:", error);
        }
      }
    };

    recordView();
  }, [post.id, viewRecorded]);

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
      const response = await api.post("/saves", {
        type: "post",
        id: post.id,
      });

      if (response.data?.data?.saved) {
        setIsSaved(true);
      } else {
        setIsSaved(false);
      }

      console.log("Save response:", response.data);
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // تحديث عدد التعليقات عند إضافة تعليق جديد
  const handleCommentAdded = () => {
    const newCount = commentsCount + 1;
    setCommentsCount(newCount);
    if (onCommentUpdate) onCommentUpdate(post.id, newCount);
  };

  return (
    <>
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-yellowShade/30 transition-all duration-200">
        {/* Header - معلومات المستخدم */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <img
              src={post.user.avatar_url}
              alt={post.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-white font-semibold hover:text-yellowShade transition-colors cursor-pointer">
                  {post.user.name}
                </h4>
                <span className="text-xs px-2 py-0.5 bg-yellowShade/20 text-yellowShade rounded-full">
                  {post.user.badge}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>@{post.user.username}</span>
                <span>•</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Views count */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Eye size={14} />
            <span>{post.views_count || 0}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-2 hover:text-yellowShade transition-colors cursor-pointer">
          {post.title}
        </h3>

        {/* Body */}
        <p className="text-gray-300 mb-3 leading-relaxed">
          {post.body && post.body.length > 200
            ? `${post.body.substring(0, 200)}...`
            : post.body}
        </p>

        {/* Code Block */}
        {post.code && (
          <div className="mb-3 bg-darkShade/50 rounded-lg overflow-hidden border border-gray-700">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50 border-b border-gray-700">
              <span className="text-xs text-gray-400">
                {post.code_language || "code"}
              </span>
              <button className="text-gray-400 hover:text-yellowShade transition-colors">
                <Code size={14} />
              </button>
            </div>
            <pre className="p-3 text-sm text-gray-300 overflow-x-auto">
              <code>{post.code}</code>
            </pre>
          </div>
        )}

        {/* Photos */}
        {post.photos && post.photos.length > 0 && (
          <div
            className={`grid gap-2 mb-3 ${post.photos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}
          >
            {post.photos.map((photo, idx) => (
              <img
                key={idx}
                src={photo}
                alt={`Post ${idx + 1}`}
                className="rounded-lg w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              />
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-2 py-1 bg-yellowShade/10 text-yellowShade rounded-full hover:bg-yellowShade/20 transition-colors cursor-pointer"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Actions Buttons */}
        <div className="flex items-center justify-around pt-3 border-t border-gray-700">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all duration-200 ${
              isLiked
                ? "text-red-500 bg-red-500/10"
                : "text-gray-400 hover:text-red-500 hover:bg-red-500/10"
            } ${liking ? "scale-90" : "scale-100"} active:scale-75`}
          >
            <Heart
              size={18}
              className={`${isLiked ? "fill-red-500" : ""} transition-all duration-200 ${
                liking ? "animate-pulse" : ""
              }`}
            />
            <span className="text-sm">{likesCount}</span>
          </button>

          {/* Comment Button - فتح المودال */}
          <button
            onClick={() => setIsCommentsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-200"
          >
            <MessageCircle size={18} />
            <span className="text-sm">{commentsCount}</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all duration-200 ${
              isSaved
                ? "text-yellowShade bg-yellowShade/10"
                : "text-gray-400 hover:text-yellowShade hover:bg-yellowShade/10"
            } ${saving ? "scale-90" : "scale-100"} active:scale-75`}
          >
            <Bookmark
              size={18}
              className={`${isSaved ? "fill-yellowShade" : ""} transition-all duration-200`}
            />
          </button>
        </div>
      </div>

      {/* Comments Modal */}
      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        postId={post.id}
        onCommentAdded={handleCommentAdded}
      />
    </>
  );
};

export default PostCard;
