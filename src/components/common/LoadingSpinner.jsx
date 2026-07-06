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

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse"></div>
        {/* Spinner */}
        <Loader2
          className={`${sizeClasses[size]} text-accent animate-spin relative z-10`}
        />
      </div>
      {text && (
        <p className="text-muted text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
