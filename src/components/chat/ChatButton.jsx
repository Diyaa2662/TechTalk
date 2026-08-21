import { MessageCircle } from "lucide-react";

const ChatButton = ({ onClick, unreadCount = 0 }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-accent hover:bg-accentHover text-white rounded-full shadow-lg shadow-accent/30 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-accent/50"
    >
      <MessageCircle size={28} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatButton;
