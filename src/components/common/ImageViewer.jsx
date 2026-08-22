// src/components/common/ImageViewer.jsx
import { useState, useEffect } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ImageViewer = ({ images, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const currentImage = images[currentIndex];

  // التحكم بالأسهم من الكيبورد
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
      }
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length, onClose]);

  // منع التمرير في الخلفية
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    }
  };

  // منع الانتقال للصورة التالية عند السحب
  // eslint-disable-next-line no-unused-vars
  const handleImageClick = (e) => {
    if (!isDragging) {
      // إذا كان في وضع التكبير، نعيد للوضع الطبيعي
      if (scale > 1 || rotation !== 0) {
        handleReset();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
      >
        <X size={28} />
      </button>

      {/* Controls - Top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1.5 backdrop-blur-sm">
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded-full hover:bg-white/20 text-white transition-all duration-200"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <span className="text-white text-xs font-medium min-w-[40px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded-full hover:bg-white/20 text-white transition-all duration-200"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <div className="w-px h-5 bg-white/20"></div>
        <button
          onClick={handleRotate}
          className="p-1.5 rounded-full hover:bg-white/20 text-white transition-all duration-200"
          title="Rotate"
        >
          <RotateCw size={18} />
        </button>
        <div className="w-px h-5 bg-white/20"></div>
        <button
          onClick={handleReset}
          className="px-2 py-1 text-xs text-white hover:bg-white/20 rounded-full transition-all duration-200"
        >
          Reset
        </button>
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/50 rounded-full px-4 py-1.5 backdrop-blur-sm">
          <span className="text-white text-sm">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200 hover:scale-110"
            >
              <ChevronLeft size={32} />
            </button>
          )}
          {currentIndex < images.length - 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200 hover:scale-110"
            >
              <ChevronRight size={32} />
            </button>
          )}
        </>
      )}

      {/* Image */}
      <div
        className="relative w-full h-full flex items-center justify-center select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={currentImage.url || currentImage}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-[90vw] max-h-[85vh] object-contain cursor-grab active:cursor-grabbing transition-transform duration-200"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x / scale}px, ${position.y / scale}px)`,
          }}
          onClick={handleImageClick}
          draggable={false}
        />
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-xs text-white/30 hidden sm:block">
        ← → to navigate • Scroll to zoom • Drag to pan • ESC to close
      </div>
    </div>
  );
};

export default ImageViewer;
