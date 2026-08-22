import { Loader2 } from "lucide-react";

const LoadingOverlay = ({ visible = true, text = "Loading..." }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg/80 backdrop-blur-sm transition-all duration-300">
      <div className="relative">
        <div className="absolute inset-0 bg-[#5CA1FC]/20 rounded-full blur-2xl animate-pulse"></div>
        <Loader2
          size={48}
          className="text-[#5CA1FC] animate-spin relative z-10"
        />
      </div>
      <p className="text-muted text-sm font-medium mt-6 animate-pulse">
        {text}
      </p>
    </div>
  );
};

export default LoadingOverlay;
