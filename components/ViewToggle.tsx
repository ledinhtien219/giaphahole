"use client";

import { motion } from "framer-motion";
import { List, ListTree, Network } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type ViewMode = "list" | "tree" | "mindmap";

export default function ViewToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentView = (searchParams.get("view") as ViewMode) || "list";

  const setView = (view: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`${pathname}?${params.toString()}`);
  };

  const tabs = [
    { id: "list", label: "Danh sách", icon: <List className="w-4 h-4" /> },
    { id: "tree", label: "Sơ đồ cây", icon: <Network className="w-4 h-4" /> },
    { id: "mindmap", label: "Mindmap", icon: <ListTree className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="flex bg-stone-200/50 p-1.5 rounded-full shadow-inner w-fit mx-auto mt-4 mb-2 relative border border-stone-200/60 backdrop-blur-sm z-10">
      {tabs.map((tab) => {
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as ViewMode)}
            className={`relative px-4 sm:px-6 py-1.5 sm:py-2.5 text-sm font-semibold rounded-full transition-colors duration-300 ease-in-out cursor-pointer z-10 flex items-center gap-2 ${
              isActive
                ? "text-stone-900"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white rounded-full shadow-sm border border-stone-200/60 z-[-1]"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <span
              className={`transition-colors duration-300 ${isActive ? "text-amber-700" : "text-stone-400"}`}
            >
              {tab.icon}
            </span>
            <span className="hidden sm:inline-block tracking-wide">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
