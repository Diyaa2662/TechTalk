import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <main className="pl-16">{children}</main>
    </div>
  );
};

export default MainLayout;
