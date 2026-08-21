import { useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import PostDetailsPage from "./pages/PostDetailsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OtpPage from "./pages/OtpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SplashScreen from "./components/common/SplashScreen";
import BlogsPage from "./pages/BlogsPage";
import BlogDetailsPage from "./pages/BlogDetailsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import CreatePostPage from "./pages/CreatePostPage";
import SearchPage from "./pages/SearchPage";
import DraftsPage from "./pages/DraftsPage";
import EditProfilePage from "./pages/EditProfilePage";
import CreateBlogPage from "./pages/CreateBlogPage";
import EditBlogPage from "./pages/EditBlogPage";
import ActivityPage from "./pages/ActivityPage";
import ChatPage from "./pages/ChatPage";
import RoadMapsPage from "./pages/RoadMapsPage";
import RoadMapDetailsPage from "./pages/RoadMapDetailsPage";
import UmlGeneratorPage from "./pages/UmlGeneratorPage";
import CompilerPage from "./pages/CompilerPage";
import SettingsPage from "./pages/SettingsPage";

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<OtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
        <Route
          path="/blogs/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <BlogDetailsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-blog/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <EditBlogPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <MainLayout>
                <NotificationsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/posts/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <PostDetailsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <PrivateRoute>
              <MainLayout>
                <UserProfilePage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/create-post"
          element={
            <PrivateRoute>
              <MainLayout>
                <CreatePostPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/create-blog"
          element={
            <PrivateRoute>
              <MainLayout>
                <CreateBlogPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/search"
          element={
            <PrivateRoute>
              <MainLayout>
                <SearchPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/drafts"
          element={
            <PrivateRoute>
              <MainLayout>
                <DraftsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <PrivateRoute>
              <MainLayout>
                <EditProfilePage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <PrivateRoute>
              <MainLayout>
                <ActivityPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <MainLayout>
                <ChatPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/roadmaps"
          element={
            <PrivateRoute>
              <MainLayout>
                <RoadMapsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/roadmaps/:id"
          element={
            <PrivateRoute>
              <MainLayout>
                <RoadMapDetailsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/uml"
          element={
            <PrivateRoute>
              <MainLayout>
                <UmlGeneratorPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/compiler"
          element={
            <PrivateRoute>
              <MainLayout>
                <CompilerPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <MainLayout>
                <SettingsPage />
              </MainLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
