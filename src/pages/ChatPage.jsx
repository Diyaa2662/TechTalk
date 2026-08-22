import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Bot, Trash2, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sendMessage, suggestedQuestions } from "../services/gemini";
import ChatMessage from "../components/chat/ChatMessage";
import LoadingSpinner from "../components/common/LoadingSpinner";

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
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

  // التركيز على حقل الإدخال
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

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
      setTimeout(() => inputRef.current?.focus(), 50);
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

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-white group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#5CA1FC]/10">
              <Bot size={22} className="text-[#5CA1FC]" />
            </div>
            <h1 className="gradient-title text-2xl font-bold">AI Chat</h1>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
          Clear Chat
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-panel/30 rounded-xl border border-panelEdge p-4 space-y-4 hover:border-[#5CA1FC]/20 transition-all duration-300">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot size={64} className="text-[#5CA1FC]/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Hello! 👋</h3>
            <p className="text-muted text-sm max-w-md mx-auto">
              Ask me anything about coding, debugging, or how to use the
              TechTalk platform.
            </p>

            {/* Suggested Questions */}
            <div className="mt-6 max-w-2xl mx-auto">
              <p className="text-xs text-muted mb-3">Try asking:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedQuestion(q.text)}
                    className="text-xs px-3 py-2 bg-[#5CA1FC]/10 hover:bg-[#5CA1FC]/20 text-[#5CA1FC] rounded-lg transition-all duration-300 hover:scale-[1.05] text-left max-w-[200px]"
                  >
                    <span className="mr-1">{q.icon}</span>
                    {q.text.length > 30 ? `${q.text.slice(0, 30)}...` : q.text}
                  </button>
                ))}
              </div>
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
      <div className="mt-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about coding or TechTalk..."
            rows="2"
            className="flex-1 input-field resize-none py-2 px-3 text-sm min-h-[50px] max-h-[120px] focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
            disabled={loading}
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              handleSend();
            }}
            disabled={!input.trim() || loading}
            className="px-5 py-2 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center self-end shadow-[0_4px_16px_rgba(92,161,252,0.25)] hover:shadow-[0_8px_32px_rgba(92,161,252,0.35)] hover:scale-[1.02]"
            type="button"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <p className="text-xs text-muted mt-1.5 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
