import { User, Bot } from "lucide-react";

const ChatMessage = ({ message, isUser }) => {
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
          <Bot size={16} className="text-accent" />
        </div>
      )}
      <div
        className={`max-w-[80%] p-3 rounded-xl ${
          isUser
            ? "bg-accent text-white rounded-br-none"
            : "bg-panel border border-panelEdge text-gray-200 rounded-bl-none"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap break-words">{message}</div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center">
          <User size={16} className="text-accent" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
