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
import PostCard from "../components/posts/PostCard";

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

  // جلب المستخدم الحالي
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

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
            onPostUpdate={handlePostUpdate}
            onPostDelete={handlePostDelete}
            isContentOwner={post.user?.id === currentUser?.id}
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
