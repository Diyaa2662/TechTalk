/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Bookmark,
  Eye,
  Clock,
  MessageCircle,
  MoreHorizontal,
  Flag,
  X,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import api from "../services/api";
import CommentsModal from "../components/comments/CommentsModal";
import LoadingSpinner from "../components/common/LoadingSpinner";

// BASE_URL بدون /api
const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

// مكون بطاقة المقالة المنفصل
const BlogCard = ({
  blog,
  onLikeUpdate,
  onSaveUpdate,
  onBlogUpdate,
  onBlogDelete,
}) => {
  const navigate = useNavigate();
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

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = blog.user?.id === currentUser?.id;

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

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

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await api.delete(`/blogs/${blog.id}`);
      if (onBlogDelete) onBlogDelete(blog.id);
      alert("Blog deleted successfully.");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete blog. Please try again.");
    }
  };

  const handleCommentAdded = () => {
    const newCount = commentsCount + 1;
    setCommentsCount(newCount);
  };

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
      <div className="glass-card hover:border-[#5CA1FC]/40 hover:shadow-[0_4px_20px_rgba(92,161,252,0.15)] transition-all duration-300 overflow-hidden">
        {blog.cover_image_url && (
          <div
            className="w-full overflow-hidden bg-panel/50"
            style={{ aspectRatio: "16/9" }}
          >
            <img
              src={`${BASE_URL}${blog.cover_image_url}`}
              alt={blog.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <Link
              to={`/profile/${blog.user.username}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src={blog.user.avatar_url}
                alt={blog.user.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-semibold hover:text-[#5CA1FC] transition-colors">
                    {blog.user.name}
                  </h4>
                  <span className="text-xs px-2 py-0.5 bg-[#5CA1FC]/15 text-[#5CA1FC] rounded-full">
                    {blog.user.badge}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>@{blog.user.username}</span>
                  <span>•</span>
                  <span>{formatDate(blog.created_at)}</span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3 text-xs text-muted">
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{blog.views_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{blog.reading_time}</span>
                </div>
              </div>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <MoreHorizontal size={16} className="text-muted" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 mt-1 w-40 bg-panel border border-panelEdge rounded-lg shadow-panel z-10 py-1">
                    {isOwner ? (
                      <>
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            navigate(`/edit-blog/${blog.id}`);
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
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setReportModalOpen(true);
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm text-error hover:bg-white/5 flex items-center gap-2"
                      >
                        <Flag size={14} />
                        Report Blog
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Link to={`/blogs/${blog.id}`}>
            <h2 className="text-xl font-bold text-white mb-2 hover:text-[#5CA1FC] transition-colors cursor-pointer">
              {blog.title}
            </h2>
            <p className="text-muted text-sm mb-4 line-clamp-2">
              {blog.subtitle}
            </p>
          </Link>

          <div className="flex items-center gap-6 pt-3 border-t border-panelEdge">
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                isLiked
                  ? "text-error bg-error/10"
                  : "text-muted hover:text-error hover:bg-error/10"
              }`}
            >
              <Heart size={18} className={isLiked ? "fill-error" : ""} />
              <span className="text-sm">{likesCount}</span>
            </button>

            <button
              onClick={() => setIsCommentsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-muted hover:text-[#5CA1FC] hover:bg-[#5CA1FC]/10 transition-all duration-200"
            >
              <MessageCircle size={18} />
              <span className="text-sm">{commentsCount}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                isSaved
                  ? "text-[#5CA1FC] bg-[#5CA1FC]/10"
                  : "text-muted hover:text-[#5CA1FC] hover:bg-[#5CA1FC]/10"
              }`}
            >
              <Bookmark size={18} className={isSaved ? "fill-[#5CA1FC]" : ""} />
            </button>
          </div>
        </div>
      </div>

      {reportModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-panel border border-panelEdge rounded-2xl w-full max-w-md p-6 shadow-panel mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Flag size={20} className="text-error" />
                Report Blog
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
                  placeholder="Why are you reporting this blog?"
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
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [userBadge, setUserBadge] = useState("");
  const [showCreateBtn, setShowCreateBtn] = useState(true);

  const isLoadingRef = useRef(false);
  const currentPageRef = useRef(1);
  const lastScrollY = useRef(0);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/show-me");
      setUserBadge(response.data.data.badge);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

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

  useEffect(() => {
    setPage(1);
    setBlogs([]);
    setHasMore(true);
    setLoading(true);
    fetchBlogs(1, false);
  }, [fetchBlogs]);

  const loadMore = useCallback(() => {
    if (loadingMore || isLoadingRef.current || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBlogs(nextPage, true);
  }, [loadingMore, hasMore, page, fetchBlogs]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

      if (scrollPercentage > 0.8) {
        loadMore();
      }

      if (currentScrollY > 150 && currentScrollY > lastScrollY.current) {
        setShowCreateBtn(false);
      } else if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
        setShowCreateBtn(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMore]);

  const handleBlogUpdate = (updatedBlog) => {
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) =>
        blog.id === updatedBlog.id ? updatedBlog : blog,
      ),
    );
  };

  const handleBlogDelete = (blogId) => {
    setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== blogId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" text="Loading blogs..." />
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

  if (blogs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Bookmark size={48} className="text-[#5CA1FC]/30 mx-auto mb-3" />
          <p className="text-white text-lg">No blogs yet</p>
          <p className="text-muted text-sm mt-1">
            Check back later for new articles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="gradient-title text-2xl font-bold">Tech Blogs</h1>

        {userBadge === "expert" && (
          <button
            onClick={() => navigate("/create-blog")}
            className={`
              fixed top-10 right-6 z-40
              flex items-center gap-2 px-4 py-2.5 gradient-button text-white font-medium rounded-lg
              transition-all duration-400 ease-in-out
              hover:scale-[1.05] active:scale-[0.95]
              shadow-[0_4px_16px_rgba(92,161,252,0.25)] hover:shadow-[0_8px_32px_rgba(92,161,252,0.35)]
              ${showCreateBtn ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-20 pointer-events-none"}
            `}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Create Blog</span>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {blogs.map((blog) => (
          <BlogCard
            key={blog.id}
            blog={blog}
            onBlogUpdate={handleBlogUpdate}
            onBlogDelete={handleBlogDelete}
          />
        ))}
      </div>

      {loadingMore && (
        <div className="flex justify-center my-6">
          <LoadingSpinner size="md" text={null} />
        </div>
      )}

      {!hasMore && blogs.length > 0 && (
        <p className="text-center text-muted text-sm py-6">
          You've seen all blogs! 🎉
        </p>
      )}
    </div>
  );
};

export default BlogsPage;
