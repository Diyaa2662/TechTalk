/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  BookOpen,
  FileText,
  Heart,
  UserPlus,
  UserCheck,
  Eye,
  MessageCircle,
  Shield,
  ShieldOff,
  MoreHorizontal,
  Flag,
  UserX,
  X,
  Code,
} from "lucide-react";
import api from "../services/api";

// أيقونات SVG لوسائل التواصل
const GithubIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const TwitterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const UserProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  // Posts states
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [postsHasMore, setPostsHasMore] = useState(false);
  const [postsLoadingMore, setPostsLoadingMore] = useState(false);

  // Blogs states
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsPage, setBlogsPage] = useState(1);
  const [blogsHasMore, setBlogsHasMore] = useState(false);
  const [blogsLoadingMore, setBlogsLoadingMore] = useState(false);

  // Report states
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reporting, setReporting] = useState(false);

  const isLoadingRef = useRef(false);

  // جلب بيانات المستخدم
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/users/${username}/profile`);
      const profileData = response.data.data;
      setProfile(profileData);
      setIsFollowing(profileData.is_following || false);
      setFollowersCount(profileData.followers_count || 0);
      setFollowingCount(profileData.following_count || 0);

      // تسجيل مشاهدة المستخدم
      const viewedKey = `user_profile_viewed_${username}`;
      const hasViewed = sessionStorage.getItem(viewedKey);

      if (!hasViewed && profileData.id) {
        try {
          await api.post("/views", {
            type: "profile",
            id: profileData.id,
          });
          sessionStorage.setItem(viewedKey, "true");
        } catch (error) {
          console.error("Error recording view:", error);
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("User not found");
    } finally {
      setLoading(false);
    }
  };

  // جلب بوستات المستخدم
  const fetchUserPosts = async (pageNum = 1, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setPostsLoading(true);

    try {
      const response = await api.get(
        `/users/${username}/posts?page=${pageNum}&per_page=10`,
      );
      const newPosts = response.data.data;
      const pagination = response.data.pagination;

      if (append) {
        setPosts((prev) => [...prev, ...newPosts]);
      } else {
        setPosts(newPosts);
      }
      setPostsHasMore(pagination.current_page < pagination.last_page);
    } catch (err) {
      console.error("Error fetching user posts:", err);
    } finally {
      setPostsLoading(false);
      setPostsLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  // جلب مقالات المستخدم
  const fetchUserBlogs = async (pageNum = 1, append = false) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;
    setBlogsLoading(true);

    try {
      const response = await api.get(
        `/users/${username}/blogs?page=${pageNum}&per_page=10`,
      );
      const newBlogs = response.data.data;
      const pagination = response.data.pagination;

      if (append) {
        setBlogs((prev) => [...prev, ...newBlogs]);
      } else {
        setBlogs(newBlogs);
      }
      setBlogsHasMore(pagination.current_page < pagination.last_page);
    } catch (err) {
      console.error("Error fetching user blogs:", err);
    } finally {
      setBlogsLoading(false);
      setBlogsLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  // تحميل البيانات حسب التاب النشط
  useEffect(() => {
    if (username && profile) {
      if (activeTab === "posts") {
        setPosts([]);
        setPostsPage(1);
        fetchUserPosts(1, false);
      } else if (activeTab === "blogs") {
        setBlogs([]);
        setBlogsPage(1);
        fetchUserBlogs(1, false);
      }
    }
  }, [activeTab, username, profile?.id]);

  // متابعة المستخدم
  const handleFollow = async () => {
    if (followingLoading) return;
    setFollowingLoading(true);

    try {
      const response = await api.post(`/users/${profile.username}/follow`);
      setIsFollowing(response.data.data?.is_following || true);
      setFollowersCount(
        response.data.data?.followers_count || followersCount + 1,
      );
    } catch (error) {
      console.error("Follow error:", error);
      alert("Failed to follow user.");
    } finally {
      setFollowingLoading(false);
    }
  };

  // إلغاء متابعة المستخدم
  const handleUnfollow = async () => {
    if (followingLoading) return;
    setFollowingLoading(true);

    try {
      const response = await api.delete(`/users/${profile.username}/follow`);
      setIsFollowing(response.data.data?.is_following || false);
      setFollowersCount(
        response.data.data?.followers_count || followersCount - 1,
      );
    } catch (error) {
      console.error("Unfollow error:", error);
      alert("Failed to unfollow user.");
    } finally {
      setFollowingLoading(false);
    }
  };

  // حظر المستخدم
  const handleBlock = async () => {
    if (blockLoading) return;
    setBlockLoading(true);

    if (
      !confirm(
        `Are you sure you want to block @${profile.username}? They won't be able to interact with you.`,
      )
    ) {
      setBlockLoading(false);
      return;
    }

    try {
      await api.post(`/users/${profile.username}/block`);
      setIsBlocked(true);
      alert(`@${profile.username} has been blocked.`);
      navigate("/");
    } catch (error) {
      console.error("Block error:", error);
      alert("Failed to block user.");
    } finally {
      setBlockLoading(false);
      setShowMenu(false);
    }
  };

  // التبليغ عن مستخدم
  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert("Please provide a reason for reporting.");
      return;
    }

    if (!profile?.id) {
      alert("Unable to report user: User ID not found.");
      return;
    }

    setReporting(true);
    try {
      await api.post("/reports", {
        kind: "user",
        id: profile.id,
        reason: reportReason,
        details: reportDetails || null,
      });
      alert("User reported successfully. Our team will review it.");
      setReportModalOpen(false);
      setReportReason("");
      setReportDetails("");
    } catch (error) {
      console.error("Report error:", error);
      alert("Failed to report user. Please try again.");
    } finally {
      setReporting(false);
    }
  };

  // تحميل المزيد
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
    }
  };

  // كشف التمرير
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 500
      ) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab, postsHasMore, blogsHasMore]);

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
        return "bg-accent/15 text-accent";
      case "senior":
        return "bg-purple-500/20 text-purple-400";
      case "expert":
        return "bg-accent/20 text-accent";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getSocialIcon = (url) => {
    if (url.includes("github")) return <GithubIcon />;
    if (url.includes("twitter") || url.includes("x.com"))
      return <TwitterIcon />;
    if (url.includes("linkedin")) return <LinkedInIcon />;
    return null;
  };

  useEffect(() => {
    const handleClickOutside = () => setShowMenu(false);
    if (showMenu) {
      window.addEventListener("click", handleClickOutside);
      return () => window.removeEventListener("click", handleClickOutside);
    }
  }, [showMenu]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-accent/20 border-t-accent rounded-full animate-spin"></div>
          <p className="text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-error mb-3">{error || "User not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg font-semibold transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-error/20 flex items-center justify-center">
            <UserX size={40} className="text-error" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">User Blocked</h2>
          <p className="text-muted mb-4">You have blocked @{username}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-accent hover:bg-accentHover text-white rounded-lg font-semibold transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Cover Image */}
      <div className="relative h-48 md:h-56 rounded-xl overflow-hidden">
        {profile.cover_image_url ? (
          <img
            src={profile.cover_image_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-accent/40 via-purple-500/20 to-bg">
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
        <div className="absolute -top-16 left-6 md:left-8">
          <img
            src={profile.avatar_url}
            alt={profile.name}
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-bg object-cover shadow-xl"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="ml-6 md:ml-8 mt-20">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {profile.name}
              </h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColor(profile.badge)}`}
              >
                {profile.badge}
              </span>
            </div>
            <p className="text-muted text-sm mt-1">@{profile.username}</p>

            {profile.bio && (
              <p className="text-muted mt-3 max-w-md">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon size={14} />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent transition-colors"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Joined {formatDate(profile.joined_at)}</span>
              </div>
            </div>

            {profile.social_links && profile.social_links.length > 0 && (
              <div className="flex gap-3 mt-3">
                {profile.social_links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-accent transition-colors"
                  >
                    {getSocialIcon(link)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Actions Buttons */}
          <div className="flex items-center gap-2">
            {isFollowing ? (
              <button
                onClick={handleUnfollow}
                disabled={followingLoading}
                className="px-5 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
              >
                <UserCheck size={18} />
                {followingLoading ? "..." : "Following"}
              </button>
            ) : (
              <button
                onClick={handleFollow}
                disabled={followingLoading}
                className="px-5 py-2 bg-accent hover:bg-accentHover text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-accent-sm"
              >
                <UserPlus size={18} />
                {followingLoading ? "..." : "Follow"}
              </button>
            )}

            {/* More Options Menu */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <MoreHorizontal size={20} className="text-muted" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-panel border border-panelEdge rounded-lg shadow-panel z-10 py-1">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setReportModalOpen(true);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <Flag size={16} />
                    Report User
                  </button>
                  <button
                    onClick={handleBlock}
                    disabled={blockLoading}
                    className="w-full px-4 py-2 text-left text-sm text-error hover:bg-white/5 flex items-center gap-2"
                  >
                    <Shield size={16} />
                    {blockLoading ? "Blocking..." : "Block User"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-10 mt-6">
          <div className="text-center">
            <p className="text-xl font-bold text-white">
              {profile.posts_count || 0}
            </p>
            <p className="text-xs text-muted">posts</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">
              {profile.blogs_count || 0}
            </p>
            <p className="text-xs text-muted">blogs</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">{followersCount}</p>
            <p className="text-xs text-muted">followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">{followingCount}</p>
            <p className="text-xs text-muted">following</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">
              {profile.ranking_points || 0}
            </p>
            <p className="text-xs text-muted">points</p>
          </div>
        </div>

        {profile.tags && profile.tags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-1 bg-accent/10 text-accent rounded-full"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-10 border-t border-panelEdge pt-6">
        <div className="flex gap-12 justify-center">
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-3 text-base font-medium transition-colors relative ${
              activeTab === "posts"
                ? "text-accent"
                : "text-muted hover:text-white"
            }`}
          >
            POSTS
            {activeTab === "posts" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`pb-3 text-base font-medium transition-colors relative ${
              activeTab === "blogs"
                ? "text-accent"
                : "text-muted hover:text-white"
            }`}
          >
            BLOGS
            {activeTab === "blogs" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></div>
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
                <div className="w-8 h-8 border-3 border-accent/20 border-t-accent rounded-full animate-spin"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="text-muted mx-auto mb-3" />
                <p className="text-muted">No posts yet</p>
                <p className="text-label text-sm mt-1">
                  This user hasn't posted anything yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/posts/${post.id}`}
                    className="block bg-panel/90 backdrop-blur-sm border border-panelEdge rounded-xl p-4 hover:border-accent/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span>{formatRelativeDate(post.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <div className="flex items-center gap-1">
                          <Heart size={12} />
                          <span>{post.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          <span>{post.comments_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={12} />
                          <span>{post.views_count}</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-1">
                      {post.title}
                    </h3>
                    <p className="text-muted text-sm line-clamp-2">
                      {post.body}
                    </p>
                    {post.code && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted">
                        <Code size={12} />
                        <span>{post.code_language}</span>
                      </div>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs px-1.5 py-0.5 bg-accent/10 text-accent rounded-full"
                          >
                            #{tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
                {postsLoadingMore && (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
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
                <div className="w-8 h-8 border-3 border-accent/20 border-t-accent rounded-full animate-spin"></div>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={48} className="text-muted mx-auto mb-3" />
                <p className="text-muted">No blogs yet</p>
                <p className="text-label text-sm mt-1">
                  This user hasn't written any blogs yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    to={`/blogs/${blog.id}`}
                    className="block bg-panel/90 backdrop-blur-sm border border-panelEdge rounded-xl p-4 hover:border-accent/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span>{formatRelativeDate(blog.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <div className="flex items-center gap-1">
                          <Heart size={12} />
                          <span>{blog.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle size={12} />
                          <span>{blog.comments_count}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={12} />
                          <span>{blog.views_count}</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-white font-semibold mb-1">
                      {blog.title}
                    </h3>
                    <p className="text-muted text-sm line-clamp-2">
                      {blog.subtitle}
                    </p>
                    {blog.reading_time && (
                      <div className="mt-2 text-xs text-muted">
                        📖 {blog.reading_time}
                      </div>
                    )}
                  </Link>
                ))}
                {blogsLoadingMore && (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-panel border border-panelEdge rounded-2xl w-full max-w-md p-6 shadow-panel mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Flag size={20} className="text-error" />
                Report User
              </h3>
              <button
                onClick={() => {
                  setReportModalOpen(false);
                  setReportReason("");
                  setReportDetails("");
                }}
                className="p-1 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X size={20} className="text-muted hover:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-label mb-1">
                  Reason <span className="text-error">*</span>
                </label>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Why are you reporting this user?"
                  rows="3"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-label mb-1">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Any additional information..."
                  rows="2"
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setReportModalOpen(false);
                  setReportReason("");
                  setReportDetails("");
                }}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={reporting}
                className="flex-1 px-4 py-2 bg-error hover:bg-error/80 text-white rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reporting ? "Reporting..." : "Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
