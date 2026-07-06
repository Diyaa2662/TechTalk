import { useEffect, useState } from "react";
import logo from "/src/assets/logo.png";

const SplashScreen = ({ onFinish }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // بعد 3 ثانية، نبدأ تأثير الاختفاء
    const timer = setTimeout(() => {
      setFadeOut(true);
      // بعد انتهاء تأثير الاختفاء، ننادي onFinish
      setTimeout(() => {
        onFinish();
      }, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between bg-bg transition-all duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* مساحة فارغة في الأعلى */}
      <div></div>

      {/* المحتوى الوسطي (اللوغو + الاسم + النقاط) */}
      <div className="flex flex-col items-center justify-center">
        {/* اللوغو */}
        <div className="relative">
          <div className="absolute inset-0 w-24 h-24 bg-accent/20 rounded-full blur-2xl"></div>
          <img
            src={logo}
            alt="TechTalk Logo"
            className="w-16 h-16 relative z-10"
          />
        </div>

        {/* اسم المنصة - Gradient Title */}
        <h1 className="gradient-title text-3xl font-bold mt-4">TechTalk</h1>

        {/* النقاط الثلاث */}
        <div className="flex space-x-2 mt-8">
          <div className="w-2.5 h-2.5 bg-accent rounded-full animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0s]"></div>
          <div className="w-2.5 h-2.5 bg-accent rounded-full animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0.3s]"></div>
          <div className="w-2.5 h-2.5 bg-accent rounded-full animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0.6s]"></div>
        </div>
      </div>

      {/* النسخة في أسفل الصفحة */}
      <p className="text-muted text-sm pb-6">version 1.0</p>
    </div>
  );
};

export default SplashScreen;
