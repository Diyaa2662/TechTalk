import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Send,
  Loader2,
  Bot,
  Trash2,
  Minimize2,
  Maximize2,
  Expand,
} from "lucide-react";
import { sendMessage, suggestedQuestions } from "../../services/gemini";
import ChatMessage from "./ChatMessage";

const ChatBot = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // تحميل المحادثة من localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat_history");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch {
        setMessages([]);
      }
    }
  }, []);

  // حفظ المحادثة في localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chat_history", JSON.stringify(messages));
    }
  }, [messages]);

  // التمرير لآخر رسالة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // التركيز على حقل الإدخال عند فتح الشات
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // إرسال الرسالة
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map((msg) => ({
        role: msg.role,
        text: msg.text,
      }));
      const response = await sendMessage(userMessage, history);
      setMessages((prev) => [...prev, { role: "assistant", text: response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `⚠️ ${error.message || "Something went wrong. Please try again."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // مسح المحادثة
  const clearChat = () => {
    if (messages.length === 0) return;
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      localStorage.removeItem("chat_history");
    }
  };

  // إضافة سؤال مقترح
  const handleSuggestedQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  // معالجة Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // التوسيع للصفحة الكاملة
  const handleExpand = () => {
    onClose();
    navigate("/chat");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <div
        className={`bg-panel border border-panelEdge rounded-2xl shadow-panel overflow-hidden transition-all duration-300 flex flex-col ${
          isMinimized ? "h-14" : "h-[500px] max-h-[80vh]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-panelEdge bg-gradient-to-r from-bg to-[#5CA1FC]/5 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Bot size={20} className="text-[#5CA1FC] flex-shrink-0" />
            <span className="font-semibold text-white text-sm truncate">
              TechTalk AI
            </span>
            <span className="text-xs px-2 py-0.5 bg-[#5CA1FC]/20 text-[#5CA1FC] rounded-full flex-shrink-0">
              Gemini
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={clearChat}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-error"
              title="Clear chat"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={handleExpand}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-[#5CA1FC]"
              title="Open in full page"
            >
              <Expand size={16} />
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-white"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg/30 min-h-0">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot size={48} className="text-[#5CA1FC]/40 mx-auto mb-3" />
                  <p className="text-muted text-sm">Hello! 👋</p>
                  <p className="text-label text-xs mt-1">
                    Ask me anything about coding or TechTalk platform.
                  </p>

                  {/* Suggested Questions */}
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {suggestedQuestions.slice(0, 4).map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedQuestion(q.text)}
                        className="text-xs px-3 py-1.5 bg-[#5CA1FC]/10 hover:bg-[#5CA1FC]/20 text-[#5CA1FC] rounded-full transition-colors"
                      >
                        {q.icon} {q.text.slice(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <ChatMessage
                    key={idx}
                    message={msg.text}
                    isUser={msg.role === "user"}
                  />
                ))
              )}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#5CA1FC]/20 flex items-center justify-center">
                    <Bot size={16} className="text-[#5CA1FC]" />
                  </div>
                  <div className="bg-panel border border-panelEdge p-3 rounded-xl rounded-bl-none">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-[#5CA1FC]/60 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-[#5CA1FC]/60 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-[#5CA1FC]/60 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-panelEdge bg-panel/50 flex-shrink-0">
              <div className="flex gap-2 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  rows="1"
                  className="flex-1 input-field resize-none py-2.5 px-3 text-sm min-h-[42px] max-h-[80px] leading-5 focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
                  disabled={loading}
                  style={{ height: "42px" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="px-4 py-2.5 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center flex-shrink-0 h-[42px]"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
