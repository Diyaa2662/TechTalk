import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Heart,
  MessageCircle,
  Bookmark,
  Eye,
  User,
  Tag,
  X,
  Filter,
  Code,
} from "lucide-react";
import api from "../services/api";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("posts");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagSearch, setTagSearch] = useState("");

  const [perPage, setPerPage] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isLoadingRef = useRef(false);
  const searchTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const tagInputRef = useRef(null);
  const filterButtonRef = useRef(null);
  const searchInputRef = useRef(null);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tags");
      setAllTags(response.data.data || []);
    } catch (err) {
      console.error("Error fetching tags:", err);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showTagDropdown &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        filterButtonRef.current &&
        !filterButtonRef.current.contains(e.target)
      ) {
        setShowTagDropdown(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [showTagDropdown]);

  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setPerPage(10);
    setHasMore(true);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const performSearch = useCallback(
    async (query, tab, tags, currentPerPage = 10, isLoadMore = false) => {
      if (!query.trim() && tags.length === 0) {
        setResults([]);
        setHasMore(true);
        setPerPage(10);
        return;
      }

      if (isLoadingRef.current) return;
      isLoadingRef.current = true;

      if (!isLoadMore) setLoading(true);
      else setLoadingMore(true);

      try {
        const response = await api.post("/search", {
          query: query.trim() || "",
          tab: tab,
          tags: tags.length > 0 ? tags : undefined,
          page: 1,
          per_page: currentPerPage,
        });

        const newResults = response.data.data || [];
        setResults(newResults);
        setHasMore(newResults.length === currentPerPage);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to search. Please try again.");
        setResults([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isLoadingRef.current = false;
      }
    },
    [],
  );

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        setPerPage(10);
        setHasMore(true);
        performSearch(
          searchQuery,
          activeTab,
          selectedTags.map((t) => t.id),
          10,
          false,
        );
      } else {
        setResults([]);
        setHasMore(true);
        setPerPage(10);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery, activeTab, selectedTags, performSearch]);

  const loadMore = () => {
    if (loadingMore || !hasMore || isLoadingRef.current) return;
    if (!searchQuery.trim() && selectedTags.length === 0) return;
    const newPerPage = perPage + 10;
    setPerPage(newPerPage);
    performSearch(
      searchQuery,
      activeTab,
      selectedTags.map((t) => t.id),
      newPerPage,
      true,
    );
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
  }, [hasMore, loadingMore, searchQuery, activeTab, selectedTags, perPage]);

  const addTag = (tag) => {
    if (!selectedTags.some((t) => t.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagSearch("");
    setShowTagDropdown(false);
  };

  const removeTag = (tagId) => {
    setSelectedTags(selectedTags.filter((t) => t.id !== tagId));
  };

  const filteredTags = allTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(tagSearch.toLowerCase()) &&
      !selectedTags.some((t) => t.id === tag.id),
  );

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

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Search</h1>

      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for posts, blogs, or users..."
          className="w-full pl-10 pr-10 py-3 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellowShade focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Clear search"
          >
            <X size={16} className="text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      <div className="mb-6">
        <button
          ref={filterButtonRef}
          onClick={() => setShowTagDropdown(!showTagDropdown)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-yellowShade transition-colors"
        >
          <Filter size={14} />
          Filter by tags {selectedTags.length > 0 && `(${selectedTags.length})`}
        </button>

        {showTagDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-20 mt-2 w-64 bg-darkShade border border-gray-600 rounded-lg shadow-lg p-3"
          >
            <div className="relative mb-2">
              <input
                ref={tagInputRef}
                type="text"
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                placeholder="Search tags..."
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-yellowShade"
                autoFocus
              />
              <Tag
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>

            {filteredTags.length > 0 ? (
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => addTag(tag)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-white/10 rounded-lg flex items-center justify-between transition-colors"
                  >
                    <span>#{tag.name}</span>
                    <span className="text-xs text-gray-500">Add</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-gray-500">
                No tags found
              </div>
            )}

            {selectedTags.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-yellowShade/10 text-yellowShade rounded-full"
                    >
                      #{tag.name}
                      <button
                        onClick={() => removeTag(tag.id)}
                        className="hover:text-red-400 ml-1"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-6 border-b border-gray-700 mb-6">
        <button
          onClick={() => {
            setActiveTab("posts");
            setPerPage(10);
            setHasMore(true);
            if (searchQuery.trim()) {
              performSearch(
                searchQuery,
                "posts",
                selectedTags.map((t) => t.id),
                10,
                false,
              );
            } else {
              setResults([]);
            }
          }}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "posts" ? "text-yellowShade" : "text-gray-400 hover:text-white"}`}
        >
          Posts
          {activeTab === "posts" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellowShade"></div>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("blogs");
            setPerPage(10);
            setHasMore(true);
            if (searchQuery.trim()) {
              performSearch(
                searchQuery,
                "blogs",
                selectedTags.map((t) => t.id),
                10,
                false,
              );
            } else {
              setResults([]);
            }
          }}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "blogs" ? "text-yellowShade" : "text-gray-400 hover:text-white"}`}
        >
          Blogs
          {activeTab === "blogs" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellowShade"></div>
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab("users");
            setPerPage(10);
            setHasMore(true);
            if (searchQuery.trim()) {
              performSearch(
                searchQuery,
                "users",
                selectedTags.map((t) => t.id),
                10,
                false,
              );
            } else {
              setResults([]);
            }
          }}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "users" ? "text-yellowShade" : "text-gray-400 hover:text-white"}`}
        >
          Users
          {activeTab === "users" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellowShade"></div>
          )}
        </button>
      </div>

      {loading && results.length === 0 ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-400">{error}</p>
        </div>
      ) : results.length === 0 && !loading && searchQuery ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No results found for "{searchQuery}"</p>
        </div>
      ) : results.length === 0 &&
        !loading &&
        !searchQuery &&
        selectedTags.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Start typing to search...</p>
        </div>
      ) : results.length === 0 &&
        !loading &&
        !searchQuery &&
        selectedTags.length > 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">Enter a search term to filter by tags</p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((item, index) => {
            if (activeTab === "posts") {
              const post = item;
              return (
                <Link
                  key={post.id || index}
                  to={`/posts/${post.id}`}
                  className="block bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-yellowShade/30 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <img
                          src={post.user.avatar_url}
                          alt={post.user.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{post.user.name}</span>
                        <span>•</span>
                        <span>{formatDate(post.created_at)}</span>
                      </div>
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
              );
            } else if (activeTab === "blogs") {
              const blog = item;
              return (
                <Link
                  key={blog.id || index}
                  to={`/blogs/${blog.id}`}
                  className="block bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-yellowShade/30 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <img
                          src={blog.user.avatar_url}
                          alt={blog.user.name}
                          className="w-5 h-5 rounded-full"
                        />
                        <span>{blog.user.name}</span>
                        <span>•</span>
                        <span>{formatDate(blog.created_at)}</span>
                      </div>
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
              );
            } else if (activeTab === "users") {
              const user = item;
              return (
                <Link
                  key={user.id || index}
                  to={`/profile/${user.username}`}
                  className="block bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 hover:border-yellowShade/30 transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold">
                          {user.name}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            user.badge === "expert"
                              ? "bg-yellowShade/20 text-yellowShade"
                              : user.badge === "senior"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {user.badge}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">@{user.username}</p>
                      {user.bio && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-1">
                          {user.bio}
                        </p>
                      )}
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>{user.followers_count || 0} followers</span>
                        <span>{user.following_count || 0} following</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            }
            return null;
          })}

          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-yellowShade/20 border-t-yellowShade rounded-full animate-spin"></div>
            </div>
          )}

          {!hasMore && results.length > 0 && (
            <p className="text-center text-gray-500 text-sm py-4">
              You've reached the end! 🎉
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
