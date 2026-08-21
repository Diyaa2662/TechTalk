import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Loader2,
  Terminal,
  Clock,
  MemoryStick,
  CheckCircle,
  XCircle,
  Code2,
} from "lucide-react";
import api from "../services/api";

// اللغات المدعومة
const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "c#", label: "C#" },
  { value: "f#", label: "F#" },
  { value: "php", label: "PHP 8.5" },
  { value: "ruby", label: "Ruby 4.0" },
  { value: "haskell", label: "Haskell GHC 9.12" },
  { value: "go", label: "Go 1.26" },
  { value: "rust", label: "Rust 1.93" },
  { value: "typescript", label: "TypeScript (Deno)" },
];

// أمثلة للكود
const CODE_EXAMPLES = {
  python: `print("Hello, TechTalk!")`,
  c: `#include <stdio.h>\n\nint main() {\n    printf("Hello, TechTalk!\\n");\n    return 0;\n}`,
  cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, TechTalk!" << std::endl;\n    return 0;\n}`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, TechTalk!");\n    }\n}`,
  "c#": `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, TechTalk!");\n    }\n}`,
  "f#": `printfn "Hello, TechTalk!"`,
  php: `<?php\necho "Hello, TechTalk!";`,
  ruby: `puts "Hello, TechTalk!"`,
  haskell: `main = putStrLn "Hello, TechTalk!"`,
  go: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, TechTalk!")\n}`,
  rust: `fn main() {\n    println!("Hello, TechTalk!");\n}`,
  typescript: `console.log("Hello, TechTalk!");`,
};

const CompilerPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(CODE_EXAMPLES.python);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(CODE_EXAMPLES[lang] || "");
    setResult(null);
    setError("");
  };

  const runCode = async () => {
    if (!code.trim()) {
      setError("Please write some code.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await api.post("/compile", {
        language: language,
        code: code,
        input: input,
      });

      const resultData = response.data.data?.result;
      if (resultData) {
        setResult(resultData);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Compilation Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to compile code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (lang) => {
    setLanguage(lang);
    setCode(CODE_EXAMPLES[lang] || "");
    setResult(null);
    setError("");
  };

  const getStatusIcon = (status) => {
    if (status === "success") {
      return <CheckCircle size={16} className="text-success" />;
    }
    return <XCircle size={16} className="text-error" />;
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Code2 size={28} className="text-accent" />
          <h1 className="gradient-title text-2xl font-bold">Code Compiler</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Code Editor */}
        <div className="lg:col-span-2">
          <div className="glass-card p-4">
            {/* Language Selector */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex-1 min-w-[150px]">
                <label className="block text-xs text-label mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="input-field py-2"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={runCode}
                  disabled={loading}
                  className="px-5 py-2 bg-accent hover:bg-accentHover text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-accent-sm"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Play size={18} />
                  )}
                  Run
                </button>
              </div>
            </div>

            {/* Code Editor */}
            <div>
              <label className="block text-xs text-label mb-1">Code</label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Write your code here..."
                rows="10"
                className="input-field resize-none font-mono text-sm"
                style={{ tabSize: 2 }}
                spellCheck={false}
              />
            </div>

            {/* Input */}
            <div className="mt-3">
              <label className="block text-xs text-label mb-1">
                Input (optional)
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input for your program..."
                rows="2"
                className="input-field resize-none font-mono text-sm"
                spellCheck={false}
              />
            </div>

            {/* Examples */}
            <div className="mt-3">
              <p className="text-xs text-muted mb-2">Quick examples:</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.slice(0, 6).map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => loadExample(lang.value)}
                    className="text-xs px-3 py-1 bg-accent/10 hover:bg-accent/20 text-accent rounded-full transition-colors"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-error/20 border border-error/50 rounded-lg">
                <p className="text-error text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="lg:col-span-1">
          <div className="glass-card p-4 h-full">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Terminal size={18} className="text-accent" />
              Output
            </h3>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 size={32} className="text-accent animate-spin mb-3" />
                <p className="text-muted text-sm">Running...</p>
              </div>
            ) : result ? (
              <div className="space-y-3">
                {/* Output */}
                {result.output && (
                  <div>
                    <p className="text-xs text-label mb-1">Output</p>
                    <pre className="bg-bg/50 p-3 rounded-lg text-sm text-white font-mono whitespace-pre-wrap max-h-[150px] overflow-auto">
                      {result.output}
                    </pre>
                  </div>
                )}

                {/* Error */}
                {result.error && (
                  <div>
                    <p className="text-xs text-label mb-1">Error</p>
                    <pre className="bg-error/10 p-3 rounded-lg text-sm text-error font-mono whitespace-pre-wrap max-h-[150px] overflow-auto border border-error/20">
                      {result.error}
                    </pre>
                  </div>
                )}

                {/* Status */}
                <div className="flex items-center gap-2 text-sm">
                  {getStatusIcon(result.status)}
                  <span
                    className={
                      result.status === "success"
                        ? "text-success"
                        : "text-error"
                    }
                  >
                    {result.status === "success" ? "Success" : "Failed"}
                  </span>
                  <span className="text-muted text-xs">
                    (Exit code: {result.exit_code})
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-panelEdge">
                  <div className="text-center">
                    <p className="text-xs text-label">Time</p>
                    <p className="text-sm text-white font-mono">
                      {result.time}s
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-label">Memory</p>
                    <p className="text-sm text-white font-mono">
                      {result.memory} KB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Terminal size={32} className="text-muted/30 mb-3" />
                <p className="text-muted text-sm">
                  Run your code to see output
                </p>
                <p className="text-label text-xs">Results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompilerPage;
