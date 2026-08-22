import { useEffect, useState } from "react";
import logo from "/src/assets/logo.png";

const SplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onFinish();
      }, 600);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between bg-bg transition-all duration-700 ${
        fadeOut
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Background Orbs - شفافية خفيفة جداً */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-[#5CA1FC]/5 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#5CA1FC]/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#5CA1FC]/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "0.5s" }}
      ></div>

      {/* مساحة فارغة في الأعلى */}
      <div></div>

      {/* المحتوى الوسطي */}
      <div className="flex flex-col items-center justify-center relative z-10">
        {/* اللوغو مع تأثيرات متعددة */}
        <div className="relative">
          {/* Outer Glow - بدون شفافية */}
          <div className="absolute inset-[-20px] bg-[#5CA1FC]/10 rounded-full blur-3xl animate-pulse"></div>

          {/* Rotating Ring */}
          <div
            className="absolute inset-[-8px] rounded-full border-2 border-[#5CA1FC]/20 animate-spin"
            style={{ animationDuration: "8s" }}
          ></div>
          <div
            className="absolute inset-[-14px] rounded-full border border-[#5CA1FC]/10 animate-spin"
            style={{ animationDuration: "12s", animationDirection: "reverse" }}
          ></div>

          {/* Logo Container - بدون أي شفافية */}
          <div className="relative w-24 h-24 rounded-full bg-panel flex items-center justify-center border border-[#5CA1FC]/20 shadow-panel">
            <img
              src={logo}
              alt="TechTalk Logo"
              className="w-14 h-14 relative z-10 animate-[pulse_2s_ease-in-out_infinite]"
            />
          </div>
        </div>

        {/* اسم المنصة */}
        <h1 className="gradient-title text-4xl font-bold mt-6 tracking-tight animate-[pulse_2s_ease-in-out_infinite]">
          TechTalk
        </h1>

        <p className="text-muted text-sm mt-1">Developer Community</p>

        {/* النقاط الثلاث المتحركة */}
        <div className="flex space-x-3 mt-8">
          <div className="w-3 h-3 bg-[#5CA1FC] rounded-full animate-[bounce_1.2s_ease-in-out_infinite] [animation-delay:0ms] shadow-lg shadow-[#5CA1FC]/30"></div>
          <div className="w-3 h-3 bg-[#5CA1FC] rounded-full animate-[bounce_1.2s_ease-in-out_infinite] [animation-delay:200ms] shadow-lg shadow-[#5CA1FC]/30"></div>
          <div className="w-3 h-3 bg-[#5CA1FC] rounded-full animate-[bounce_1.2s_ease-in-out_infinite] [animation-delay:400ms] shadow-lg shadow-[#5CA1FC]/30"></div>
        </div>
      </div>

      {/* النسخة في أسفل الصفحة */}
      <div className="flex flex-col items-center gap-1 pb-8 relative z-10">
        <p className="text-muted text-xs tracking-widest">version 1.0</p>
        <div className="flex items-center gap-2">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#5CA1FC]/20"></div>
          <div className="w-1 h-1 bg-[#5CA1FC]/30 rounded-full"></div>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#5CA1FC]/20"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
