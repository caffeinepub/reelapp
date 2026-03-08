import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import BottomNav from "./components/BottomNav";
import ExplorePage from "./pages/ExplorePage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import SplashPage from "./pages/SplashPage";
import UploadPage from "./pages/UploadPage";

export type Tab = "home" | "explore" | "upload" | "profile";

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<Tab>("home");

  if (showSplash) {
    return <SplashPage onPlay={() => setShowSplash(false)} />;
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-background flex flex-col">
      <main className="flex-1 overflow-hidden">
        {activeTab === "home" && <HomePage />}
        {activeTab === "explore" && <ExplorePage onNavigate={setActiveTab} />}
        {activeTab === "upload" && (
          <UploadPage onSuccess={() => setActiveTab("home")} />
        )}
        {activeTab === "profile" && <ProfilePage />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Toaster position="top-center" theme="dark" />
    </div>
  );
}
