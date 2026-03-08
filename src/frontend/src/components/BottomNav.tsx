import { Compass, Home, PlusSquare, User } from "lucide-react";
import { motion } from "motion/react";
import type { Tab } from "../App";

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: {
  id: Tab;
  icon: React.ElementType;
  label: string;
  ocid: string;
}[] = [
  { id: "home", icon: Home, label: "Home", ocid: "nav.home.link" },
  { id: "explore", icon: Compass, label: "Explore", ocid: "nav.explore.link" },
  { id: "upload", icon: PlusSquare, label: "Upload", ocid: "nav.upload.link" },
  { id: "profile", icon: User, label: "Profile", ocid: "nav.profile.link" },
];

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav className="relative flex items-center justify-around bg-[oklch(0.09_0_0)] border-t border-[oklch(0.22_0_0)] safe-area-pb">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const isUpload = tab.id === "upload";

        return (
          <button
            key={tab.id}
            type="button"
            data-ocid={tab.ocid}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex flex-col items-center justify-center gap-0.5 py-3 px-5
              transition-colors duration-150 min-w-[56px]
              ${isActive && !isUpload ? "text-reel-pink" : "text-muted-foreground"}
              ${isUpload ? "text-foreground" : ""}
            `}
          >
            {isUpload ? (
              <span
                className={`
                  flex items-center justify-center w-8 h-8 rounded-lg
                  bg-reel-pink text-white transition-all duration-150
                  ${isActive ? "shadow-pink-glow scale-105" : ""}
                `}
              >
                <Icon size={18} strokeWidth={2.5} />
              </span>
            ) : (
              <>
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="transition-all duration-150"
                />
                <span
                  className={`text-[10px] font-medium tracking-wide transition-colors duration-150 ${isActive ? "text-reel-pink" : "text-muted-foreground"}`}
                >
                  {tab.label}
                </span>
              </>
            )}

            {isActive && !isUpload && (
              <motion.div
                layoutId="nav-indicator"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-reel-pink rounded-full"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
