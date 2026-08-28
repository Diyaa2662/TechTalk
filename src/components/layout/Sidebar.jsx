import { useState, useEffect } from "react";
import {
  HomeIcon,
  NewspaperIcon,
  SearchIcon,
  UserIcon,
  BellIcon,
  LogOutIcon,
  ChevronDown,
  ChevronRight,
  MapPin,
  Sparkles,
  Code2,
  Wrench,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "/src/assets/logo.png";
import api from "../../services/api";
import eventBus from "../../services/eventBus";

const navItems = [
  { name: "Home", icon: HomeIcon, href: "/" },
  { name: "Blogs", icon: NewspaperIcon, href: "/blogs" },
  { name: "Search", icon: SearchIcon, href: "/search" },
  { name: "Notifications", icon: BellIcon, href: "/notifications" },
  { name: "Profile", icon: UserIcon, href: "/profile" },
];

const toolsItems = [
  { name: "Road Maps", icon: MapPin, href: "/roadmaps" },
  { name: "UML Generator", icon: Sparkles, href: "/uml" },
  { name: "Compiler", icon: Code2, href: "/compiler" },
];

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toolsOpen, setToolsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // جلب عدد الإشعارات غير المقروءة
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      setUnreadCount(response.data.data?.unread_count || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // ✅ الاستماع لتحديثات الإشعارات الفورية
  useEffect(() => {
    fetchUnreadCount();

    // ✅ زيادة العداد عند إشعار جديد
    const unsubscribeNew = eventBus.subscribe(
      "new-notification-received",
      () => {
        setUnreadCount((prev) => prev + 1);
      },
    );

    // ✅ تحديث العداد من السيرفر
    const unsubscribeUpdate = eventBus.subscribe("update-unread-count", () => {
      fetchUnreadCount();
    });

    // ✅ تصفير العداد
    const unsubscribeReset = eventBus.subscribe("reset-unread-count", () => {
      setUnreadCount(0);
    });

    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      clearInterval(interval);
      unsubscribeNew();
      unsubscribeUpdate();
      unsubscribeReset();
    };
  }, []);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) {
      return;
    }

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

  const isActive = (href) => location.pathname === href;
  const isToolsActive = toolsItems.some(
    (item) => location.pathname === item.href,
  );

  return (
    <div
      className="fixed left-0 top-0 h-screen z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`h-full text-white flex flex-col shadow-panel-lg transition-all duration-300 ease-out overflow-hidden ${
          isHovered ? "w-52" : "w-16"
        } bg-gradient-to-r from-bg via-bg to-[#5CA1FC]/5 border-r border-panelEdge/50`}
      >
        {/* Logo */}
        <div className="px-2 py-4 border-b border-panelEdge/50 mb-4 flex-shrink-0">
          <div className="flex items-center gap-4 px-2 py-2 rounded-lg">
            <div className="min-w-[24px] flex justify-center">
              <img src={logo} alt="TechTalk Logo" className="h-6 w-auto" />
            </div>
            <span
              className={`
                text-base whitespace-nowrap font-bold
                transition-opacity duration-300
                gradient-title
                ${isHovered ? "opacity-100" : "opacity-0"}
              `}
            >
              TechTalk
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 overflow-y-auto overflow-x-hidden min-h-0">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => navigate(item.href)}
                  className={`
                    flex items-center gap-4 px-2 py-3 w-full rounded-lg 
                    transition-all duration-200 
                    hover:translate-x-1 hover:scale-[1.02]
                    ${
                      isActive(item.href)
                        ? "bg-[#5CA1FC]/10 text-[#5CA1FC]"
                        : "hover:bg-white/5 text-muted hover:text-white"
                    }
                  `}
                >
                  <div className="min-w-[24px] relative flex-shrink-0">
                    <item.icon
                      size={24}
                      className={`transition-colors ${
                        isActive(item.href)
                          ? "text-[#5CA1FC]"
                          : "group-hover:text-[#5CA1FC]"
                      }`}
                    />
                    {item.name === "Notifications" && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-0.5 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span
                    className={`
                      text-sm whitespace-nowrap font-medium
                      transition-opacity duration-300
                      ${isHovered ? "opacity-100" : "opacity-0"}
                    `}
                  >
                    {item.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {/* Tools Section */}
          <div className="mt-4 pt-4 border-t border-panelEdge/50">
            <button
              onClick={() => isHovered && setToolsOpen(!toolsOpen)}
              className={`
                flex items-center justify-between w-full px-2 py-2 rounded-lg
                transition-all duration-200
                hover:translate-x-1 hover:scale-[1.02]
                ${isHovered ? "opacity-100" : "opacity-0"}
                ${isToolsActive ? "text-[#5CA1FC]" : "text-muted hover:text-white"}
                hover:bg-white/5
              `}
            >
              <div className="flex items-center gap-4">
                <div className="min-w-[24px] flex-shrink-0">
                  <Wrench
                    size={20}
                    className={isToolsActive ? "text-[#5CA1FC]" : ""}
                  />
                </div>
                <span className="text-sm font-medium uppercase tracking-wider">
                  Tools
                </span>
              </div>
              {toolsOpen ? (
                <ChevronDown
                  size={16}
                  className="transition-transform duration-300 flex-shrink-0"
                />
              ) : (
                <ChevronRight
                  size={16}
                  className="transition-transform duration-300 flex-shrink-0"
                />
              )}
            </button>

            <div
              className={`
              overflow-hidden transition-all duration-300 ease-out
              ${isHovered && toolsOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}
            `}
            >
              <ul className="space-y-1 mt-1">
                {toolsItems.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => navigate(item.href)}
                      className={`
                        flex items-center gap-4 px-2 py-2.5 w-full rounded-lg 
                        transition-all duration-200
                        hover:translate-x-1 hover:scale-[1.02]
                        ${
                          isActive(item.href)
                            ? "bg-[#5CA1FC]/10 text-[#5CA1FC]"
                            : "hover:bg-white/5 text-muted hover:text-white"
                        }
                        ${isHovered ? "pl-8" : "pl-2"}
                      `}
                    >
                      <div className="min-w-[24px] flex-shrink-0">
                        <item.icon
                          size={20}
                          className={`transition-colors ${
                            isActive(item.href) ? "text-[#5CA1FC]" : ""
                          }`}
                        />
                      </div>
                      <span
                        className={`
                          text-sm whitespace-nowrap font-medium
                          transition-opacity duration-300
                          ${isHovered ? "opacity-100" : "opacity-0"}
                        `}
                      >
                        {item.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>

        {/* Logout button */}
        <div className="p-3 border-t border-panelEdge/50 flex-shrink-0">
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="flex items-center gap-4 px-2 py-2.5 w-full rounded-lg 
              transition-all duration-200 
              hover:translate-x-1 hover:scale-[1.02]
              hover:bg-error/10 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="min-w-[24px] flex-shrink-0">
              <LogOutIcon
                size={22}
                className="text-muted group-hover:text-error transition-colors"
              />
            </div>
            <span
              className={`
                text-sm whitespace-nowrap font-medium
                transition-opacity duration-300
                ${isHovered ? "opacity-100" : "opacity-0"}
                ${logoutLoading ? "text-muted" : "group-hover:text-error"}
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
