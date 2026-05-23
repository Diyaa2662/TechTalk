/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  User,
  Heart,
  ThumbsDown,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Code,
  Shield,
  ShieldAlert,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import api from "../../services/api";

const CommentsModal = ({ isOpen, onClose, postId, onCommentAdded }) => {
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});
  const [repliesData, setRepliesData] = useState({});
  const [loadingReplies, setLoadingReplies] = useState({});
  const [totalComments, setTotalComments] = useState(0);

  // State for editing
  const [editingComment, setEditingComment] = useState(null);
  const editTextValueRef = useRef("");
  const [editingCode, setEditingCode] = useState(null);

  // State for code attachment in main form
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeContent, setCodeContent] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("");
  const [pendingCode, setPendingCode] = useState(null);

  // Mention states
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [showMentionPopup, setShowMentionPopup] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Refs for mention to avoid re-render
  const mentionQueryRef = useRef("");
  const mentionCursorPosRef = useRef(0);

  const modalRef = useRef(null);
  const codeModalRef = useRef(null);
  const textareaRef = useRef(null);
  const editTextareaRef = useRef(null);
  const mentionPopupRef = useRef(null);

  // جلب المستخدم الحالي من localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = currentUser?.id;

  // جلب اقتراحات المنشن (حد أقصى 5)
  const fetchMentionSuggestions = async (query) => {
    if (query.length < 2) {
      setMentionSuggestions([]);
      setShowMentionPopup(false);
      return;
    }

    try {
      const response = await api.post("/suggestions", { q: query });
      if (response.data?.data?.length > 0) {
        setMentionSuggestions(response.data.data.slice(0, 5));
        setShowMentionPopup(true);
        setSelectedSuggestionIndex(-1);
      } else {
        setMentionSuggestions([]);
        setShowMentionPopup(false);
      }
    } catch (error) {
      console.error("Error fetching mention suggestions:", error);
      setMentionSuggestions([]);
      setShowMentionPopup(false);
    }
  };

  // جلب التعليقات
  const fetchComments = async (pageNum = 1, append = false) => {
    try {
      const response = await api.get(
        `/posts/${postId}/comments?page=${pageNum}&per_page=15`,
      );

      const newComments = response.data.data;
      const pagination = response.data.pagination;

      if (append) {
        setComments((prev) => [...prev, ...newComments]);
      } else {
        setComments(newComments);
      }

      setTotalComments(pagination.total);
      setHasMore(pagination.current_page < pagination.last_page);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // جلب الردود على تعليق
  const fetchReplies = async (commentId) => {
    if (repliesData[commentId]) return;

    setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));

    try {
      const response = await api.get(`/comments/${commentId}/children?page=1`);
      const children = response.data.data.children || [];

      setRepliesData((prev) => ({ ...prev, [commentId]: children }));
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // تبديل عرض الردود
  const toggleReplies = (commentId) => {
    if (!expandedReplies[commentId]) {
      fetchReplies(commentId);
    }
    setExpandedReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  // تحميل عند فتح المودال
  useEffect(() => {
    if (isOpen && postId) {
      setPage(1);
      setComments([]);
      setRepliesData({});
      setExpandedReplies({});
      setTotalComments(0);
      setPendingCode(null);
      setCodeContent("");
      setCodeLanguage("");
      setEditingComment(null);
      editTextValueRef.current = "";
      mentionQueryRef.current = "";
      fetchComments(1, false);
    }
  }, [isOpen, postId]);

  // تحميل المزيد
  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComments(nextPage, true);
  };

  // معالجة الإعجاب بتعليق (Toggle)
  const handleLikeComment = async (
    commentId,
    isLiked,
    isDisliked,
    setIsLiked,
    setLikesCount,
    setIsDisliked,
    setDislikesCount,
  ) => {
    try {
      if (isLiked) {
        await api.post(`/comments/${commentId}/like`, {});
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
        return;
      }

      if (isDisliked) {
        await api.post(`/comments/${commentId}/dislike`, {});
        setIsDisliked(false);
        setDislikesCount((prev) => Math.max(0, prev - 1));
      }

      await api.post(`/comments/${commentId}/like`, {});
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // معالجة الديزلايك بتعليق (Toggle)
  const handleDislikeComment = async (
    commentId,
    isDisliked,
    isLiked,
    setIsDisliked,
    setDislikesCount,
    setIsLiked,
    setLikesCount,
  ) => {
    try {
      if (isDisliked) {
        await api.post(`/comments/${commentId}/dislike`, {});
        setIsDisliked(false);
        setDislikesCount((prev) => Math.max(0, prev - 1));
        return;
      }

      if (isLiked) {
        await api.post(`/comments/${commentId}/like`, {});
        setIsLiked(false);
        setLikesCount((prev) => Math.max(0, prev - 1));
      }

      await api.post(`/comments/${commentId}/dislike`, {});
      setIsDisliked(true);
      setDislikesCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error toggling dislike:", error);
    }
  };

  // معالجة الكتابة في حقل التعليق الجديد (مع منشن - يظهر فوق)
  const handleCommentChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;

    mentionCursorPosRef.current = cursorPos;

    if (replyTo) {
      setReplyContent(value);
    } else {
      setNewComment(value);
    }

    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(" ")) {
        if (mentionQueryRef.current !== textAfterAt) {
          mentionQueryRef.current = textAfterAt;
          setTimeout(() => {
            fetchMentionSuggestions(textAfterAt);
          }, 10);
        }

        const textarea = e.target;
        const rect = textarea.getBoundingClientRect();
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const lines = textBeforeCursor.split("\n");
        const currentLine = lines.length - 1;
        const currentLineText = lines[currentLine];

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context.font = getComputedStyle(textarea).font;
        const textWidth = context.measureText(currentLineText).width;

        const popupHeight = 210;
        setMentionPosition({
          top:
            rect.top + currentLine * lineHeight - popupHeight + window.scrollY,
          left: rect.left + Math.min(textWidth, rect.width - 200) + 10,
        });
        return;
      }
    }

    mentionQueryRef.current = "";
    setShowMentionPopup(false);
  };

  // معالجة الكتابة في حقل التعديل (مع منشن - يظهر فوق)
  const handleEditCommentChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;

    editTextValueRef.current = value;
    mentionCursorPosRef.current = cursorPos;

    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(" ")) {
        if (mentionQueryRef.current !== textAfterAt) {
          mentionQueryRef.current = textAfterAt;
          setTimeout(() => {
            fetchMentionSuggestions(textAfterAt);
          }, 10);
        }

        const textarea = e.target;
        const rect = textarea.getBoundingClientRect();
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const lines = textBeforeCursor.split("\n");
        const currentLine = lines.length - 1;
        const currentLineText = lines[currentLine];

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context.font = getComputedStyle(textarea).font;
        const textWidth = context.measureText(currentLineText).width;

        const popupHeight = 210;
        setMentionPosition({
          top:
            rect.top + currentLine * lineHeight - popupHeight + window.scrollY,
          left: rect.left + Math.min(textWidth, rect.width - 200) + 10,
        });
        return;
      }
    }

    mentionQueryRef.current = "";
    setShowMentionPopup(false);
  };

  // اختيار منشن
  const selectMention = (user) => {
    const isEditing = !!editingComment;
    const textarea = isEditing ? editTextareaRef.current : textareaRef.current;
    if (!textarea) return;

    const currentValue = isEditing
      ? editTextValueRef.current
      : replyTo
        ? replyContent
        : newComment;
    const cursorPos = mentionCursorPosRef.current;

    const textBeforeCursor = currentValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const beforeAt = currentValue.slice(0, lastAtIndex);
      const afterCursor = currentValue.slice(cursorPos);
      const mentionText = `@${user.username} `;
      const newValue = beforeAt + mentionText + afterCursor;

      if (isEditing) {
        editTextValueRef.current = newValue;
        if (editTextareaRef.current) {
          editTextareaRef.current.value = newValue;
        }
      } else if (replyTo) {
        setReplyContent(newValue);
      } else {
        setNewComment(newValue);
      }

      const newCursorPos = lastAtIndex + mentionText.length;
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 10);
    }

    setShowMentionPopup(false);
    setMentionSuggestions([]);
    mentionQueryRef.current = "";
  };

  // Keyboard navigation for mentions
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showMentionPopup) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < mentionSuggestions.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        selectMention(mentionSuggestions[selectedSuggestionIndex]);
      } else if (e.key === "Escape") {
        setShowMentionPopup(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showMentionPopup, mentionSuggestions, selectedSuggestionIndex]);

  // بدء التعديل على تعليق
  const startEdit = (comment) => {
    setPendingCode(null);
    setCodeContent("");
    setCodeLanguage("");

    setEditingComment(comment);
    editTextValueRef.current = comment.body;
    setEditingCode(
      comment.code
        ? { content: comment.code, language: comment.code_language }
        : null,
    );

    setTimeout(() => {
      if (editTextareaRef.current) {
        editTextareaRef.current.value = editTextValueRef.current;
        editTextareaRef.current.focus();
        editTextareaRef.current.setSelectionRange(
          editTextValueRef.current.length,
          editTextValueRef.current.length,
        );
      }
    }, 50);
  };

  // حفظ التعديل
  const saveEdit = async () => {
    const currentText = editTextValueRef.current;
    if (!currentText.trim() && !editingCode?.content) return;

    setSubmitting(true);

    const payload = {
      body: currentText || " ",
      code: editingCode?.content || null,
      code_language: editingCode?.language || null,
    };

    try {
      const response = await api.post(
        `/comments/${editingComment.id}`,
        payload,
      );
      const updatedComment = response.data.data;

      const updateCommentInList = (commentList) => {
        return commentList.map((c) => {
          if (c.id === editingComment.id) {
            return { ...c, ...updatedComment };
          }
          return c;
        });
      };

      setComments((prev) => updateCommentInList(prev));

      setEditingComment(null);
      editTextValueRef.current = "";
      setEditingCode(null);
      setPendingCode(null);
      setCodeContent("");
      setCodeLanguage("");
    } catch (error) {
      console.error("Error editing comment:", error);
      alert("Failed to edit comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // حذف تعليق
  const deleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await api.delete(`/comments/${commentId}`);

      const filterComment = (commentList) => {
        return commentList.filter((c) => {
          if (c.id === commentId) return false;
          return true;
        });
      };

      setComments((prev) => filterComment(prev));
      setTotalComments((prev) => prev - 1);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  // فتح نافذة إضافة كود للتعديل
  const openEditCodeModal = () => {
    setCodeContent(editingCode?.content || "");
    setCodeLanguage(editingCode?.language || "");
    setShowCodeModal(true);
  };

  // حفظ الكود للتعديل
  const saveEditCode = () => {
    setEditingCode({ content: codeContent, language: codeLanguage });
    setShowCodeModal(false);
  };

  // فتح نافذة إضافة كود للتعليق الجديد
  const openCodeModal = () => {
    if (codeContent || codeLanguage) {
      setPendingCode({ content: codeContent, language: codeLanguage });
    }
    setShowCodeModal(true);
  };

  // حفظ الكود للتعليق الجديد
  const saveCode = () => {
    setPendingCode({ content: codeContent, language: codeLanguage });
    setShowCodeModal(false);
  };

  // إلغاء الكود
  const cancelCode = () => {
    if (pendingCode) {
      setCodeContent(pendingCode.content);
      setCodeLanguage(pendingCode.language);
    } else {
      setCodeContent("");
      setCodeLanguage("");
    }
    setShowCodeModal(false);
  };

  // إرسال التعليق مع كود (جديد)
  // eslint-disable-next-line no-unused-vars
  const submitWithCode = async () => {
    setSubmitting(true);

    const content = replyTo ? replyContent : newComment;

    const payload = {
      body: content || " ",
      post_id: postId,
      code: pendingCode?.content || null,
      code_language: pendingCode?.language || null,
    };

    if (replyTo) {
      payload.parent_id = replyTo.id;
    }

    try {
      const response = await api.post("/comments", payload);
      const newCommentData = response.data.data;

      if (replyTo) {
        setRepliesData((prev) => ({
          ...prev,
          [replyTo.id]: [newCommentData, ...(prev[replyTo.id] || [])],
        }));
        if (!expandedReplies[replyTo.id]) {
          setExpandedReplies((prev) => ({ ...prev, [replyTo.id]: true }));
        }
        setReplyTo(null);
        setReplyContent("");
      } else {
        setComments((prev) => [newCommentData, ...prev]);
        setNewComment("");
        setTotalComments((prev) => prev + 1);
        if (onCommentAdded) onCommentAdded();
      }

      setCodeContent("");
      setCodeLanguage("");
      setPendingCode(null);

      if (textareaRef.current) textareaRef.current.focus();
    } catch (error) {
      console.error("Error adding comment with code:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // إضافة تعليق عادي (بدون كود)
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    const content = replyTo ? replyContent : newComment;
    if (!content.trim() && !pendingCode?.content) return;

    setSubmitting(true);

    const payload = {
      body: content || " ",
      post_id: postId,
      code: pendingCode?.content || null,
      code_language: pendingCode?.language || null,
    };

    if (replyTo) {
      payload.parent_id = replyTo.id;
    }

    try {
      const response = await api.post("/comments", payload);
      const newCommentData = response.data.data;

      if (replyTo) {
        setRepliesData((prev) => ({
          ...prev,
          [replyTo.id]: [newCommentData, ...(prev[replyTo.id] || [])],
        }));
        if (!expandedReplies[replyTo.id]) {
          setExpandedReplies((prev) => ({ ...prev, [replyTo.id]: true }));
        }
        setReplyTo(null);
        setReplyContent("");
      } else {
        setComments((prev) => [newCommentData, ...prev]);
        setNewComment("");
        setTotalComments((prev) => prev + 1);
        if (onCommentAdded) onCommentAdded();
      }

      setCodeContent("");
      setCodeLanguage("");
      setPendingCode(null);

      if (textareaRef.current) textareaRef.current.focus();
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // بدء الرد على تعليق
  const startReply = (comment) => {
    setReplyTo(comment);
    setReplyContent("");
    if (textareaRef.current) textareaRef.current.focus();
  };

  // إلغاء الرد
  const cancelReply = () => {
    setReplyTo(null);
    setReplyContent("");
  };

  // إلغاء التعديل
  const cancelEdit = () => {
    setEditingComment(null);
    editTextValueRef.current = "";
    setEditingCode(null);
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

  // إغلاق المودال الرئيسي
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (codeModalRef.current && codeModalRef.current.contains(e.target)) {
        return;
      }
      if (
        mentionPopupRef.current &&
        mentionPopupRef.current.contains(e.target)
      ) {
        return;
      }
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") {
        if (showCodeModal) {
          cancelCode();
        } else if (showMentionPopup) {
          setShowMentionPopup(false);
        } else if (editingComment) {
          cancelEdit();
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose, showCodeModal, editingComment, showMentionPopup]);

  if (!isOpen) return null;

  // مكون عرض التعليق الواحد
  const CommentItem = ({ comment, isReply = false }) => {
    const [isLiked, setIsLiked] = useState(comment.is_liked_by_user || false);
    const [likesCount, setLikesCount] = useState(0);
    const [isDisliked, setIsDisliked] = useState(
      comment.is_disliked_by_user || false,
    );
    const [dislikesCount, setDislikesCount] = useState(0);
    const [showMenu, setShowMenu] = useState(false);
    const menuRefLocal = useRef(null);

    const replies = repliesData[comment.id] || [];
    const isLoadingReplies = loadingReplies[comment.id];
    const isExpanded = expandedReplies[comment.id];
    const isOwner = comment.user_id === currentUserId;

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (menuRefLocal.current && !menuRefLocal.current.contains(e.target)) {
          setShowMenu(false);
        }
      };
      if (showMenu) {
        window.addEventListener("click", handleClickOutside);
      }
      return () => window.removeEventListener("click", handleClickOutside);
    }, [showMenu]);

    const handleLocalLike = () => {
      handleLikeComment(
        comment.id,
        isLiked,
        isDisliked,
        setIsLiked,
        setLikesCount,
        setIsDisliked,
        setDislikesCount,
      );
    };

    const handleLocalDislike = () => {
      handleDislikeComment(
        comment.id,
        isDisliked,
        isLiked,
        setIsDisliked,
        setDislikesCount,
        setIsLiked,
        setLikesCount,
      );
    };

    // وضع التعديل
    if (editingComment?.id === comment.id) {
      return (
        <div className={`flex gap-3 ${!isReply ? "mb-4" : "mb-3 ml-11"}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellowShade/20 to-yellowShade/5 flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-yellowShade" />
          </div>
          <div className="flex-1">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-white text-sm">
                  {comment.user_name} (editing)
                </span>
              </div>

              <textarea
                ref={editTextareaRef}
                defaultValue={editTextValueRef.current}
                onChange={handleEditCommentChange}
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent resize-none text-sm mb-2"
                rows="3"
              />

              {editingCode?.content && (
                <div className="mb-2 p-2 bg-blue-500/10 rounded-lg flex items-center justify-between border border-blue-500/30">
                  <div className="flex items-center gap-2">
                    <Code size={14} className="text-blue-400" />
                    <span className="text-xs text-blue-400">
                      Code attached{" "}
                      {editingCode.language ? `(${editingCode.language})` : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={openEditCodeModal}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingCode(null)}
                      className="text-xs text-gray-400 hover:text-gray-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveEdit}
                  disabled={
                    submitting ||
                    (!editTextValueRef.current.trim() && !editingCode?.content)
                  }
                  className="px-3 py-1.5 bg-yellowShade hover:bg-yellowShade/90 text-darkShade font-semibold rounded-lg transition-all duration-200 text-sm disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-all duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={openEditCodeModal}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-all duration-200 text-sm flex items-center gap-1"
                >
                  <Code size={14} />
                  Code
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex gap-3 ${!isReply ? "mb-4" : "mb-3 ml-11"}`}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellowShade/20 to-yellowShade/5 flex items-center justify-center flex-shrink-0">
          <User size={16} className="text-yellowShade" />
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
                <div className="relative" ref={menuRefLocal}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <MoreHorizontal size={14} className="text-gray-400" />
                  </button>
                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-32 bg-darkShade border border-white/10 rounded-lg shadow-lg z-10 py-1">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          startEdit(comment);
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm text-gray-300 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          deleteComment(comment.id);
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-gray-300 text-sm">{comment.body}</p>

            {comment.code && (
              <div className="mt-2 bg-darkShade/50 rounded-lg overflow-hidden border border-gray-700">
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-800/50 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <Code size={12} className="text-yellowShade" />
                    <span className="text-xs text-gray-300">
                      {comment.code_language || "code"}
                    </span>
                  </div>
                  {comment.code_label && (
                    <div
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                        comment.code_label === "SAFE"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {comment.code_label === "SAFE" ? (
                        <Shield size={10} />
                      ) : (
                        <ShieldAlert size={10} />
                      )}
                      <span>{comment.code_label}</span>
                    </div>
                  )}
                </div>
                <pre className="p-2 text-xs text-gray-300 overflow-x-auto font-mono">
                  <code>{comment.code}</code>
                </pre>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-1 ml-2">
            <button
              onClick={handleLocalLike}
              className={`text-xs transition-colors flex items-center gap-1 ${
                isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
              }`}
            >
              <Heart size={12} className={isLiked ? "fill-red-500" : ""} />
              <span>{likesCount > 0 ? likesCount : "Like"}</span>
            </button>

            <button
              onClick={handleLocalDislike}
              className={`text-xs transition-colors flex items-center gap-1 ${
                isDisliked
                  ? "text-yellowShade"
                  : "text-gray-500 hover:text-yellowShade"
              }`}
            >
              <ThumbsDown size={12} />
              <span>{dislikesCount > 0 ? dislikesCount : "Dislike"}</span>
            </button>

            <button
              onClick={() => startReply(comment)}
              className="text-xs text-gray-500 hover:text-yellowShade transition-colors flex items-center gap-1"
            >
              <MessageCircle size={12} />
              Reply
            </button>
          </div>

          {comment.has_childrens && (
            <button
              onClick={() => toggleReplies(comment.id)}
              className="mt-2 text-xs text-yellowShade hover:text-yellowShade/80 transition-colors flex items-center gap-1"
            >
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {isExpanded ? "Hide replies" : `View replies`}
            </button>
          )}

          {isExpanded && (
            <div className="mt-3">
              {isLoadingReplies ? (
                <div className="flex justify-center py-2">
                  <div className="w-4 h-4 border-2 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
                </div>
              ) : (
                replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} isReply={true} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // عرض مؤشر وجود كود
  const hasCodeAttached = pendingCode?.content || codeContent;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
        <div
          ref={modalRef}
          className="bg-darkShade border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl mx-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageCircle size={20} className="text-yellowShade" />
              Comments
              <span className="text-sm text-gray-400">({totalComments})</span>
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle
                  size={40}
                  className="text-gray-600 mx-auto mb-2"
                />
                <p className="text-gray-400">No comments yet</p>
                <p className="text-gray-500 text-sm">
                  Be the first to comment!
                </p>
              </div>
            ) : (
              <>
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}

                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="text-sm text-yellowShade hover:text-yellowShade/80 transition-colors disabled:opacity-50"
                    >
                      {loadingMore ? "Loading..." : "Load more comments"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Add Comment Form */}
          {!editingComment && (
            <form
              onSubmit={handleSubmitComment}
              className="p-4 border-t border-white/10"
            >
              {replyTo && (
                <div className="mb-2 p-2 bg-yellowShade/10 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-yellowShade">
                    Replying to{" "}
                    <span className="font-semibold">@{replyTo.user_name}</span>
                  </span>
                  <button
                    type="button"
                    onClick={cancelReply}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {hasCodeAttached && (
                <div className="mb-2 p-2 bg-blue-500/10 rounded-lg flex items-center justify-between border border-blue-500/30">
                  <div className="flex items-center gap-2">
                    <Code size={14} className="text-blue-400" />
                    <span className="text-xs text-blue-400">
                      Code attached{" "}
                      {pendingCode?.language ? `(${pendingCode.language})` : ""}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={openCodeModal}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPendingCode(null);
                        setCodeContent("");
                        setCodeLanguage("");
                      }}
                      className="text-xs text-gray-400 hover:text-gray-300"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 relative">
                <textarea
                  ref={textareaRef}
                  value={replyTo ? replyContent : newComment}
                  onChange={handleCommentChange}
                  placeholder={
                    replyTo
                      ? `Reply to ${replyTo.user_name}...`
                      : "Write a comment... (use @ to mention users)"
                  }
                  className="flex-1 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent resize-none text-sm"
                  rows="2"
                />
                <div className="flex flex-col gap-1">
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      (!replyTo &&
                        !newComment.trim() &&
                        !pendingCode?.content) ||
                      (replyTo && !replyContent.trim() && !pendingCode?.content)
                    }
                    className="px-4 py-2 bg-yellowShade hover:bg-yellowShade/90 text-darkShade font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={openCodeModal}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 rounded-lg transition-all duration-200 text-sm flex items-center gap-1 justify-center"
                  >
                    <Code size={14} />
                    Code
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Mention Popup - يظهر فوق مع سكرول */}
      {showMentionPopup && mentionSuggestions.length > 0 && (
        <div
          ref={mentionPopupRef}
          style={{
            position: "absolute",
            top: mentionPosition.top,
            left: mentionPosition.left,
            zIndex: 300,
          }}
          className="bg-darkShade border border-gray-600 rounded-lg shadow-xl overflow-hidden min-w-[200px] max-h-[220px] overflow-y-auto"
        >
          {mentionSuggestions.map((user, idx) => (
            <button
              key={user.id}
              onClick={() => selectMention(user)}
              className={`w-full px-3 py-2 text-left hover:bg-white/10 transition-colors flex items-center gap-2 ${
                selectedSuggestionIndex === idx ? "bg-white/10" : ""
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-yellowShade/20 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User size={12} className="text-yellowShade" />
                )}
              </div>
              <div>
                <div className="text-sm text-white font-medium">
                  {user.name}
                </div>
                <div className="text-xs text-gray-400">@{user.username}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Code Modal */}
      {showCodeModal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            ref={codeModalRef}
            onClick={(e) => e.stopPropagation()}
            className="bg-darkShade border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Code size={20} className="text-yellowShade" />
                {editingComment
                  ? "Edit Code in Comment"
                  : "Add Code to Comment"}
              </h3>
              <button
                onClick={cancelCode}
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
                  onClick={(e) => e.stopPropagation()}
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
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={cancelCode}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={editingComment ? saveEditCode : saveCode}
                className="flex-1 px-4 py-2 bg-yellowShade hover:bg-yellowShade/90 text-darkShade font-semibold rounded-lg transition-all duration-200"
              >
                {editingComment ? "Update Code" : "Attach Code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CommentsModal;
