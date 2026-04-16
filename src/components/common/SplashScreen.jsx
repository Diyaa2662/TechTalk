import { useEffect, useState } from "react";
import logo from "/src/assets/logo.png"; // غير المسار حسب مكان اللوجو

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
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between bg-darkShade transition-all duration-500 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* مساحة فارغة في الأعلى عشان الوسط يبقى متوازن */}
      <div></div>

      {/* المحتوى الوسطي (اللوغو + الاسم + النقاط) */}
      <div className="flex flex-col items-center justify-center">
        {/* اللوغو - تصغير */}
        <img src={logo} alt="TechTalk Logo" className="w-16 h-16 mb-4" />

        {/* اسم المنصة - تصغير */}
        <h1 className="text-2xl font-bold text-yellowShade mb-8">TechTalk</h1>

        {/* النقاط الثلاث */}
        <div className="flex space-x-2">
          <div className="w-2.5 h-2.5 bg-yellowShade rounded-full animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0s]"></div>
          <div className="w-2.5 h-2.5 bg-yellowShade rounded-full animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0.3s]"></div>
          <div className="w-2.5 h-2.5 bg-yellowShade rounded-full animate-[pulse_1.5s_ease-in-out_infinite] [animation-delay:0.6s]"></div>
        </div>
      </div>

      {/* النسخة في أسفل الصفحة */}
      <p className="text-gray-500 text-sm pb-6">version 1.0</p>
    </div>
  );
};

export default SplashScreen;
