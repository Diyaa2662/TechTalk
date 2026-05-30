/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
} from "lucide-react";
import api from "../services/api";

// مكون إضافة كود للتعليق - يظهر في منتصف الشاشة باستخدام Portal
const CodeModal = ({
  isOpen,
  onClose,
  onSave,
  initialCode = "",
  initialLanguage = "",
}) => {
  const [codeContent, setCodeContent] = useState(initialCode);
  const [codeLanguage, setCodeLanguage] = useState(initialLanguage);

  useEffect(() => {
    if (isOpen) {
      setCodeContent(initialCode);
      setCodeLanguage(initialLanguage);
    }
  }, [isOpen, initialCode, initialLanguage]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-darkShade border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Code size={20} className="text-yellowShade" />
            Add Code to Comment
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-gray-400 hover:text-white" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Code Language
            </label>
            <input
              type="text"
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
              placeholder="e.g., javascript, python, php"
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Code
            </label>
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              placeholder="Paste your code here..."
              className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent font-mono text-sm"
              rows="6"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(codeContent, codeLanguage)}
            className="flex-1 px-4 py-2 bg-yellowShade hover:bg-yellowShade/90 text-darkShade font-semibold rounded-lg transition-all duration-200"
          >
            Attach Code
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

// مكون التعليق المنفصل
const CommentItem = ({
  comment,
  postId,
  currentUserId,
  onCommentUpdate,
  onCommentDelete,
}) => {
  const [isLiked, setIsLiked] = useState(comment.is_liked_by_user || false);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
  const [isDisliked, setIsDisliked] = useState(
    comment.is_disliked_by_user || false,
  );
  const [dislikesCount, setDislikesCount] = useState(
    comment.dislikes_count || 0,
  );
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyCode, setReplyCode] = useState(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.body);
  const [editCode, setEditCode] = useState(
    comment.code
      ? { content: comment.code, language: comment.code_language }
      : null,
  );
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [pendingCode, setPendingCode] = useState(null);
  const menuRef = useRef(null);
  const editTextareaRef = useRef(null);

  const isOwner = Number(comment.user_id) === currentUserId;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setShowMenu(false);
    };
    if (showMenu) window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [showMenu]);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await api.post(`/comments/${comment.id}/like`, {});
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
        return;
      }
      if (isDisliked) {
        await api.post(`/comments/${comment.id}/dislike`, {});
        setIsDisliked(false);
        setDislikesCount((prev) => Math.max(0, prev - 1));
      }
      await api.post(`/comments/${comment.id}/like`, {});
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDislike = async () => {
    try {
      if (isDisliked) {
        await api.post(`/comments/${comment.id}/dislike`, {});
        setIsDisliked(false);
        setDislikesCount((prev) => Math.max(0, prev - 1));
        return;
      }
      if (isLiked) {
        await api.post(`/comments/${comment.id}/like`, {});
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      }
      await api.post(`/comments/${comment.id}/dislike`, {});
      setIsDisliked(true);
      setDislikesCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error toggling dislike:", error);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() && !replyCode?.content) return;
    setSubmittingReply(true);
    try {
      const response = await api.post("/comments", {
        body: replyContent || " ",
        post_id: postId,
        parent_id: comment.id,
        code: replyCode?.content || null,
        code_language: replyCode?.language || null,
      });
      if (onCommentUpdate) onCommentUpdate(response.data.data);
      setReplyContent("");
      setReplyCode(null);
      setShowReplyInput(false);
    } catch (error) {
      console.error("Error adding reply:", error);
      alert("Failed to add reply.");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim() && !editCode?.content) return;
    try {
      const response = await api.post(`/comments/${comment.id}`, {
        body: editContent || " ",
        code: editCode?.content || null,
        code_language: editCode?.language || null,
      });
      if (onCommentUpdate) onCommentUpdate(response.data.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing comment:", error);
      alert("Failed to edit comment.");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await api.delete(`/comments/${comment.id}`);
      if (onCommentDelete) onCommentDelete(comment.id);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment.");
    }
  };

  const openCodeModalForReply = () => {
    setPendingCode({ isReply: true });
    setShowCodeModal(true);
  };
  const openCodeModalForEdit = () => {
    setShowCodeModal(true);
  };
  const saveCode = (content, language) => {
    if (pendingCode?.isReply) setReplyCode({ content, language });
    else setEditCode({ content, language });
    setShowCodeModal(false);
    setPendingCode(null);
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

  if (isEditing) {
    return (
      <div className="border-b border-gray-700 pb-4 mb-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-yellowShade/20 flex items-center justify-center">
            <User size={14} className="text-yellowShade" />
          </div>
          <div className="flex-1">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-white text-sm">
                  Editing comment
                </span>
              </div>
              <textarea
                ref={editTextareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white resize-none text-sm mb-2"
                rows="3"
              />
              {editCode?.content && (
                <div className="mb-2 p-2 bg-blue-500/10 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-blue-400">
                    Code attached{" "}
                    {editCode.language ? `(${editCode.language})` : ""}
                  </span>
                  <button
                    onClick={() => setEditCode(null)}
                    className="text-xs text-red-400"
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 bg-yellowShade text-darkShade font-semibold rounded-lg text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={openCodeModalForEdit}
                  className="px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg text-sm flex items-center gap-1"
                >
                  <Code size={14} /> Code
                </button>
              </div>
            </div>
          </div>
        </div>
        <CodeModal
          isOpen={showCodeModal}
          onClose={() => {
            setShowCodeModal(false);
            setPendingCode(null);
          }}
          onSave={saveCode}
          initialCode={editCode?.content || ""}
          initialLanguage={editCode?.language || ""}
        />
      </div>
    );
  }

  return (
    <div className="border-b border-gray-700 pb-4 last:border-0">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-yellowShade/20 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-yellowShade" />
        </div>
        <div className="flex-1">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm">
                  {comment.user_name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(comment.created_at)}
                </span>
                {comment.is_modified && (
                  <span className="text-xs text-gray-500">(edited)</span>
                )}
              </div>
              {isOwner && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 rounded-lg hover:bg-white/10"
                  >
                    <MoreHorizontal size={14} className="text-gray-400" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-32 bg-darkShade border border-white/10 rounded-lg shadow-lg z-10 py-1">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setIsEditing(true);
                          setTimeout(
                            () => editTextareaRef.current?.focus(),
                            100,
                          );
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          handleDelete();
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-gray-300 text-sm">{comment.body}</p>
            {comment.code && (
              <pre className="mt-2 p-2 bg-darkShade/50 rounded text-xs text-gray-300 overflow-x-auto">
                <code className={`language-${comment.code_language || "text"}`}>
                  {comment.code}
                </code>
              </pre>
            )}
          </div>
          <div className="flex gap-4 mt-1 ml-2">
            <button
              onClick={handleLike}
              className={`text-xs flex items-center gap-1 ${isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
            >
              <Heart size={12} className={isLiked ? "fill-red-500" : ""} />
              <span>{likesCount > 0 ? likesCount : "Like"}</span>
            </button>
            <button
              onClick={handleDislike}
              className={`text-xs flex items-center gap-1 ${isDisliked ? "text-yellowShade" : "text-gray-500 hover:text-yellowShade"}`}
            >
              <ThumbsDown size={12} />
              <span>{dislikesCount > 0 ? dislikesCount : "Dislike"}</span>
            </button>
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-xs text-gray-500 hover:text-yellowShade flex items-center gap-1"
            >
              <MessageCircle size={12} /> Reply
            </button>
          </div>
          {showReplyInput && (
            <div className="mt-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Reply to ${comment.user_name}...`}
                className="w-full px-3 py-1.5 bg-white/10 border border-gray-600 rounded-lg text-white resize-none text-sm"
                rows="2"
              />
              {replyCode?.content && (
                <div className="mt-1 p-1.5 bg-blue-500/10 rounded text-xs text-blue-400 flex justify-between items-center">
                  <span>
                    Code attached{" "}
                    {replyCode.language ? `(${replyCode.language})` : ""}
                  </span>
                  <button
                    onClick={() => setReplyCode(null)}
                    className="text-red-400"
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleReply}
                  disabled={
                    submittingReply ||
                    (!replyContent.trim() && !replyCode?.content)
                  }
                  className="px-3 py-1.5 bg-yellowShade text-darkShade font-semibold rounded-lg"
                >
                  <Send size={14} />
                </button>
                <button
                  onClick={openCodeModalForReply}
                  className="px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg text-sm flex items-center gap-1"
                >
                  <Code size={14} /> Code
                </button>
                <button
                  onClick={() => {
                    setShowReplyInput(false);
                    setReplyContent("");
                    setReplyCode(null);
                  }}
                  className="px-3 py-1.5 bg-white/10 text-gray-300 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {comment.has_childrens && (
            <button className="mt-2 text-xs text-yellowShade flex items-center gap-1">
              <ChevronDown size={14} /> View replies
            </button>
          )}
        </div>
      </div>
      <CodeModal
        isOpen={showCodeModal && pendingCode?.isReply}
        onClose={() => {
          setShowCodeModal(false);
          setPendingCode(null);
        }}
        onSave={saveCode}
        initialCode={replyCode?.content || ""}
        initialLanguage={replyCode?.language || ""}
      />
    </div>
  );
};

const PostDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [liking, setLiking] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [newCommentCode, setNewCommentCode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser?.id;

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/posts/${id}`);
      const postData = response.data.data;
      setPost(postData);
      setIsLiked(postData.is_liked_by_user || false);
      setLikesCount(postData.likes_count || 0);
      setIsSaved(postData.is_saved || false);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError("Failed to load post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (pageNum = 1, append = false) => {
    try {
      const response = await api.get(
        `/posts/${id}/comments?page=${pageNum}&per_page=15`,
      );
      const newComments = response.data.data;
      const pagination = response.data.pagination;
      if (append) setComments((prev) => [...prev, ...newComments]);
      else setComments(newComments);
      setHasMoreComments(pagination.current_page < pagination.last_page);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading(false);
      setLoadingMoreComments(false);
    }
  };

  useEffect(() => {
    fetchPost();
    fetchComments(1, false);
  }, [id]);

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

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && !newCommentCode?.content) return;
    setSubmitting(true);
    try {
      const response = await api.post("/comments", {
        body: newComment || " ",
        post_id: parseInt(id),
        code: newCommentCode?.content || null,
        code_language: newCommentCode?.language || null,
      });
      setComments((prev) => [response.data.data, ...prev]);
      setNewComment("");
      setNewCommentCode(null);
      if (post)
        setPost({ ...post, comments_count: (post.comments_count || 0) + 1 });
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentUpdate = (updatedComment) => {
    const updateCommentInList = (list) =>
      list.map((c) => (c.id === updatedComment.id ? updatedComment : c));
    setComments((prev) => updateCommentInList(prev));
  };

  const handleCommentDelete = (commentId) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    if (post)
      setPost({
        ...post,
        comments_count: Math.max(0, (post.comments_count || 0) - 1),
      });
  };

  const loadMoreComments = () => {
    if (!hasMoreComments || loadingMoreComments) return;
    setLoadingMoreComments(true);
    setCommentPage((prev) => prev + 1);
    fetchComments(commentPage + 1, true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 300
      )
        loadMoreComments();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMoreComments, loadingMoreComments]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="w-10 h-10 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
        <p className="text-gray-400 ml-3">Loading post...</p>
      </div>
    );
  if (error || !post)
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-red-400 mb-3">{error || "Post not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-yellowShade text-darkShade rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-400 hover:text-yellowShade mb-6"
      >
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {post.title}
        </h1>
        <p className="text-gray-300 text-lg mb-6 leading-relaxed">
          {post.body}
        </p>

        {/* Photos - إضافة عرض الصور */}
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
          <div className="mb-6 bg-darkShade/50 rounded-lg overflow-hidden border border-gray-700">
            <div className="flex items-center justify-between px-3 py-2 bg-gray-800/50 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Code size={14} className="text-yellowShade" />
                <span className="text-xs text-gray-300">
                  {post.code_language || "code"}
                </span>
              </div>
            </div>
            <pre className="p-4 text-sm text-gray-300 overflow-x-auto font-mono">
              <code>{post.code}</code>
            </pre>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-700">
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
                  <span className="text-xs px-2 py-0.5 bg-yellowShade/20 text-yellowShade rounded-full">
                    {post.user.badge}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  @{post.user.username}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar size={14} />
              <span>{formatDate(post.created_at)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Eye size={14} />
              <span>{post.views_count || 0} views</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isLiked ? "text-red-500 bg-red-500/10" : "text-gray-400 hover:text-red-500 hover:bg-red-500/10"}`}
          >
            <Heart size={20} className={isLiked ? "fill-red-500" : ""} />
            <span>{likesCount}</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isSaved ? "text-yellowShade bg-yellowShade/10" : "text-gray-400 hover:text-yellowShade hover:bg-yellowShade/10"}`}
          >
            <Bookmark size={20} className={isSaved ? "fill-yellowShade" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <MessageCircle size={20} className="text-yellowShade" />
          Comments ({post.comments_count || 0})
        </h2>

        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-4 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade resize-none text-sm"
            rows="3"
          />
          {newCommentCode?.content && (
            <div className="mt-2 p-2 bg-blue-500/10 rounded flex justify-between items-center">
              <span className="text-sm text-blue-400">
                Code attached{" "}
                {newCommentCode.language ? `(${newCommentCode.language})` : ""}
              </span>
              <button
                onClick={() => setNewCommentCode(null)}
                className="text-red-400 text-sm"
              >
                Remove
              </button>
            </div>
          )}
          <div className="flex gap-3 mt-3">
            <button
              type="submit"
              disabled={
                submitting || (!newComment.trim() && !newCommentCode?.content)
              }
              className="px-5 py-2 bg-yellowShade text-darkShade font-semibold rounded-lg"
            >
              <Send size={18} />
            </button>
            <button
              type="button"
              onClick={() => setShowCodeModal(true)}
              className="px-5 py-2 bg-white/10 text-gray-300 rounded-lg flex items-center gap-1"
            >
              <Code size={16} /> Add Code
            </button>
          </div>
        </form>

        {commentsLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle size={40} className="text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400">No comments yet</p>
            <p className="text-gray-500 text-sm">Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={parseInt(id)}
                currentUserId={currentUserId}
                onCommentUpdate={handleCommentUpdate}
                onCommentDelete={handleCommentDelete}
              />
            ))}
            {hasMoreComments && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={loadMoreComments}
                  disabled={loadingMoreComments}
                  className="text-sm text-yellowShade"
                >
                  {loadingMoreComments ? "Loading..." : "Load more comments"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <CodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        onSave={(content, language) => {
          setNewCommentCode({ content, language });
          setShowCodeModal(false);
        }}
      />
    </div>
  );
};

export default PostDetailsPage;
