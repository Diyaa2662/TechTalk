import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, Bookmark, Eye, Clock, User } from "lucide-react";
import api from "../services/api";

// مكون بطاقة المقالة المنفصل (يحتوي على useStates الخاصة به)
const BlogCard = ({ blog, onLikeUpdate, onSaveUpdate }) => {
  const [isLiked, setIsLiked] = useState(blog.is_liked_by_user || false);
  const [likesCount, setLikesCount] = useState(blog.likes_count || 0);
  const [isSaved, setIsSaved] = useState(blog.is_saved || false);
  const [saving, setSaving] = useState(false);
  const [liking, setLiking] = useState(false);

  // معالجة الإعجاب
  const handleLike = async () => {
    if (liking) return;
    setLiking(true);

    const newLikedState = !isLiked;
    const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1;

    setIsLiked(newLikedState);
    setLikesCount(newLikesCount);

    try {
      await api.post(`/blogs/${blog.id}/toggle-like`, {});
      if (onLikeUpdate) onLikeUpdate(blog.id, newLikedState);
    } catch (error) {
      console.error("Error toggling like:", error);
      setIsLiked(isLiked);
      setLikesCount(likesCount);
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
        type: "blog",
        id: blog.id,
      });
      const newSavedState = response.data?.data?.saved || !isSaved;
      setIsSaved(newSavedState);
      if (onSaveUpdate) onSaveUpdate(blog.id, newSavedState);
    } catch (error) {
      console.error("Error saving blog:", error);
    } finally {
      setSaving(false);
    }
  };

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

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-yellowShade/30 transition-all duration-200">
      {/* Cover Image */}
      {blog.cover_image_url && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={blog.cover_image_url}
            alt={blog.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header - معلومات الكاتب */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <img
              src={blog.user.avatar_url}
              alt={blog.user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-white font-semibold hover:text-yellowShade transition-colors">
                  {blog.user.name}
                </h4>
                <span className="text-xs px-2 py-0.5 bg-yellowShade/20 text-yellowShade rounded-full">
                  {blog.user.badge}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>@{blog.user.username}</span>
                <span>•</span>
                <span>{formatDate(blog.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Views و Reading Time */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{blog.views_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{blog.reading_time}</span>
            </div>
          </div>
        </div>

        {/* Title & Subtitle - رابط للمقال */}
        <Link to={`/blogs/${blog.id}`}>
          <h2 className="text-xl font-bold text-white mb-2 hover:text-yellowShade transition-colors cursor-pointer">
            {blog.title}
          </h2>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {blog.subtitle}
          </p>
        </Link>

        {/* Actions Buttons */}
        <div className="flex items-center gap-6 pt-3 border-t border-gray-700">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isLiked
                ? "text-red-500 bg-red-500/10"
                : "text-gray-400 hover:text-red-500 hover:bg-red-500/10"
            }`}
          >
            <Heart size={18} className={isLiked ? "fill-red-500" : ""} />
            <span className="text-sm">{likesCount}</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isSaved
                ? "text-yellowShade bg-yellowShade/10"
                : "text-gray-400 hover:text-yellowShade hover:bg-yellowShade/10"
            }`}
          >
            <Bookmark size={18} className={isSaved ? "fill-yellowShade" : ""} />
          </button>
        </div>
      </div>
    </div>
  );
};

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isLoadingRef = useRef(false);
  const currentPageRef = useRef(1);

  // جلب المقالات
  const fetchBlogs = useCallback(async (pageNum, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      const response = await api.get(`/blogs?page=${pageNum}&per_page=15`);

      const newBlogs = response.data.data;

      if (newBlogs.length === 0) {
        setHasMore(false);
      } else if (newBlogs.length < 15) {
        if (append) {
          setBlogs((prev) => [...prev, ...newBlogs]);
        } else {
          setBlogs(newBlogs);
        }
        setHasMore(false);
      } else {
        if (append) {
          setBlogs((prev) => [...prev, ...newBlogs]);
        } else {
          setBlogs(newBlogs);
        }
        setHasMore(true);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blogs. Please refresh the page.");
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
    setBlogs([]);
    setHasMore(true);
    setLoading(true);
    fetchBlogs(1, false);
  }, [fetchBlogs]);

  // تحميل المزيد عند التمرير
  const loadMore = useCallback(() => {
    if (loadingMore || isLoadingRef.current || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    currentPageRef.current = nextPage;
    fetchBlogs(nextPage, true);
  }, [loadingMore, hasMore, page, fetchBlogs]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading blogs...</p>
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

  if (blogs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-gray-400 text-lg">No blogs yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Check back later for new articles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Tech Blogs</h1>

      <div className="space-y-6">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>

      {loadingMore && (
        <div className="flex justify-center my-6">
          <div className="w-8 h-8 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
        </div>
      )}

      {!hasMore && blogs.length > 0 && (
        <p className="text-center text-gray-500 text-sm py-6">
          You've seen all blogs! 🎉
        </p>
      )}
    </div>
  );
};

export default BlogsPage;
