import { useState, useEffect, useCallback, useRef } from "react";
import PostCard from "../components/posts/PostCard";
import api from "../services/api";

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // منع عدة طلبات متزامنة
  const isLoadingRef = useRef(false);
  const currentPageRef = useRef(1);

  // جلب البوستات
  const fetchPosts = useCallback(async (pageNum, append = false) => {
    // منع الطلبات المتزامنة
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      const response = await api.get(
        `/posts/recommended?page=${pageNum}&per_page=20`,
      );

      const newPosts = response.data.data;

      // إذا كانت الصفحة الحالية فيها بوستات أقل من 20 أو 0، معناه لا يوجد المزيد
      if (newPosts.length === 0) {
        setHasMore(false);
      } else if (newPosts.length < 20) {
        // إذا كانت آخر صفحة فيها بوستات أقل من 20، نجيبها ونوقف التحميل بعدها
        if (append) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        setHasMore(false);
      } else {
        // في بوستات كاملة، نضيفها ونسمح بالمزيد
        if (append) {
          setPosts((prev) => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        setHasMore(true);
      }
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
    currentPageRef.current = 1;
    setPage(1);
    setPosts([]);
    setHasMore(true);
    setLoading(true);
    fetchPosts(1, false);
  }, [fetchPosts]);

  // تحميل المزيد عند التمرير (بدون الاعتماد على hasMore من الـ API)
  const loadMore = useCallback(() => {
    // إذا كان في تحميل أو ما في بوستات زيادة، نوقف
    if (loadingMore || isLoadingRef.current || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    currentPageRef.current = nextPage;
    fetchPosts(nextPage, true);
  }, [loadingMore, hasMore, page, fetchPosts]);

  // كشف التمرير لأسفل الصفحة
  useEffect(() => {
    const handleScroll = () => {
      // نتحقق إذا وصلنا قريب من نهاية الصفحة
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

  // تحديث حالة التعليقات في قائمة البوستات
  const handleCommentUpdate = (postId, newCount) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, comments_count: newCount } : post,
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
          <PostCard
            key={post.id}
            post={post}
            onLikeUpdate={handleLikeUpdate}
            onCommentUpdate={handleCommentUpdate}
          />
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
