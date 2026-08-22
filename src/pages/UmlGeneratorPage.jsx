/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Loader2,
  Sparkles,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  X,
} from "lucide-react";
import api from "../services/api";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// أمثلة للوصف
const examples = [
  {
    title: "Car Wash System",
    description: "car wash system",
  },
  {
    title: "Library Management System",
    description: "library management system with books, members, and borrowing",
  },
  {
    title: "E-Commerce Platform",
    description:
      "e-commerce platform with products, shopping cart, orders, and payments",
  },
  {
    title: "Online Banking System",
    description:
      "online banking system with accounts, transactions, and transfers",
  },
  {
    title: "Hospital Management System",
    description:
      "hospital management system with patients, doctors, appointments, and medical records",
  },
];

const UmlGeneratorPage = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);
  const imageRef = useRef(null);
  const transformRef = useRef(null);

  const generateUml = async () => {
    if (!description.trim()) {
      setError("Please enter a system description.");
      return;
    }

    setLoading(true);
    setError("");
    setImageUrl(null);
    setGenerated(false);

    try {
      const response = await api.post(
        "/generate-uml",
        {
          description: description.trim(),
        },
        {
          responseType: "blob",
        },
      );

      const contentType = response.headers["content-type"] || "";

      if (contentType.includes("image")) {
        const imageUrl = URL.createObjectURL(response.data);
        setImageUrl(imageUrl);
        setGenerated(true);
        setTimeout(() => {
          if (transformRef.current) {
            transformRef.current.resetTransform();
          }
        }, 100);
      } else {
        const text = await response.data.text();
        try {
          const json = JSON.parse(text);
          setError(json.message || "Failed to generate UML diagram.");
        } catch {
          setError("Unexpected response from server.");
        }
      }
    } catch (err) {
      console.error("UML Generation Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to generate UML diagram. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `uml-diagram-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExampleClick = (example) => {
    setDescription(example.description);
    setError("");
  };

  const resetForm = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setDescription("");
    setImageUrl(null);
    setGenerated(false);
    setError("");
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-muted hover:text-white group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#5CA1FC]/10">
              <Sparkles size={22} className="text-[#5CA1FC]" />
            </div>
            <h1 className="gradient-title text-2xl font-bold">UML Generator</h1>
          </div>
        </div>
        {generated && imageUrl && (
          <button
            onClick={downloadImage}
            className="flex items-center gap-2 px-4 py-2 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg transition-all duration-300 hover:scale-[1.02] shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
          >
            <Download size={18} />
            Download
          </button>
        )}
      </div>

      {/* Description Input */}
      <div className="glass-card p-6 mb-6 hover:border-[#5CA1FC]/20 transition-all duration-300">
        <label className="block text-sm font-medium text-label mb-2">
          System Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the system you want to generate UML diagram for..."
          rows="4"
          className="input-field resize-none focus:ring-[#5CA1FC] focus:border-[#5CA1FC]"
        />

        {/* Examples */}
        <div className="mt-3">
          <p className="text-xs text-muted mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(example)}
                className="text-xs px-3 py-1.5 bg-[#5CA1FC]/10 hover:bg-[#5CA1FC]/20 text-[#5CA1FC] rounded-full transition-colors hover:scale-[1.05]"
              >
                {example.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={generateUml}
            disabled={loading || !description.trim()}
            className="flex-1 px-6 py-3 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(92,161,252,0.25)] hover:shadow-[0_8px_32px_rgba(92,161,252,0.35)] hover:scale-[1.02]"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate UML
              </>
            )}
          </button>
          {generated && (
            <button
              onClick={resetForm}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg transition-all duration-300 hover:text-[#5CA1FC] hover:scale-[1.02] flex items-center gap-2"
            >
              <RefreshCw size={18} />
              New
            </button>
          )}
        </div>

        {error && (
          <div className="mt-3 p-3 bg-error/20 border border-error/30 rounded-lg slide-up">
            <p className="text-error text-sm text-center">{error}</p>
          </div>
        )}
      </div>

      {/* Result */}
      {loading && (
        <div className="glass-card p-12 flex flex-col items-center justify-center">
          <Loader2 size={48} className="text-[#5CA1FC] animate-spin mb-4" />
          <p className="text-muted">Generating UML diagram...</p>
          <p className="text-label text-sm">This may take a few moments</p>
        </div>
      )}

      {generated && imageUrl && (
        <div className="glass-card p-4 hover:border-[#5CA1FC]/20 transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">Generated UML Diagram</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-bg/50 rounded-lg p-1">
                <button
                  onClick={() => {
                    if (transformRef.current) {
                      transformRef.current.zoomIn();
                    }
                  }}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors text-muted hover:text-[#5CA1FC]"
                  title="Zoom In"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => {
                    if (transformRef.current) {
                      transformRef.current.zoomOut();
                    }
                  }}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors text-muted hover:text-[#5CA1FC]"
                  title="Zoom Out"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={() => {
                    if (transformRef.current) {
                      transformRef.current.resetTransform();
                    }
                  }}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors text-muted hover:text-[#5CA1FC]"
                  title="Reset"
                >
                  <RefreshCw size={16} />
                </button>
                <div className="w-px h-5 bg-panelEdge"></div>
                <button
                  onClick={() => {
                    if (transformRef.current) {
                      transformRef.current.setTransform(0, 0, 1);
                    }
                  }}
                  className="p-1.5 rounded hover:bg-white/10 transition-colors text-muted hover:text-[#5CA1FC]"
                  title="Fit to Screen"
                >
                  <Maximize size={16} />
                </button>
              </div>

              {/* ✅ زر التحميل جنب أزرار التحكم */}
              <button
                onClick={downloadImage}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5CA1FC] hover:bg-[#4A8BE8] text-white rounded-lg transition-all duration-300 hover:scale-[1.05] text-sm font-medium shadow-[0_4px_16px_rgba(92,161,252,0.25)]"
                title="Download Image"
              >
                <Download size={16} />
                Download
              </button>
            </div>
          </div>

          <div
            className="w-full bg-white/5 rounded-lg overflow-hidden"
            style={{ height: "500px" }}
          >
            <TransformWrapper
              ref={transformRef}
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              centerOnInit={true}
              wheel={{ step: 0.001 }}
              pan={{ velocity: true }}
            >
              {({ zoomIn, zoomOut, resetTransform, setTransform, state }) => (
                <>
                  <TransformComponent
                    wrapperStyle={{
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <img
                      ref={imageRef}
                      src={imageUrl}
                      alt="UML Diagram"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      draggable={false}
                    />
                  </TransformComponent>

                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-bg/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-muted">
                    {Math.round(state.scale * 100)}% • Scroll to zoom • Drag to
                    pan
                  </div>
                </>
              )}
            </TransformWrapper>
          </div>
        </div>
      )}
    </div>
  );
};

export default UmlGeneratorPage;
