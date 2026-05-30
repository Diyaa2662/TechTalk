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

  // تحديث إشعار واحد إلى مقروء
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);

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

    // إذا كان الإشعار غير مقروء، نحدثه إلى مقروء
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }

    // التوجيه إلى المحتوى المرتبط
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
        return <Code size={18} className="text-green-400" />;
      case "like":
        return <Heart size={18} className="text-red-400" />;
      case "dislike":
        return <ThumbsDown size={18} className="text-yellowShade" />;
      case "comment":
        return <MessageCircle size={18} className="text-blue-400" />;
      case "follow":
        return <User size={18} className="text-purple-400" />;
      default:
        return <Bell size={18} className="text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading notifications...</p>
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

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={28} className="text-yellowShade" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
        </div>

        {notifications.length > 0 && unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={markingAll}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-yellowShade hover:text-yellowShade/80 transition-colors disabled:opacity-50"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl">
          <Bell size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 text-lg">No notifications yet</p>
          <p className="text-gray-500 text-sm mt-1">
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
                className={`group relative bg-white/5 backdrop-blur-md border rounded-xl p-4 transition-all duration-200 hover:border-yellowShade/30 ${
                  isRead
                    ? "border-white/10"
                    : "border-yellowShade/30 bg-yellowShade/5"
                } ${hasLink ? "cursor-pointer hover:bg-white/10" : "cursor-default"}`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3
                          className={`text-sm font-semibold ${isRead ? "text-gray-400" : "text-white"}`}
                        >
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {notification.body}
                        </p>
                        {notification.context?.ranking_points_delta && (
                          <p className="text-xs text-green-400 mt-1">
                            +{notification.context.ranking_points_delta} points
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(notification.created_at)}
                        </span>

                        {!isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs text-yellowShade hover:text-yellowShade/80 transition-colors"
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
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellowShade rounded-r-full"></div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Loading More */}
      {loadingMore && (
        <div className="flex justify-center my-6">
          <div className="w-8 h-8 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
        </div>
      )}

      {/* End of list */}
      {!hasMore && notifications.length > 0 && (
        <p className="text-center text-gray-500 text-sm py-6">
          You've seen all notifications! 🎉
        </p>
      )}
    </div>
  );
};

export default NotificationsPage;
