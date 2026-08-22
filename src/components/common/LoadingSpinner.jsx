import { Loader2 } from "lucide-react";

const LoadingSpinner = ({
  size = "md",
  fullPage = false,
  text = "Loading...",
}) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSize = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinner Container */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer Glow - متحرك */}
        <div className="absolute inset-0 bg-[#5CA1FC]/20 rounded-full blur-2xl animate-pulse"></div>

        {/* Outer Ring - متحرك */}
        <div className="absolute inset-[-4px] rounded-full border-2 border-[#5CA1FC]/10 animate-pulse"></div>

        {/* Main Spinner */}
        <Loader2
          className={`${sizeClasses[size]} text-[#5CA1FC] animate-spin relative z-10`}
        />

        {/* Inner Dot - نبض */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-[#5CA1FC] rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Text with shimmer effect */}
      {text && (
        <div className="flex flex-col items-center gap-1">
          <p
            className={`${textSize[size]} text-white font-medium animate-pulse`}
          >
            {text}
          </p>
          <div className="flex gap-1.5">
            <span
              className="w-1 h-1 bg-[#5CA1FC] rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></span>
            <span
              className="w-1 h-1 bg-[#5CA1FC] rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></span>
            <span
              className="w-1 h-1 bg-[#5CA1FC] rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></span>
          </div>
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg/80 backdrop-blur-sm">
        {/* Background Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-64 h-64 bg-[#5CA1FC]/5 rounded-full blur-3xl animate-pulse"></div>
        </div>
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
