import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Code,
  Eye,
  User,
  MoreHorizontal,
  Flag,
  X,
} from "lucide-react";
import api from "../services/api";
import CommentsModal from "../components/comments/CommentsModal";
import LoadingSpinner from "../components/common/LoadingSpinner";

// مكون بطاقة البوست المنفصل
const PostCard = ({ post, onLikeUpdate, onCommentUpdate, onSaveUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [liking, setLiking] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);
  const [saving, setSaving] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);

  const menuRef = useRef(null);

  // تسجيل مشاهدة البوست (مرة واحدة لكل بوست في الجلسة)
  useEffect(() => {
    const recordView = async () => {
      const viewedKey = `post_viewed_${post.id}`;
      const hasViewed = sessionStorage.getItem(viewedKey);

      if (!hasViewed) {
        try {
          await api.post("/views", {
            type: "post",
            id: post.id,
          });
          sessionStorage.setItem(viewedKey, "true");
        } catch (error) {
          console.error("Error recording view:", error);
        }
      }
    };

    recordView();
  }, [post.id]);

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

  // معالجة الحفظ / إلغاء الحفظ
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      let response;
      if (newSavedState) {
        response = await api.post("/saves", {
          type: "post",
          id: post.id,
        });
      } else {
        response = await api.delete("/saves", {
          data: {
            type: "post",
            id: post.id,
          },
        });
      }
      const saved = response.data?.data?.saved || newSavedState;
      setIsSaved(saved);
      if (onSaveUpdate) onSaveUpdate(post.id, saved);
    } catch (error) {
      console.error("Save/Unsave error:", error);
      setIsSaved(isSaved);
      alert("Failed to update save status. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // معالجة التبليغ
  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert("Please provide a reason for reporting.");
      return;
    }

    setReporting(true);
    try {
      await api.post("/reports", {
        kind: "post",
        id: post.id,
        reason: reportReason,
        details: reportDetails || null,
      });
      alert("Post reported successfully. Our team will review it.");
      setReportModalOpen(false);
      setReportReason("");
      setReportDetails("");
    } catch (error) {
      console.error("Report error:", error);
      alert("Failed to report post. Please try again.");
    } finally {
      setReporting(false);
    }
  };

  // تحديث عدد التعليقات
  const handleCommentAdded = () => {
    const newCount = commentsCount + 1;
    setCommentsCount(newCount);
    if (onCommentUpdate) onCommentUpdate(post.id, newCount);
  };

  return (
    <>
      <div className="glass-card-hover p-5">
        {/* Header - معلومات المستخدم */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={post.user.avatar_url}
              alt={post.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-white font-semibold hover:text-accent transition-colors">
                  {post.user.name}
                </h4>
                <span className="text-xs px-2 py-0.5 bg-accent/15 text-accent rounded-full">
                  {post.user.badge}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>@{post.user.username}</span>
                <span>•</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Views count */}
            <div className="flex items-center gap-1 text-xs text-muted">
              <Eye size={14} />
              <span>{post.views_count || 0}</span>
            </div>

            {/* 3 Dots Menu */}
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
                      setReportModalOpen(true);
                    }}
                    className="w-full px-3 py-1.5 text-left text-sm text-error hover:bg-white/5 flex items-center gap-2"
                  >
                    <Flag size={14} />
                    Report Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <Link to={`/posts/${post.id}`}>
          <h3 className="text-xl font-bold text-white mb-2 hover:text-accent transition-colors cursor-pointer">
            {post.title}
          </h3>
        </Link>

        {/* Body */}
        <p className="text-muted mb-3 leading-relaxed">
          {post.body && post.body.length > 200
            ? `${post.body.substring(0, 200)}...`
            : post.body}
        </p>

        {/* Code Block */}
        {post.code && (
          <div className="mb-3 bg-bg/50 rounded-lg overflow-hidden border border-panelEdge">
            <div className="flex items-center justify-between px-3 py-2 bg-panel/50 border-b border-panelEdge">
              <span className="text-xs text-label">
                {post.code_language || "code"}
              </span>
              <button className="text-muted hover:text-accent transition-colors">
                <Code size={14} />
              </button>
            </div>
            <pre className="p-3 text-sm text-muted overflow-x-auto">
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
                key={photo.id || idx}
                src={photo.url}
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
                className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full hover:bg-accent/20 transition-colors cursor-pointer"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Actions Buttons */}
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
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-all duration-200"
          >
            <MessageCircle size={18} />
            <span className="text-sm">{commentsCount}</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all duration-200 ${
              isSaved
                ? "text-accent bg-accent/10"
                : "text-muted hover:text-accent hover:bg-accent/10"
            } ${saving ? "scale-90" : "scale-100"} active:scale-75`}
          >
            <Bookmark
              size={18}
              className={`${isSaved ? "fill-accent" : ""} transition-all duration-200`}
            />
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-panel border border-panelEdge rounded-2xl w-full max-w-md p-6 shadow-panel mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Flag size={20} className="text-error" />
                Report Post
              </h3>
              <button
                onClick={() => {
                  setReportModalOpen(false);
                  setReportReason("");
                  setReportDetails("");
                }}
                className="p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={20} className="text-muted hover:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-label mb-1">
                  Reason <span className="text-error">*</span>
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Why are you reporting this post?"
                  rows="3"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-label mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Any additional information..."
                  rows="2"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setReportModalOpen(false);
                  setReportReason("");
                  setReportDetails("");
                }}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={reporting}
                className="flex-1 px-4 py-2 bg-error hover:bg-error/80 text-white rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reporting ? "Reporting..." : "Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        postId={post.id}
        type="post"
        onCommentAdded={handleCommentAdded}
      />
    </>
  );
};

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isLoadingRef = useRef(false);
  // eslint-disable-next-line no-unused-vars
  const currentPageRef = useRef(1);

  // جلب البوستات
  const fetchPosts = useCallback(async (pageNum, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      console.log(`Fetching page ${pageNum}...`);
      const response = await api.get(`/posts?page=${pageNum}&per_page=20`);
      const newPosts = response.data.data;
      const pagination = response.data.pagination;

      console.log(
        `Got ${newPosts.length} posts, has_more: ${pagination.has_more_pages}`,
      );

      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(pagination.has_more_pages === true);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please refresh the page.");
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, []);

  // تحميل أول صفحة
  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    setLoading(true);
    fetchPosts(1, false);
  }, [fetchPosts]);

  // تحميل المزيد عند التمرير
  const loadMore = useCallback(() => {
    console.log(
      "loadMore called, hasMore:",
      hasMore,
      "loadingMore:",
      loadingMore,
      "isLoadingRef:",
      isLoadingRef.current,
    );

    if (loadingMore || isLoadingRef.current || !hasMore) {
      console.log("Skipping loadMore - conditions not met");
      return;
    }

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    console.log(`Loading more: page ${nextPage}`);
    fetchPosts(nextPage, true);
  }, [loadingMore, hasMore, page, fetchPosts]);

  // كشف التمرير لأسفل الصفحة
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

      if (scrollPercentage > 0.8) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  // تحديث حالة الإعجاب
  const handleLikeUpdate = (postId, isLiked) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              is_liked_by_user: isLiked,
              likes_count: isLiked
                ? post.likes_count + 1
                : post.likes_count - 1,
            }
          : post,
      ),
    );
  };

  // تحديث حالة التعليقات
  const handleCommentUpdate = (postId, newCount) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, comments_count: newCount } : post,
      ),
    );
  };

  // تحديث حالة الحفظ
  const handleSaveUpdate = (postId, isSaved) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, is_saved: isSaved } : post,
      ),
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" text="Loading posts..." />
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
            className="px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-white text-lg">No posts yet</p>
          <p className="text-muted text-sm mt-1">
            Follow more developers to see their posts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="gradient-title text-2xl font-bold mb-6">
        Recommended Feed
      </h1>

      <div className="space-y-5">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLikeUpdate={handleLikeUpdate}
            onCommentUpdate={handleCommentUpdate}
            onSaveUpdate={handleSaveUpdate}
          />
        ))}
      </div>

      {loadingMore && (
        <div className="flex justify-center my-6">
          <LoadingSpinner size="md" text={null} />
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-muted text-sm py-6">
          You've seen all posts! 🎉
        </p>
      )}
    </div>
  );
};

export default HomePage;
