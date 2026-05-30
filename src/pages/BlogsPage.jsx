import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Bookmark,
  Eye,
  Clock,
  MessageCircle,
  MoreHorizontal,
  Flag,
  X,
} from "lucide-react";
import api from "../services/api";
import CommentsModal from "../components/comments/CommentsModal";

// مكون بطاقة المقالة المنفصل
const BlogCard = ({ blog, onLikeUpdate, onSaveUpdate }) => {
  const [isLiked, setIsLiked] = useState(blog.is_liked_by_user || false);
  const [likesCount, setLikesCount] = useState(blog.likes_count || 0);
  const [isSaved, setIsSaved] = useState(blog.is_saved || false);
  const [saving, setSaving] = useState(false);
  const [liking, setLiking] = useState(false);
  const [commentsCount, setCommentsCount] = useState(blog.comments_count || 0);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);

  const menuRef = useRef(null);

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

  // معالجة التبليغ
  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert("Please provide a reason for reporting.");
      return;
    }

    setReporting(true);
    try {
      await api.post("/reports", {
        kind: "blog",
        id: blog.id,
        reason: reportReason,
        details: reportDetails || null,
      });
      alert("Blog reported successfully. Our team will review it.");
      setReportModalOpen(false);
      setReportReason("");
      setReportDetails("");
    } catch (error) {
      console.error("Report error:", error);
      alert("Failed to report blog. Please try again.");
    } finally {
      setReporting(false);
    }
  };

  // تحديث عدد التعليقات
  const handleCommentAdded = () => {
    const newCount = commentsCount + 1;
    setCommentsCount(newCount);
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
    <>
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

            <div className="flex items-center gap-2">
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

              {/* 3 Dots Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <MoreHorizontal size={16} className="text-gray-400" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-40 bg-darkShade border border-gray-600 rounded-lg shadow-lg z-10 py-1">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setReportModalOpen(true);
                      }}
                      className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
                    >
                      <Flag size={14} />
                      Report Blog
                    </button>
                  </div>
                )}
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

            {/* Comment Button */}
            <button
              onClick={() => setIsCommentsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-200"
            >
              <MessageCircle size={18} />
              <span className="text-sm">{commentsCount}</span>
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
              <Bookmark
                size={18}
                className={isSaved ? "fill-yellowShade" : ""}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-darkShade border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Flag size={20} className="text-red-400" />
                Report Blog
              </h3>
              <button
                onClick={() => {
                  setReportModalOpen(false);
                  setReportReason("");
                  setReportDetails("");
                }}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={20} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Why are you reporting this blog?"
                  rows="3"
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Any additional information..."
                  rows="2"
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent text-sm"
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
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={reporting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reporting ? "Reporting..." : "Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal - للمقالات */}
      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        blogId={blog.id}
        type="blog"
        onCommentAdded={handleCommentAdded}
      />
    </>
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
  // eslint-disable-next-line no-unused-vars
  const currentPageRef = useRef(1);

  // جلب المقالات
  const fetchBlogs = useCallback(async (pageNum, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      const response = await api.get(`/blogs?page=${pageNum}&per_page=15`);
      const newBlogs = response.data.data;
      const pagination = response.data.pagination;

      if (append) {
        setBlogs((prev) => [...prev, ...newBlogs]);
      } else {
        setBlogs(newBlogs);
      }

      setHasMore(pagination.has_more_pages === true);
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
