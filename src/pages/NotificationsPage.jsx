import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell,
  CheckCheck,
  Eye,
  MessageCircle,
  Heart,
  ThumbsDown,
  Code,
  Shield,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const isLoadingRef = useRef(false);
  const currentPageRef = useRef(1);

  // جلب عدد الإشعارات غير المقروءة
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response.data.data?.unread_count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // جلب الإشعارات
  const fetchNotifications = async (pageNum = 1, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      const response = await api.get(
        `/notifications?page=${pageNum}&per_page=20`,
      );

      const newNotifications = response.data.data;
      const pagination = response.data.pagination;

      if (append) {
        setNotifications((prev) => [...prev, ...newNotifications]);
      } else {
        setNotifications(newNotifications);
      }

      setHasMore(pagination.current_page < pagination.last_page);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please refresh the page.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  // تحميل أول صفحة
  useEffect(() => {
    currentPageRef.current = 1;
    setPage(1);
    setNotifications([]);
    setHasMore(true);
    setLoading(true);
    fetchNotifications(1, false);
    fetchUnreadCount();
  }, []);

  // تحميل المزيد عند التمرير
  const loadMore = useCallback(() => {
    if (loadingMore || isLoadingRef.current || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    currentPageRef.current = nextPage;
    fetchNotifications(nextPage, true);
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

  // تحديث إشعار واحد إلى مقروء (باستخدام الـ endpoint الجديد)
  const markAsRead = async (notificationId) => {
    try {
      // ✅ التعديل هنا: نرسل الـ ID في الـ body بدل المسار
      await api.patch("/notifications/read", {
        id: notificationId,
      });

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read_at: new Date().toISOString() }
            : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // تحديث كل الإشعارات إلى مقروءة
  const markAllAsRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);

    try {
      await api.patch("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read_at: new Date().toISOString() })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setMarkingAll(false);
    }
  };

  // الحصول على رابط حسب نوع الإشعار
  const getNotificationLink = (notification) => {
    const { entity, context } = notification;

    if (entity?.type === "comment") {
      if (context?.post_id) {
        return `/posts/${context.post_id}`;
      } else if (context?.blog_id) {
        return `/blogs/${context.blog_id}`;
      }
    }

    return "#";
  };

  // معالجة الضغط على الإشعار
  const handleNotificationClick = async (notification) => {
    const link = getNotificationLink(notification);

    if (!notification.read_at) {
      await markAsRead(notification.id);
    }

    if (link !== "#") {
      navigate(link);
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

  // الحصول على أيقونة حسب نوع الإشعار
  const getNotificationIcon = (type) => {
    switch (type) {
      case "comment_verified":
        return <Code size={18} className="text-accent" />;
      case "like":
        return <Heart size={18} className="text-error" />;
      case "dislike":
        return <ThumbsDown size={18} className="text-accent" />;
      case "comment":
        return <MessageCircle size={18} className="text-accent" />;
      case "follow":
        return <User size={18} className="text-accent" />;
      default:
        return <Bell size={18} className="text-muted" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" text="Loading notifications..." />
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

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={28} className="text-accent" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <h1 className="gradient-title text-2xl font-bold">Notifications</h1>
        </div>

        {notifications.length > 0 && unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-accent hover:text-accent/80 transition-colors disabled:opacity-50"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 glass-card">
          <Bell size={48} className="text-muted mx-auto mb-3" />
          <p className="text-muted text-lg">No notifications yet</p>
          <p className="text-label text-sm mt-1">
            When you get notifications, they'll appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const isRead = !!notification.read_at;
            const link = getNotificationLink(notification);
            const hasLink = link !== "#";

            return (
              <div
                key={notification.id}
                onClick={() => hasLink && handleNotificationClick(notification)}
                className={`group relative glass-card p-4 transition-all duration-200 ${
                  isRead
                    ? "hover:border-accent/30"
                    : "border-accent/50 bg-accent/5 hover:border-accent"
                } ${hasLink ? "cursor-pointer" : "cursor-default"}`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className={`text-sm font-semibold ${isRead ? "text-muted" : "text-white"}`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-sm text-muted mt-0.5">
                          {notification.body}
                        </p>
                        {notification.context?.ranking_points_delta && (
                          <p className="text-xs text-success mt-1">
                            +{notification.context.ranking_points_delta} points
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted whitespace-nowrap">
                          {formatDate(notification.created_at)}
                        </span>

                        {!isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs text-accent hover:text-accent/80 transition-colors"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unread indicator dot */}
                {!isRead && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full"></div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Loading More */}
      {loadingMore && (
        <div className="flex justify-center my-6">
          <LoadingSpinner size="md" text={null} />
        </div>
      )}

      {/* End of list */}
      {!hasMore && notifications.length > 0 && (
        <p className="text-center text-muted text-sm py-6">
          You've seen all notifications! 🎉
        </p>
      )}
    </div>
  );
};

export default NotificationsPage;
