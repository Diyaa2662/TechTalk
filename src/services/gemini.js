import { GoogleGenerativeAI } from "@google/generative-ai";

// استخدم الـ API Key من .env
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// تهيئة Gemini
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

// نظام التعليمات (System Prompt)
const SYSTEM_PROMPT = `You are TechTalk Assistant, an AI assistant for a developer social media platform. Your role is to help users with:

1. **Programming Help**: Answer coding questions, debug code, explain concepts, and provide code examples in various languages (JavaScript, Python, PHP, etc.).
2. **Platform Help**: Guide users on how to use TechTalk features (creating posts, blogs, comments, following users, etc.).
3. **General Developer Advice**: Offer best practices, career advice, and tech recommendations.

Be friendly, professional, and concise. Format code using markdown code blocks with language specification. If you don't know something, be honest and suggest alternatives.

Current user is logged in to TechTalk.`;

// إرسال رسالة إلى Gemini
export const sendMessage = async (message, chatHistory = []) => {
  try {
    // تحويل تاريخ المحادثة إلى صيغة Gemini
    const history = chatHistory.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    // بدء المحادثة
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);

    // معالجة الأخطاء
    if (error.message?.includes("API key")) {
      throw new Error("Invalid API key. Please check your Gemini API key.");
    }
    if (error.message?.includes("quota")) {
      throw new Error("API quota exceeded. Please try again later.");
    }
    if (error.message?.includes("not found")) {
      throw new Error("Model not found. Please check the model name.");
    }
    throw new Error("Failed to get response from AI. Please try again.");
  }
};

// اقتراحات أسئلة مبدئية
export const suggestedQuestions = [
  {
    icon: "💻",
    text: "How do I create a post in TechTalk?",
  },
  {
    icon: "🐛",
    text: "Debug this code: console.log('hello')",
  },
  {
    icon: "📚",
    text: "Explain React hooks in simple terms",
  },
  {
    icon: "🔧",
    text: "What are best practices for REST APIs?",
  },
  {
    icon: "🚀",
    text: "How to improve my coding skills?",
  },
  {
    icon: "📝",
    text: "How to write a good blog for developers?",
  },
];

export default {
  sendMessage,
  suggestedQuestions,
};
