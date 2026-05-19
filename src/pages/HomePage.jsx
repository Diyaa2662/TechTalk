import { useState, useEffect, useCallback } from "react";
import PostCard from "../components/posts/PostCard";
import api from "../services/api";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // جلب البوستات
  const fetchPosts = useCallback(async (pageNum, append = false) => {
    try {
      const response = await api.get(
        `/posts/recommended?page=${pageNum}&per_page=10`,
      );

      const newPosts = response.data.data;
      const pagination = response.data.pagination;

      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }

      setHasMore(pagination.current_page < pagination.last_page);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load posts. Please refresh the page.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // تحميل أول صفحة
  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  // تحميل المزيد عند التمرير
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  }, [hasMore, loadingMore, page, fetchPosts]);

  // كشف التمرير لأسفل الصفحة
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 500
      ) {
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
          <PostCard key={post.id} post={post} onLikeUpdate={handleLikeUpdate} />
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
