/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
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
  Eye,
  MessageCircle,
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

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("posts");

  // States for posts
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [postsHasMore, setPostsHasMore] = useState(false);
  const [postsLoadingMore, setPostsLoadingMore] = useState(false);

  // States for blogs
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsPage, setBlogsPage] = useState(1);
  const [blogsHasMore, setBlogsHasMore] = useState(false);
  const [blogsLoadingMore, setBlogsLoadingMore] = useState(false);

  // States for saved
  const [savedItems, setSavedItems] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedPage, setSavedPage] = useState(1);
  const [savedHasMore, setSavedHasMore] = useState(false);
  const [savedLoadingMore, setSavedLoadingMore] = useState(false);

  const isLoadingRef = useRef(false);

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

  // جلب البوستات المنشورة
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

  // جلب المقالات المنشورة
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

  // جلب المحفوظات (بوستات + مقالات)
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

      if (append) {
        setSavedItems((prev) => [...prev, ...allItems]);
      } else {
        setSavedItems(allItems);
      }

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

  // تحميل البيانات حسب التاب النشط
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
        return "bg-blue-500/20 text-blue-400";
      case "senior":
        return "bg-purple-500/20 text-purple-400";
      case "expert":
        return "bg-yellowShade/20 text-yellowShade";
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
      ) {
        loadMore();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeTab, postsHasMore, blogsHasMore, savedHasMore]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-red-400 mb-3">{error || "Profile not found"}</p>
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
          <div className="w-full h-full bg-gradient-to-r from-yellowShade/40 via-purple-500/20 to-darkShade">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/10 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
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
                <p className="text-gray-400 text-sm">Cover image</p>
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
            className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-darkShade object-cover shadow-xl"
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
            <p className="text-gray-400 text-sm mt-1">@{profile.username}</p>

            {profile.bio && (
              <p className="text-gray-300 mt-3 max-w-md">{profile.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
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
                    className="hover:text-yellowShade transition-colors"
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
                    className="text-gray-400 hover:text-yellowShade transition-colors"
                  >
                    {getSocialIcon(link)}
                  </a>
                ))}
              </div>
            )}
          </div>

          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white font-medium transition-colors flex items-center gap-2">
            <Edit3 size={16} />
            Edit Profile
          </button>
        </div>

        <div className="flex gap-10 mt-6">
          <div className="text-center">
            <p className="text-xl font-bold text-white">
              {profile.posts_count || 0}
            </p>
            <p className="text-xs text-gray-400">posts</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">
              {profile.blogs_count || 0}
            </p>
            <p className="text-xs text-gray-400">blogs</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">
              {profile.followers_count || 0}
            </p>
            <p className="text-xs text-gray-400">followers</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">
              {profile.following_count || 0}
            </p>
            <p className="text-xs text-gray-400">following</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-white">
              {profile.ranking_points || 0}
            </p>
            <p className="text-xs text-gray-400">points</p>
          </div>
        </div>

        {profile.tags && profile.tags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {profile.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs px-2 py-1 bg-yellowShade/10 text-yellowShade rounded-full"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-10 border-t border-gray-700 pt-6">
        <div className="flex gap-12 justify-center">
          <button
            onClick={() => setActiveTab("posts")}
            className={`pb-3 text-base font-medium transition-colors relative ${
              activeTab === "posts"
                ? "text-yellowShade"
                : "text-gray-400 hover:text-white"
            }`}
          >
            POSTS
            {activeTab === "posts" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellowShade"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`pb-3 text-base font-medium transition-colors relative ${
              activeTab === "blogs"
                ? "text-yellowShade"
                : "text-gray-400 hover:text-white"
            }`}
          >
            BLOGS
            {activeTab === "blogs" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellowShade"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`pb-3 text-base font-medium transition-colors relative ${
              activeTab === "saved"
                ? "text-yellowShade"
                : "text-gray-400 hover:text-white"
            }`}
          >
            SAVED
            {activeTab === "saved" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellowShade"></div>
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
                <div className="w-8 h-8 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No posts yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Share your first post!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/posts/${post.id}`}
                    className="block bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-yellowShade/30 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatRelativeDate(post.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
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
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {post.body}
                    </p>
                    {post.code && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <Code size={12} />
                        <span>{post.code_language}</span>
                      </div>
                    )}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag.id}
                            className="text-xs px-1.5 py-0.5 bg-yellowShade/10 text-yellowShade rounded-full"
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
                    <div className="w-6 h-6 border-2 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
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
                <div className="w-8 h-8 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen size={48} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No blogs yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Write your first blog!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    to={`/blogs/${blog.id}`}
                    className="block bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-yellowShade/30 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formatRelativeDate(blog.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
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
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {blog.subtitle}
                    </p>
                    {blog.reading_time && (
                      <div className="mt-2 text-xs text-gray-500">
                        📖 {blog.reading_time}
                      </div>
                    )}
                  </Link>
                ))}
                {blogsLoadingMore && (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
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
                <div className="w-8 h-8 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
              </div>
            ) : savedItems.length === 0 ? (
              <div className="text-center py-12">
                <Heart size={48} className="text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No saved items yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Save posts and blogs to see them here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedItems.map((item, idx) => {
                  const content = item.data;
                  const isBlog = item.kind === "blog";
                  return (
                    <Link
                      key={idx}
                      to={
                        isBlog ? `/blogs/${content.id}` : `/posts/${content.id}`
                      }
                      className="block bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-yellowShade/30 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-yellowShade/20 text-yellowShade rounded-full">
                            {isBlog ? "BLOG" : "POST"}
                          </span>
                          <span className="text-xs text-gray-500">
                            Saved {formatRelativeDate(item.saved_at)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Heart size={12} />
                            <span>{content.likes_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle size={12} />
                            <span>{content.comments_count}</span>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-white font-semibold mb-1">
                        {content.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {isBlog ? content.subtitle : content.body}
                      </p>
                    </Link>
                  );
                })}
                {savedLoadingMore && (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
