import { useState } from "react";
import {
  HomeIcon,
  CompassIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
} from "lucide-react";

const navItems = [
  { name: "Home", icon: HomeIcon, href: "/" },
  { name: "Explore", icon: CompassIcon, href: "/explore" },
  { name: "Profile", icon: UserIcon, href: "/profile" },
  { name: "Settings", icon: SettingsIcon, href: "/settings" },
];

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`fixed left-0 top-0 h-screen z-50 transition-all duration-300 ${
        isHovered ? "w-48" : "w-16"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="h-full bg-darkShade text-white flex flex-col shadow-lg">
        {/* Logo */}
        <div className="p-4 border-b border-gray-700 mb-4">
          <span
            className={`font-bold text-xl text-yellowShade ${!isHovered && "hidden"}`}
          >
            TechTalk
          </span>
          {!isHovered && (
            <span className="text-xl block text-center text-yellowShade">
              💬
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-gray-800 rounded-lg transition-colors text-gray-300 hover:text-yellowShade"
                >
                  <item.icon size={24} />
                  <span className={`${!isHovered && "hidden"} text-base`}>
                    {item.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-700">
          <button className="flex items-center gap-4 px-4 py-3 w-full hover:bg-gray-800 rounded-lg transition-colors text-gray-300 hover:text-yellowShade">
            <LogOutIcon size={24} />
            <span className={`${!isHovered && "hidden"} text-base`}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
