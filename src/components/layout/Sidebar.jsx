import { useState, useEffect } from "react";
import {
  HomeIcon,
  NewspaperIcon,
  SearchIcon,
  UserIcon,
  BellIcon,
  PlusCircleIcon,
  LogOutIcon,
  MessageCircle,
  MapPin,
  Sparkles,
  Code2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "/src/assets/logo.png";
import api from "../../services/api";

const navItems = [
  { name: "Home", icon: HomeIcon, href: "/" },
  { name: "Blogs", icon: NewspaperIcon, href: "/blogs" },
  { name: "Search", icon: SearchIcon, href: "/search" },
  { name: "Notifications", icon: BellIcon, href: "/notifications" },
  { name: "Profile", icon: UserIcon, href: "/profile" },
];

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // جلب عدد الإشعارات غير المقروءة
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response.data.data?.unread_count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // جلب العداد عند تحميل المكون وكل 30 ثانية
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true);

    try {
      await api.post("/logout", {
        scope: "all",
        all_devices: false,
      });

      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("temp_email");
      localStorage.removeItem("temp_user_id");

      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);

      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("temp_email");
      localStorage.removeItem("temp_user_id");

      navigate("/login");
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div
      className="fixed left-0 top-0 h-screen z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`h-full text-white flex flex-col shadow-lg transition-all duration-300 ease-out ${
          isHovered ? "w-48" : "w-16"
        } bg-gradient-to-r from-bg via-bg to-accent/5`}
      >
        {/* Logo */}
        <div className="px-2 py-4 border-b border-panelEdge mb-4">
          <div className="flex items-center gap-4 px-2 py-2 rounded-lg group relative">
            <div className="min-w-[24px] flex justify-center">
              <img src={logo} alt="TechTalk Logo" className="h-6 w-auto" />
            </div>
            <span
              className={`
                text-base whitespace-nowrap font-bold
                transition-all duration-300 ease-out
                gradient-title
                ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 absolute pointer-events-none"}
              `}
            >
              TechTalk
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="flex items-center gap-4 px-2 py-3 rounded-lg hover:bg-white/5 transition-colors group relative"
                >
                  <div className="min-w-[24px] relative">
                    <item.icon
                      size={24}
                      className="text-muted group-hover:text-accent transition-colors"
                    />
                    {/* عداد الإشعارات غير المقروءة */}
                    {item.name === "Notifications" && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-0.5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`
                      text-base whitespace-nowrap
                      transition-all duration-300 ease-out
                      ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 absolute pointer-events-none"}
                    `}
                  >
                    {item.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Create Post Button */}
        <div className="px-2 pb-2">
          <button
            onClick={() => navigate("/create-post")}
            className="flex items-center gap-4 px-2 py-3 w-full rounded-lg hover:bg-white/5 transition-colors group relative"
          >
            <div className="min-w-[24px]">
              <PlusCircleIcon size={24} className="text-accent" />
            </div>
            <span
              className={`
                text-base whitespace-nowrap text-accent font-medium
                transition-all duration-300 ease-out
                ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 absolute pointer-events-none"}
              `}
            >
              Create Post
            </span>
          </button>
        </div>

        {/* AI Chat Button */}
        <div className="px-2 pb-2">
          <button
            onClick={() => navigate("/chat")}
            className="flex items-center gap-4 px-2 py-3 w-full rounded-lg hover:bg-white/5 transition-colors group relative"
          >
            <div className="min-w-[24px]">
              <MessageCircle size={24} className="text-accent" />
            </div>
            <span
              className={`
                text-base whitespace-nowrap text-accent font-medium
                transition-all duration-300 ease-out
                ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 absolute pointer-events-none"}
              `}
            >
              AI Chat
            </span>
          </button>
        </div>

        {/* Road Maps Button */}
        <div className="px-2 pb-2">
          <button
            onClick={() => navigate("/roadmaps")}
            className="flex items-center gap-4 px-2 py-3 w-full rounded-lg hover:bg-white/5 transition-colors group relative"
          >
            <div className="min-w-[24px]">
              <MapPin size={24} className="text-accent" />
            </div>
            <span
              className={`
                text-base whitespace-nowrap text-accent font-medium
                transition-all duration-300 ease-out
                ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 absolute pointer-events-none"}
              `}
            >
              Road Maps
            </span>
          </button>
        </div>

        {/* UML Generator Button */}
        <div className="px-2 pb-2">
          <button
            onClick={() => navigate("/uml")}
            className="flex items-center gap-4 px-2 py-3 w-full rounded-lg hover:bg-white/5 transition-colors group relative"
          >
            <div className="min-w-[24px]">
              <Sparkles size={24} className="text-accent" />
            </div>
            <span
              className={`
                text-base whitespace-nowrap text-accent font-medium
                transition-all duration-300 ease-out
                ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 absolute pointer-events-none"}
              `}
            >
              UML Generator
            </span>
          </button>
        </div>

        {/* Compiler Button */}
        <div className="px-2 pb-2">
          <button
            onClick={() => navigate("/compiler")}
            className="flex items-center gap-4 px-2 py-3 w-full rounded-lg hover:bg-white/5 transition-colors group relative"
          >
            <div className="min-w-[24px]">
              <Code2 size={24} className="text-accent" />
            </div>
            <span
              className={`
                text-base whitespace-nowrap text-accent font-medium
                transition-all duration-300 ease-out
                ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 absolute pointer-events-none"}
              `}
            >
              Compiler
            </span>
          </button>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t border-panelEdge">
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="flex items-center gap-4 px-2 py-3 w-full rounded-lg hover:bg-white/5 transition-colors group relative disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="min-w-[24px]">
              <LogOutIcon
                size={24}
                className="text-muted group-hover:text-accent transition-colors"
              />
            </div>
            <span
              className={`
                text-base whitespace-nowrap
                transition-all duration-300 ease-out
                ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 absolute pointer-events-none"}
              `}
            >
              {logoutLoading ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
