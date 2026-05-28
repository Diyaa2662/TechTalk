import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OtpPage from "./pages/OtpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SplashScreen from "./components/common/SplashScreen";
import BlogsPage from "./pages/BlogsPage";

// مكون لحماية الصفحات
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const splashShownRef = useRef(false);

  useEffect(() => {
    // التحقق إذا كان السبلاش ظهر في هذه الجلسة
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");

    if (!hasSeenSplash && !splashShownRef.current) {
      // أول مرة في هذه الجلسة → نظهر السبلاش
      splashShownRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSplash(true);
      sessionStorage.setItem("hasSeenSplash", "true");

      // منع السكرول
      document.body.style.overflow = "hidden";

      // بعد 2.5 ثانية نخفي السبلاش ونظهر المحتوى
      const timer = setTimeout(() => {
        setShowSplash(false);
        document.body.style.overflow = "auto";
        setIsAppReady(true);
      }, 2500);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = "auto";
      };
    } else {
      // السبلاش ظهر قبل هيك → نعرض المحتوى فوراً
      setIsAppReady(true);
      document.body.style.overflow = "auto";
    }
  }, []);

  // منع ظهور أي شيء قبل الاستعداد
  if (!isAppReady && showSplash === false) {
    return null;
  }

  return (
    <>
      {showSplash && (
        <SplashScreen
          onFinish={() => {
            setShowSplash(false);
            setIsAppReady(true);
          }}
        />
      )}
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout>
                <HomePage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/blogs"
          element={
            <PrivateRoute>
              <MainLayout>
                <BlogsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>
    </>
  );
}

export default App;
