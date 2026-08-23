import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Plus,
  MessageCircle as ChatIcon,
  Sparkles,
  Inbox,
} from "lucide-react";
import api from "../services/api";
import CommentsModal from "../components/comments/CommentsModal";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PostCard from "../components/posts/PostCard";
import ChatBot from "../components/chat/ChatBot";
import ProfileCompletionBanner from "../components/common/ProfileCompletionBanner";

const HomePage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [showCreateBtn, setShowCreateBtn] = useState(true);

  const isLoadingRef = useRef(false);
  const lastScrollY = useRef(0);

  // جلب المستخدم الحالي
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // جلب البوستات
  const fetchPosts = useCallback(async (pageNum, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      console.log(`Fetching posts page ${pageNum}...`);
      const response = await api.get(`/posts?page=${pageNum}&per_page=20`);
      const newPosts = response.data.data;
      const pagination = response.data.pagination;

      console.log(
        `Got ${newPosts.length} posts, has_more: ${pagination?.has_more_pages || false}`,
      );

      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(pagination?.has_more_pages === true);
      setError("");
    } catch (err) {
      console.error("Error fetching posts:", err);

      if (
        err.response?.status === 404 ||
        err.response?.data?.message?.includes("No posts")
      ) {
        setPosts([]);
        setError("");
      } else {
        setError("Failed to load posts. Please refresh the page.");
      }
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
    if (loadingMore || isLoadingRef.current || !hasMore) {
      return;
    }

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  }, [loadingMore, hasMore, page, fetchPosts]);

  // كشف التمرير للتحكم بظهور زر الإنشاء
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // كشف التمرير لتحميل المزيد
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollPercentage = (scrollTop + windowHeight) / documentHeight;

      if (scrollPercentage > 0.8) {
        loadMore();
      }

      // التحكم بظهور زر الإنشاء - يختفي عند التمرير للأسفل ويظهر عند التمرير للأعلى
      if (currentScrollY > 150 && currentScrollY > lastScrollY.current) {
        // التمرير للأسفل - إخفاء الزر (يطلع لفوق)
        setShowCreateBtn(false);
      } else if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
        // التمرير للأعلى - إظهار الزر (ينزل)
        setShowCreateBtn(true);
      }

      lastScrollY.current = currentScrollY;
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

  // تحديث البوست بعد التعديل
  const handlePostUpdate = (updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === updatedPost.id ? updatedPost : post,
      ),
    );
  };

  // حذف البوست
  const handlePostDelete = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
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
            className="px-4 py-2 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-[#5CA1FC]/10 rounded-full flex items-center justify-center pulse-ring">
            <Inbox size={48} className="text-[#5CA1FC]/60" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Posts Yet</h2>
          <p className="text-muted text-sm mb-6">
            Follow more developers to see their posts in your feed.
            <br />
            Or be the first to share something amazing! 🚀
          </p>
          <button
            onClick={() => navigate("/create-post")}
            className="px-6 py-3 gradient-button text-white font-semibold rounded-lg transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
          >
            <Plus size={18} className="inline mr-2" />
            Create First Post
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* ✅ Profile Completion Banner */}
      <ProfileCompletionBanner />

      {/* Header - مع العنوان الجديد */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="gradient-title text-2xl font-bold">For You</h1>

        {/* Create Post Button - يختفي للأعلى عند التمرير للأسفل */}
        <button
          onClick={() => navigate("/create-post")}
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
          <span className="hidden sm:inline">Create Post</span>
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-5">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLikeUpdate={handleLikeUpdate}
            onCommentUpdate={handleCommentUpdate}
            onSaveUpdate={handleSaveUpdate}
            onPostUpdate={handlePostUpdate}
            onPostDelete={handlePostDelete}
            isContentOwner={post.user?.id === currentUser?.id}
          />
        ))}
      </div>

      {/* Loading More */}
      {loadingMore && (
        <div className="flex justify-center my-6">
          <LoadingSpinner size="md" text={null} />
        </div>
      )}

      {/* End of list */}
      {!hasMore && posts.length > 0 && (
        <p className="text-center text-muted text-sm py-6">
          You've seen all posts! 🎉
        </p>
      )}

      {/* Chat Button - أسفل يمين الصفحة */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-full 
          shadow-[0_8px_32px_rgba(92,161,252,0.35)] hover:shadow-[0_12px_48px_rgba(92,161,252,0.45)]
          flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95
          group"
      >
        <ChatIcon
          size={28}
          className="group-hover:rotate-12 transition-transform duration-300"
        />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse"></span>
      </button>

      {/* Chat Bot Modal */}
      <ChatBot isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
};

export default HomePage;
