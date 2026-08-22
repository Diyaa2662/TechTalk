import { MessageCircle } from "lucide-react";

const ChatButton = ({ onClick, unreadCount = 0 }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-full shadow-lg shadow-[#5CA1FC]/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-[#5CA1FC]/50 group"
    >
      <MessageCircle
        size={28}
        className="group-hover:rotate-12 transition-transform duration-300"
      />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatButton;
