import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Bookmark,
  Eye,
  Clock,
  MessageCircle,
  ArrowLeft,
  User,
  Tag,
  Calendar,
  MoreHorizontal,
  Flag,
  X,
  Edit,
  Trash2,
  Loader2,
  Globe,
  Lock,
  Plus,
  GripVertical,
} from "lucide-react";
import api from "../services/api";
import CommentsModal from "../components/comments/CommentsModal";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ImageViewer from "../components/common/ImageViewer";

// BASE_URL بدون /api
const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

const BlogDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  // Image Viewer states
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);

  // States for interactions
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);

  // Report states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isOwner = blog?.user?.id === currentUser?.id;

  // تسجيل مشاهدة المقال (مرة واحدة لكل مقال في الجلسة)
  useEffect(() => {
    const recordView = async () => {
      const viewedKey = `blog_viewed_${id}`;
      const hasViewed = sessionStorage.getItem(viewedKey);

      if (!hasViewed) {
        try {
          await api.post("/views", {
            type: "blog",
            id: parseInt(id),
          });
          sessionStorage.setItem(viewedKey, "true");
        } catch (error) {
          console.error("Error recording view:", error);
        }
      }
    };

    recordView();
  }, [id]);

  // جلب بيانات المقال
  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blogs/${id}`);
      const blogData = response.data.data;
      setBlog(blogData);
      setIsLiked(blogData.is_liked_by_user || false);
      setLikesCount(blogData.likes_count || 0);
      setIsSaved(blogData.is_saved || false);
      setCommentsCount(blogData.comments_count || 0);
    } catch (err) {
      console.error("Error fetching blog:", err);
      setError("Failed to load blog. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      window.addEventListener("click", handleClickOutside);
      return () => window.removeEventListener("click", handleClickOutside);
    }
  }, [showMenu]);

  // جمع كل الصور من المقال (الغلاف + صور السكشنات)
  const getAllImages = () => {
    const images = [];

    // إضافة صورة الغلاف
    if (blog?.cover_image_url) {
      images.push({
        url: `${BASE_URL}${blog.cover_image_url}`,
        title: blog.title,
      });
    }

    // إضافة صور السكشنات
    if (blog?.sections) {
      blog.sections.forEach((section) => {
        if (section.image_url) {
          images.push({
            url: `${BASE_URL}${section.image_url}`,
            title: section.title || "Section image",
          });
        }
      });
    }

    return images;
  };

  // فتح الـ Image Viewer
  const openImageViewer = (index = 0) => {
    const images = getAllImages();
    if (images.length > 0) {
      setViewerImages(images);
      setViewerIndex(index);
      setViewerOpen(true);
    }
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
      await api.post(`/blogs/${id}/toggle-like`, {});
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

    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    try {
      const response = await api.post("/saves", {
        type: "blog",
        id: parseInt(id),
      });
      setIsSaved(response.data?.data?.saved || newSavedState);
    } catch (error) {
      console.error("Error saving blog:", error);
      setIsSaved(isSaved);
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
        id: parseInt(id),
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

  // حذف البلوغ بالكامل
  const handleDeleteBlog = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this blog? This action cannot be undone.",
      )
    )
      return;

    try {
      await api.delete(`/blogs/${id}`);
      alert("Blog deleted successfully.");
      navigate("/blogs");
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete blog. Please try again.");
    }
  };

  // تنسيق التاريخ
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
        <LoadingSpinner size="lg" text="Loading blog..." />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-error mb-3">{error || "Blog not found"}</p>
          <button
            onClick={() => navigate("/blogs")}
            className="px-4 py-2 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate("/blogs")}
          className="flex items-center gap-2 text-muted hover:text-[#5CA1FC] transition-colors mb-6 group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span>Back to Blogs</span>
        </button>

        {/* Cover Image - مع ImageViewer */}
        {blog.cover_image_url && (
          <div
            className="w-full rounded-xl overflow-hidden mb-6 bg-panel/50 cursor-pointer hover:opacity-95 transition-opacity"
            style={{ aspectRatio: "16/9" }}
            onClick={() => openImageViewer(0)}
          >
            <img
              src={`${BASE_URL}${blog.cover_image_url}`}
              alt={blog.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}

        {/* Title - Gradient */}
        <h1 className="gradient-title text-3xl md:text-4xl font-bold mb-4">
          {blog.title}
        </h1>

        {/* Subtitle */}
        <p className="text-muted text-lg mb-6">{blog.subtitle}</p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-panelEdge">
          <div className="flex items-center gap-4">
            {/* Author */}
            <Link
              to={`/profile/${blog.user.username}`}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src={blog.user.avatar_url}
                alt={blog.user.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-panelEdge"
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
                </div>
              </div>
            </Link>

            {/* Date */}
            <div className="flex items-center gap-1 text-sm text-muted">
              <Calendar size={14} />
              <span>{formatDate(blog.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-muted">
                <Eye size={14} />
                <span>{blog.views_count || 0} views</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted">
                <Clock size={14} />
                <span>{blog.reading_time}</span>
              </div>
            </div>

            {/* 3 Dots Menu - مع Edit/Delete للمالك فقط */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <MoreHorizontal size={18} className="text-muted" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-44 bg-panel border border-panelEdge rounded-lg shadow-panel z-10 py-1">
                  {isOwner ? (
                    // ✅ للمالك: Edit + Delete فقط
                    <>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          navigate(`/edit-blog/${id}`);
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                      >
                        <Edit size={14} /> Edit Blog
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleDeleteBlog();
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm text-error hover:bg-white/5 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Delete Blog
                      </button>
                    </>
                  ) : (
                    // ✅ للمستخدمين الآخرين: Report فقط
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

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-sm px-3 py-1 bg-[#5CA1FC]/10 text-[#5CA1FC] rounded-full hover:bg-[#5CA1FC]/20 transition-colors"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Sections (Blog Content) - مع ImageViewer للصور */}
        <div className="space-y-8 mb-8">
          {blog.sections &&
            // eslint-disable-next-line no-unused-vars
            blog.sections.map((section, index) => {
              // حساب index الصورة في مصفوفة الصور الكاملة
              const getImageIndex = () => {
                const images = getAllImages();
                return images.findIndex(
                  (img) => img.url === `${BASE_URL}${section.image_url}`,
                );
              };

              return (
                <div
                  key={section.id}
                  className="glass-card p-6 hover:border-[#5CA1FC]/20 transition-all duration-300"
                >
                  {section.title && (
                    <h2 className="text-xl font-bold text-white mb-3">
                      {section.title}
                    </h2>
                  )}
                  {section.image_url && (
                    <div
                      className="w-full rounded-lg overflow-hidden mb-4 bg-panel/50 cursor-pointer hover:opacity-95 transition-opacity"
                      style={{ aspectRatio: "16/9" }}
                      onClick={() => {
                        const idx = getImageIndex();
                        openImageViewer(idx >= 0 ? idx : 0);
                      }}
                    >
                      <img
                        src={`${BASE_URL}${section.image_url}`}
                        alt={section.title || "Section image"}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <p className="text-muted leading-relaxed">
                    {section.content}
                  </p>
                </div>
              );
            })}
        </div>

        {/* Actions Buttons */}
        <div className="flex items-center gap-6 pt-6 border-t border-panelEdge">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isLiked
                ? "text-error bg-error/10"
                : "text-muted hover:text-error hover:bg-error/10"
            }`}
          >
            <Heart size={20} className={isLiked ? "fill-error" : ""} />
            <span>{likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setIsCommentsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted hover:text-[#5CA1FC] hover:bg-[#5CA1FC]/10 transition-all duration-200"
          >
            <MessageCircle size={20} />
            <span>{commentsCount}</span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isSaved
                ? "text-[#5CA1FC] bg-[#5CA1FC]/10"
                : "text-muted hover:text-[#5CA1FC] hover:bg-[#5CA1FC]/10"
            }`}
          >
            <Bookmark size={20} className={isSaved ? "fill-[#5CA1FC]" : ""} />
          </button>
        </div>
      </div>

      {/* Image Viewer */}
      {viewerOpen && (
        <ImageViewer
          images={viewerImages.map((img) => img.url)}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}

      {/* Report Modal */}
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

      {/* Comments Modal */}
      <CommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        blogId={parseInt(id)}
        type="blog"
        onCommentAdded={handleCommentAdded}
      />
    </>
  );
};

export default BlogDetailsPage;
