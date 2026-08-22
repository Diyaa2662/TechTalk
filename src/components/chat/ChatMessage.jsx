import { User, Bot } from "lucide-react";

const ChatMessage = ({ message, isUser }) => {
  return (
    <div
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} slide-up`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#5CA1FC]/20 flex items-center justify-center">
          <Bot size={16} className="text-[#5CA1FC]" />
        </div>
      )}
      <div
        className={`max-w-[80%] p-3 rounded-xl ${
          isUser
            ? "bg-[#5CA1FC] text-white rounded-br-none shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
            : "bg-panel border border-panelEdge text-gray-200 rounded-bl-none"
        }`}
      >
        <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
          {message}
        </div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#5CA1FC]/15 flex items-center justify-center">
          <User size={16} className="text-[#5CA1FC]" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
