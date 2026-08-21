import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  MessageCircle,
  Heart,
  ThumbsDown,
  BookOpen,
  FileText,
  User,
  Clock,
  ChevronRight,
} from "lucide-react";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

const ActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isLoadingRef = useRef(false);

  // جلب النشاطات
  const fetchActivities = async (pageNum = 1, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      const response = await api.get(`/activity?page=${pageNum}&per_page=20`);
      const newActivities = response.data.data;
      const pagination = response.data.pagination;

      if (append) {
        setActivities((prev) => [...prev, ...newActivities]);
      } else {
        setActivities(newActivities);
      }

      setHasMore(pagination.has_more_pages === true);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activities. Please refresh the page.");
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  // تحميل أول صفحة
  useEffect(() => {
    setPage(1);
    setActivities([]);
    setHasMore(true);
    setLoading(true);
    fetchActivities(1, false);
  }, []);

  // تحميل المزيد عند التمرير
  const loadMore = useCallback(() => {
    if (loadingMore || isLoadingRef.current || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage, true);
  }, [loadingMore, hasMore, page]);

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

  // الحصول على أيقونة النشاط
  const getActivityIcon = (action) => {
    switch (action) {
      case "post_commented":
      case "blog_commented":
        return <MessageCircle size={16} className="text-accent" />;
      case "post_liked":
      case "blog_liked":
        return <Heart size={16} className="text-error" />;
      case "comment_liked":
        return <Heart size={16} className="text-error" />;
      case "comment_disliked":
        return <ThumbsDown size={16} className="text-accent" />;
      default:
        return <Activity size={16} className="text-muted" />;
    }
  };

  // الحصول على نص النشاط
  const getActivityText = (activity) => {
    const actor = activity.actor?.name || "User";

    switch (activity.action) {
      case "post_commented":
        return `${actor} commented on a post`;
      case "blog_commented":
        return `${actor} commented on a blog`;
      case "post_liked":
        return `${actor} liked a post`;
      case "blog_liked":
        return `${actor} liked a blog`;
      case "comment_liked":
        return `${actor} liked a comment`;
      case "comment_disliked":
        return `${actor} disliked a comment`;
      default:
        return `${actor} performed an action`;
    }
  };

  // الحصول على رابط النشاط
  const getActivityLink = (activity) => {
    const subject = activity.subject;
    if (!subject) return "#";

    switch (subject.type) {
      case "post":
        return `/posts/${subject.id}`;
      case "blog":
        return `/blogs/${subject.id}`;
      case "comment":
        // إذا كان التعليق على بوست أو بلوغ، نستخدم الـ meta
        if (activity.meta?.post_id) {
          return `/posts/${activity.meta.post_id}`;
        }
        if (activity.meta?.blog_id) {
          return `/blogs/${activity.meta.blog_id}`;
        }
        return "#";
      default:
        return "#";
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" text="Loading activity..." />
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

  if (activities.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <Activity size={48} className="text-muted mx-auto mb-3" />
          <p className="text-muted text-lg">No activity yet</p>
          <p className="text-label text-sm mt-1">
            Your activity will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Activity size={28} className="text-accent" />
        <h1 className="gradient-title text-2xl font-bold">Activity</h1>
      </div>

      <div className="space-y-2">
        {activities.map((activity) => {
          const link = getActivityLink(activity);
          const isClickable = link !== "#";

          return (
            <div
              key={activity.id}
              className={`glass-card p-4 transition-all duration-200 ${
                isClickable ? "hover:border-accent/50 cursor-pointer" : ""
              }`}
            >
              {isClickable ? (
                <Link to={link} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">
                      {getActivityText(activity)}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted mt-1">
                      <span>{formatDate(activity.created_at)}</span>
                      {activity.meta?.comment_id && (
                        <span>• Comment #{activity.meta.comment_id}</span>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-muted flex-shrink-0"
                  />
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">
                      {getActivityText(activity)}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted mt-1">
                      <span>{formatDate(activity.created_at)}</span>
                      {activity.meta?.comment_id && (
                        <span>• Comment #{activity.meta.comment_id}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {loadingMore && (
        <div className="flex justify-center my-6">
          <LoadingSpinner size="md" text={null} />
        </div>
      )}

      {!hasMore && activities.length > 0 && (
        <p className="text-center text-muted text-sm py-6">
          You've seen all activity! 🎉
        </p>
      )}
    </div>
  );
};

export default ActivityPage;
