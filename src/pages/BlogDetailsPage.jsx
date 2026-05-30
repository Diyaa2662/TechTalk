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
} from "lucide-react";
import api from "../services/api";
import CommentsModal from "../components/comments/CommentsModal";

const BlogDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // States for interactions
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);

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
  }, [id]);

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

  // تحديث عدد التعليقات
  const handleCommentAdded = () => {
    const newCount = commentsCount + 1;
    setCommentsCount(newCount);
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
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-red-400 mb-3">{error || "Blog not found"}</p>
          <button
            onClick={() => navigate("/blogs")}
            className="px-4 py-2 bg-yellowShade text-darkShade rounded-lg font-semibold hover:bg-yellowShade/90"
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
          className="flex items-center gap-2 text-gray-400 hover:text-yellowShade transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Blogs</span>
        </button>

        {/* Cover Image */}
        {blog.cover_image_url && (
          <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden mb-6">
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {blog.title}
        </h1>

        {/* Subtitle */}
        <p className="text-gray-400 text-lg mb-6">{blog.subtitle}</p>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            {/* Author */}
            <div className="flex items-center gap-3">
              <img
                src={blog.user.avatar_url}
                alt={blog.user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-semibold">{blog.user.name}</h4>
                  <span className="text-xs px-2 py-0.5 bg-yellowShade/20 text-yellowShade rounded-full">
                    {blog.user.badge}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>@{blog.user.username}</span>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar size={14} />
              <span>{formatDate(blog.created_at)}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Eye size={14} />
              <span>{blog.views_count || 0} views</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock size={14} />
              <span>{blog.reading_time}</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {blog.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-sm px-3 py-1 bg-yellowShade/10 text-yellowShade rounded-full"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Sections (Blog Content) */}
        <div className="space-y-8 mb-8">
          {blog.sections &&
            blog.sections.map((section) => (
              <div
                key={section.id}
                className="bg-white/5 rounded-xl p-6 border border-white/10"
              >
                {section.title && (
                  <h2 className="text-xl font-bold text-white mb-3">
                    {section.title}
                  </h2>
                )}
                {section.image_url && (
                  <img
                    src={section.image_url}
                    alt={section.title}
                    className="w-full rounded-lg mb-4"
                  />
                )}
                <p className="text-gray-300 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
        </div>

        {/* Actions Buttons */}
        <div className="flex items-center gap-6 pt-6 border-t border-gray-700">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isLiked
                ? "text-red-500 bg-red-500/10"
                : "text-gray-400 hover:text-red-500 hover:bg-red-500/10"
            }`}
          >
            <Heart size={20} className={isLiked ? "fill-red-500" : ""} />
            <span>{likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setIsCommentsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all duration-200"
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
                ? "text-yellowShade bg-yellowShade/10"
                : "text-gray-400 hover:text-yellowShade hover:bg-yellowShade/10"
            }`}
          >
            <Bookmark size={20} className={isSaved ? "fill-yellowShade" : ""} />
          </button>
        </div>
      </div>

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
