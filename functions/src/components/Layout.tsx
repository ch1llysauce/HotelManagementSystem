import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setSidebarVisible(window.innerWidth >= 768);
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar visible={sidebarVisible} onClose={() => setSidebarVisible(false)} />
      {isMobile && !sidebarVisible && (
        <button
          onClick={() => setSidebarVisible(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded bg-sky-500 text-white shadow-md transition-all duration-300 hover:bg-sky-600 hover:scale-110"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {/* Main Content */}
      <main
        className={`
          flex-1 min-h-screen bg-gray-50 p-8 md:p-12 transition-all duration-500
          ${sidebarVisible && !isMobile ? "md:ml-64" : ""}
          ${sidebarVisible && isMobile ? "ml-64" : "ml-0"}
        `}
      >
        {children}
      </main>
    </div>
  );
}
