/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  BookOpen,
  FileText,
  Edit3,
  Heart,
  MoreHorizontal,
  Activity,
  Settings,
  Shield,
  UserX,
  Eye,
  MessageCircle,
  Code,
  X,
  Mail,
  Grid3X3,
  Bookmark,
  User,
  Globe,
  Briefcase,
} from "lucide-react";
import api from "../services/api";
import LoadingSpinner from "../components/common/LoadingSpinner";

const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

// ✅ دالة للحصول على الرابط الصحيح
const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${BASE_URL}${url}`;
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [postsHasMore, setPostsHasMore] = useState(false);
  const [postsLoadingMore, setPostsLoadingMore] = useState(false);

  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsPage, setBlogsPage] = useState(1);
  const [blogsHasMore, setBlogsHasMore] = useState(false);
  const [blogsLoadingMore, setBlogsLoadingMore] = useState(false);

  const [savedItems, setSavedItems] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedPage, setSavedPage] = useState(1);
  const [savedHasMore, setSavedHasMore] = useState(false);
  const [savedLoadingMore, setSavedLoadingMore] = useState(false);

  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedLoading, setBlockedLoading] = useState(false);
  const [unblockLoading, setUnblockLoading] = useState({});
  const [showBlockedList, setShowBlockedList] = useState(false);

  const isLoadingRef = useRef(false);
  const menuRef = useRef(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/show-me");
      setProfile(response.data.data);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockedUsers = async () => {
    setBlockedLoading(true);
    try {
      const response = await api.get("/blocks");
      setBlockedUsers(response.data.data || []);
    } catch (err) {
      console.error("Error fetching blocked users:", err);
    } finally {
      setBlockedLoading(false);
    }
  };

  const handleUnblock = async (userId, username) => {
    if (!confirm(`Are you sure you want to unblock @${username}?`)) return;
    setUnblockLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await api.delete(`/users/${username}/block`);
      setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
      alert(`@${username} has been unblocked.`);
    } catch (error) {
      console.error("Unblock error:", error);
      alert("Failed to unblock user.");
    } finally {
      setUnblockLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowOptionsMenu(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchUserPosts = async (pageNum = 1, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setPostsLoading(true);
    try {
      const response = await api.get(
        `/users/${profile.username}/posts?page=${pageNum}&per_page=10`,
      );
      const newPosts = response.data.data;
      const pagination = response.data.pagination;
      if (append) setPosts((prev) => [...prev, ...newPosts]);
      else setPosts(newPosts);
      setPostsHasMore(pagination.current_page < pagination.last_page);
    } catch (err) {
      console.error("Error fetching user posts:", err);
    } finally {
      setPostsLoading(false);
      setPostsLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  const fetchUserBlogs = async (pageNum = 1, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setBlogsLoading(true);
    try {
      const response = await api.get(
        `/users/${profile.username}/blogs?page=${pageNum}&per_page=10`,
      );
      const newBlogs = response.data.data;
      const pagination = response.data.pagination;
      if (append) setBlogs((prev) => [...prev, ...newBlogs]);
      else setBlogs(newBlogs);
      setBlogsHasMore(pagination.current_page < pagination.last_page);
    } catch (err) {
      console.error("Error fetching user blogs:", err);
    } finally {
      setBlogsLoading(false);
      setBlogsLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  const fetchSavedItems = async (pageNum = 1, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setSavedLoading(true);
    try {
      const [postsRes, blogsRes] = await Promise.all([
        api.get(`/saved?type=post&page=${pageNum}&per_page=10`),
        api.get(`/saved?type=blog&page=${pageNum}&per_page=10`),
      ]);
      const postsData = postsRes.data.data || [];
      const blogsData = blogsRes.data.data || [];
      const allItems = [...postsData, ...blogsData].sort(
        (a, b) => new Date(b.saved_at) - new Date(a.saved_at),
      );
      if (append) setSavedItems((prev) => [...prev, ...allItems]);
      else setSavedItems(allItems);
      const postsPagination = postsRes.data.pagination;
      const blogsPagination = blogsRes.data.pagination;
      setSavedHasMore(
        postsPagination.has_more_pages || blogsPagination.has_more_pages,
      );
    } catch (err) {
      console.error("Error fetching saved items:", err);
    } finally {
      setSavedLoading(false);
      setSavedLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    if (profile?.username) {
      if (activeTab === "posts") {
        setPosts([]);
        setPostsPage(1);
        fetchUserPosts(1, false);
      } else if (activeTab === "blogs") {
        setBlogs([]);
        setBlogsPage(1);
        fetchUserBlogs(1, false);
      } else if (activeTab === "saved") {
        setSavedItems([]);
        setSavedPage(1);
        fetchSavedItems(1, false);
      }
    }
  }, [activeTab, profile?.username]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatRelativeDate = (dateString) => {
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

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "junior":
        return "bg-[#5CA1FC]/15 text-[#5CA1FC]";
      case "senior":
        return "bg-purple-500/20 text-purple-400";
      case "expert":
        return "bg-[#5CA1FC]/20 text-[#5CA1FC]";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case "junior":
        return "🌟";
      case "senior":
        return "🔥";
      case "expert":
        return "🏆";
      default:
        return "⭐";
    }
  };

  const getSocialLabel = (url) => {
    if (!url) return "Link";
    if (url.includes("github")) return "GitHub";
    if (url.includes("twitter") || url.includes("x.com")) return "Twitter/X";
    if (url.includes("linkedin")) return "LinkedIn";
    if (url.includes("instagram")) return "Instagram";
    if (url.includes("facebook")) return "Facebook";
    return "Link";
  };

  const loadMore = () => {
    if (activeTab === "posts") {
      if (postsLoadingMore || !postsHasMore) return;
      setPostsLoadingMore(true);
      const nextPage = postsPage + 1;
      setPostsPage(nextPage);
      fetchUserPosts(nextPage, true);
    } else if (activeTab === "blogs") {
      if (blogsLoadingMore || !blogsHasMore) return;
      setBlogsLoadingMore(true);
      const nextPage = blogsPage + 1;
      setBlogsPage(nextPage);
      fetchUserBlogs(nextPage, true);
    } else if (activeTab === "saved") {
      if (savedLoadingMore || !savedHasMore) return;
      setSavedLoadingMore(true);
      const nextPage = savedPage + 1;
      setSavedPage(nextPage);
      fetchSavedItems(nextPage, true);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 500
      )
        loadMore();
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab, postsHasMore, blogsHasMore, savedHasMore]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-error mb-3">{error || "Profile not found"}</p>
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

  const rankingPercentage = Math.min(
    (profile.ranking_points / 10000) * 100,
    100,
  );

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Cover Image */}
      <div className="relative h-48 md:h-56 rounded-xl overflow-hidden mb-16">
        {profile.cover_image_url ? (
          <img
            src={getImageUrl(profile.cover_image_url)}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#5CA1FC]/40 via-purple-500/20 to-bg">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-muted text-sm">Cover image</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Avatar */}
      <div className="relative px-6">
        <div className="absolute -top-32 left-6 md:left-8">
          <img
            src={getImageUrl(profile.avatar_url)}
            alt={profile.name}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-bg object-cover shadow-xl"
          />
        </div>
      </div>

      {/* ======================== قسم المعلومات ======================== */}
      <div className="ml-6 md:ml-8 mt-16">
        {/* الصف الأول: الاسم (بتدرج) + البادج وزر التعديل */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="gradient-title text-2xl md:text-3xl font-bold">
              {profile.name}
            </h1>
            <span
              className={`text-xs px-3 py-1 rounded-full ${getBadgeColor(profile.badge)} flex items-center gap-1.5 font-medium`}
            >
              <span>{getBadgeIcon(profile.badge)}</span>
              {profile.badge}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/edit-profile")}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white font-medium transition-all duration-300 flex items-center gap-2 hover:text-[#5CA1FC] hover:scale-[1.02]"
            >
              <Edit3 size={16} />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <MoreHorizontal size={20} className="text-muted" />
              </button>
              {showOptionsMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-panel border border-panelEdge rounded-lg shadow-panel z-10 py-1">
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      navigate("/activity");
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                  >
                    <Activity size={16} /> Activity
                  </button>
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowBlockedList(true);
                      fetchBlockedUsers();
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                  >
                    <Shield size={16} /> Blocked Users
                  </button>
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      navigate("/drafts");
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                  >
                    <FileText size={16} /> Drafts
                  </button>
                  <button
                    onClick={() => {
                      setShowOptionsMenu(false);
                      navigate("/settings");
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                  >
                    <Settings size={16} /> Settings
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* الصف الثاني: اليوزرنيم + الإيميل */}
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <p className="text-muted text-sm">@{profile.username}</p>
          {profile.email && (
            <>
              <span className="text-muted text-xs">•</span>
              <div className="flex items-center gap-1 text-sm text-muted">
                <Mail size={14} />
                <span>{profile.email}</span>
              </div>
            </>
          )}
        </div>

        {/* الصف الثالث: البايو (بحاوية خفيفة) */}
        {profile.bio && (
          <div className="mt-3 p-4 bg-white/5 border border-panelEdge/30 rounded-xl max-w-2xl">
            <p className="text-muted text-sm leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* الصف الرابع: الموقع + الويبسايت + تاريخ الانضمام */}
        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted">
          {profile.location && (
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
              <MapPin size={14} className="text-[#5CA1FC]" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.website && (
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
              <Globe size={14} className="text-[#5CA1FC]" />
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#5CA1FC] transition-colors"
              >
                {profile.website.replace(/^https?:\/\//, "").slice(0, 30)}
              </a>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full">
            <Calendar size={14} className="text-[#5CA1FC]" />
            <span>Joined {formatDate(profile.joined_at)}</span>
          </div>
        </div>

        {/* الصف الخامس: الروابط الاجتماعية */}
        {profile.social_links && profile.social_links.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-muted mr-1">Connect:</span>
            {profile.social_links.map((link, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-[#5CA1FC]/10 rounded-full transition-all duration-300 text-muted hover:text-[#5CA1FC] text-xs hover:scale-[1.05]"
              >
                <LinkIcon size={12} />
                <span>{getSocialLabel(link)}</span>
              </a>
            ))}
          </div>
        )}

        {/* الصف السادس: التاجات */}
        {profile.tags && profile.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs text-muted mr-1">Skills:</span>
            {profile.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs px-3 py-1 bg-[#5CA1FC]/10 text-[#5CA1FC] rounded-full hover:bg-[#5CA1FC]/20 transition-colors cursor-default"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* الصف السابع: الإحصائيات + Ranking Points */}
        <div className="flex flex-wrap items-center gap-8 mt-4 pt-4 border-t border-panelEdge/50">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-xl font-bold text-white">
                {profile.posts_count || 0}
              </p>
              <p className="text-xs text-muted">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">
                {profile.blogs_count || 0}
              </p>
              <p className="text-xs text-muted">Blogs</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">
                {profile.followers_count || 0}
              </p>
              <p className="text-xs text-muted">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-white">
                {profile.following_count || 0}
              </p>
              <p className="text-xs text-muted">Following</p>
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted">Ranking Points</span>
              <span className="text-xs font-semibold text-[#5CA1FC]">
                {profile.ranking_points || 0} / 10,000
              </span>
            </div>
            <div className="w-full h-1.5 bg-panel rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5CA1FC] to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${rankingPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-muted mt-0.5">
              {rankingPercentage === 100
                ? "🏆 Maximum level reached!"
                : `${Math.round(rankingPercentage)}% to next level`}
            </p>
          </div>
        </div>
      </div>
      {/* ======================== نهاية قسم المعلومات ======================== */}

      {/* Tabs */}
      <div className="mt-8 border-t border-panelEdge pt-6">
        <div className="flex gap-8 justify-center">
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-3 text-base font-medium transition-colors relative ${
              activeTab === "posts"
                ? "text-[#5CA1FC]"
                : "text-muted hover:text-white"
            }`}
          >
            <Grid3X3 size={18} className="inline mr-2" />
            POSTS
            {activeTab === "posts" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5CA1FC]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`pb-3 text-base font-medium transition-colors relative ${
              activeTab === "blogs"
                ? "text-[#5CA1FC]"
                : "text-muted hover:text-white"
            }`}
          >
            <BookOpen size={18} className="inline mr-2" />
            BLOGS
            {activeTab === "blogs" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5CA1FC]"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-3 text-base font-medium transition-colors relative ${
              activeTab === "saved"
                ? "text-[#5CA1FC]"
                : "text-muted hover:text-white"
            }`}
          >
            <Bookmark size={18} className="inline mr-2" />
            SAVED
            {activeTab === "saved" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5CA1FC]"></div>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* POSTS TAB */}
        {activeTab === "posts" && (
          <>
            {postsLoading && posts.length === 0 ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="md" text="Loading posts..." />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 glass-card">
                <FileText size={48} className="text-muted mx-auto mb-3" />
                <p className="text-muted">No posts yet</p>
                <p className="text-label text-sm mt-1">
                  Share your first post!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/posts/${post.id}`}
                    className="group block glass-card overflow-hidden hover:border-[#5CA1FC]/40 transition-all duration-300"
                  >
                    {post.photos && post.photos.length > 0 ? (
                      <div className="relative aspect-square">
                        <img
                          src={getImageUrl(post.photos[0].url)}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <p className="text-white text-sm font-medium line-clamp-2">
                            {post.title}
                          </p>
                        </div>
                        <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 rounded-full px-2 py-1 text-xs text-white">
                          <Heart size={12} className="fill-white" />
                          <span>{post.likes_count || 0}</span>
                          <MessageCircle size={12} />
                          <span>{post.comments_count || 0}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-1 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-muted text-sm line-clamp-3">
                          {post.body}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Heart size={12} /> {post.likes_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} />{" "}
                            {post.comments_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> {post.views_count || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
                {postsLoadingMore && (
                  <div className="col-span-full flex justify-center py-4">
                    <LoadingSpinner size="sm" text={null} />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* BLOGS TAB */}
        {activeTab === "blogs" && (
          <>
            {blogsLoading && blogs.length === 0 ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="md" text="Loading blogs..." />
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12 glass-card">
                <BookOpen size={48} className="text-muted mx-auto mb-3" />
                <p className="text-muted">No blogs yet</p>
                <p className="text-label text-sm mt-1">
                  Write your first blog!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    to={`/blogs/${blog.id}`}
                    className="group block glass-card overflow-hidden hover:border-[#5CA1FC]/40 transition-all duration-300"
                  >
                    {blog.cover_image_url ? (
                      <div className="relative aspect-square">
                        <img
                          src={getImageUrl(blog.cover_image_url)}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <p className="text-white text-sm font-medium line-clamp-2">
                            {blog.title}
                          </p>
                        </div>
                        <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 rounded-full px-2 py-1 text-xs text-white">
                          <Heart size={12} className="fill-white" />
                          <span>{blog.likes_count || 0}</span>
                          <MessageCircle size={12} />
                          <span>{blog.comments_count || 0}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <h3 className="text-white font-semibold mb-1 line-clamp-2">
                          {blog.title}
                        </h3>
                        <p className="text-muted text-sm line-clamp-3">
                          {blog.subtitle}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Heart size={12} /> {blog.likes_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} />{" "}
                            {blog.comments_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> {blog.views_count || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </Link>
                ))}
                {blogsLoadingMore && (
                  <div className="col-span-full flex justify-center py-4">
                    <LoadingSpinner size="sm" text={null} />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* SAVED TAB */}
        {activeTab === "saved" && (
          <>
            {savedLoading && savedItems.length === 0 ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="md" text="Loading saved items..." />
              </div>
            ) : savedItems.length === 0 ? (
              <div className="text-center py-12 glass-card">
                <Heart size={48} className="text-muted mx-auto mb-3" />
                <p className="text-muted">No saved items yet</p>
                <p className="text-label text-sm mt-1">
                  Save posts and blogs to see them here
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {savedItems.map((item, idx) => {
                  const content = item.data;
                  const isBlog = item.kind === "blog";
                  const coverImage = isBlog
                    ? content.cover_image_url
                    : content.photos?.[0]?.url;

                  return (
                    <Link
                      key={idx}
                      to={
                        isBlog ? `/blogs/${content.id}` : `/posts/${content.id}`
                      }
                      className="group block glass-card overflow-hidden hover:border-[#5CA1FC]/40 transition-all duration-300"
                    >
                      {coverImage ? (
                        <div className="relative aspect-square">
                          <img
                            src={getImageUrl(coverImage)}
                            alt={content.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <p className="text-white text-sm font-medium line-clamp-2">
                              {content.title}
                            </p>
                          </div>
                          <div className="absolute top-2 left-2 bg-[#5CA1FC]/80 text-white text-[10px] px-2 py-0.5 rounded-full">
                            {isBlog ? "BLOG" : "POST"}
                          </div>
                          <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/50 rounded-full px-2 py-1 text-xs text-white">
                            <Heart size={12} className="fill-white" />
                            <span>{content.likes_count || 0}</span>
                            <MessageCircle size={12} />
                            <span>{content.comments_count || 0}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <span className="text-[10px] px-2 py-0.5 bg-[#5CA1FC]/15 text-[#5CA1FC] rounded-full inline-block mb-2">
                            {isBlog ? "BLOG" : "POST"}
                          </span>
                          <h3 className="text-white font-semibold mb-1 line-clamp-2">
                            {content.title}
                          </h3>
                          <p className="text-muted text-sm line-clamp-3">
                            {isBlog ? content.subtitle : content.body}
                          </p>
                        </div>
                      )}
                    </Link>
                  );
                })}
                {savedLoadingMore && (
                  <div className="col-span-full flex justify-center py-4">
                    <LoadingSpinner size="sm" text={null} />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Blocked Users Modal */}
      {showBlockedList && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-panel border border-panelEdge rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col shadow-panel mx-4">
            <div className="flex items-center justify-between p-4 border-b border-panelEdge">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield size={20} className="text-error" /> Blocked Users
              </h2>
              <button
                onClick={() => setShowBlockedList(false)}
                className="p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={20} className="text-muted hover:text-white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {blockedLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" text="Loading blocked users..." />
                </div>
              ) : blockedUsers.length === 0 ? (
                <div className="text-center py-8">
                  <UserX size={48} className="text-muted mx-auto mb-3" />
                  <p className="text-muted">No blocked users</p>
                  <p className="text-label text-sm mt-1">
                    When you block someone, they'll appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blockedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="bg-panel/90 backdrop-blur-sm border border-panelEdge rounded-xl p-3 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-white font-medium">
                            {user.name}
                          </h3>
                          <p className="text-muted text-sm">@{user.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnblock(user.id, user.username)}
                        disabled={unblockLoading[user.id]}
                        className="px-3 py-1.5 bg-error/20 hover:bg-error/30 text-error rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        {unblockLoading[user.id] ? "..." : "Unblock"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
