import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Code, Eye, User } from "lucide-react";
import api from "../services/api";
import CommentsModal from "../components/comments/CommentsModal";

// مكون بطاقة البوست المنفصل
const PostCard = ({ post, onLikeUpdate, onCommentUpdate, onSaveUpdate }) => {
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [liking, setLiking] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(post.is_saved || false);
  const [saving, setSaving] = useState(false);

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

  // تحديث عدد التعليقات
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
            <img
              src={post.user.avatar_url}
              alt={post.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-white font-semibold hover:text-yellowShade transition-colors">
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

        {/* Title - رابط لصفحة التفاصيل */}
        <Link to={`/posts/${post.id}`}>
          <h3 className="text-xl font-bold text-white mb-2 hover:text-yellowShade transition-colors cursor-pointer">
            {post.title}
          </h3>
        </Link>

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

        {/* Photos - تعديل مهم: photos هي مصفوفة من الكائنات {id, url, sort_order} */}
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

          {/* Comment Button */}
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

  // منع عدة طلبات متزامنة
  const isLoadingRef = useRef(false);
  const currentPageRef = useRef(1);

  // جلب البوستات
  const fetchPosts = useCallback(async (pageNum, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      const response = await api.get(`/posts?page=${pageNum}&per_page=20`);

      const newPosts = response.data.data;

      if (newPosts.length === 0) {
        setHasMore(false);
      } else if (newPosts.length < 20) {
        if (append) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        setHasMore(false);
      } else {
        if (append) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        setHasMore(true);
      }
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
    currentPageRef.current = 1;
    setPage(1);
    setPosts([]);
    setHasMore(true);
    setLoading(true);
    fetchPosts(1, false);
  }, [fetchPosts]);

  // تحميل المزيد عند التمرير
  const loadMore = useCallback(() => {
    if (loadingMore || isLoadingRef.current || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    currentPageRef.current = nextPage;
    fetchPosts(nextPage, true);
  }, [loadingMore, hasMore, page, fetchPosts]);

  // كشف التمرير لأسفل الصفحة
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 500) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  // تحديث حالة الإعجاب في قائمة البوستات
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

  // تحديث حالة التعليقات في قائمة البوستات
  const handleCommentUpdate = (postId, newCount) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, comments_count: newCount } : post,
      ),
    );
  };

  // تحديث حالة الحفظ في قائمة البوستات
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-red-400 mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-yellowShade text-darkShade rounded-lg font-semibold hover:bg-yellowShade/90"
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
          <p className="text-gray-400 text-lg">No posts yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Follow more developers to see their posts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Recommended Feed</h1>

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
          <div className="w-8 h-8 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="text-center text-gray-500 text-sm py-6">
          You've seen all posts! 🎉
        </p>
      )}
    </div>
  );
};

export default HomePage;
