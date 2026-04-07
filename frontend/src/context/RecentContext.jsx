import { createContext, useContext, useState, useEffect } from "react";

const RecentContext = createContext();

export const RecentProvider = ({ children }) => {
  const [recentPlayed, setRecentPlayed] = useState([]);

  // load once
  useEffect(() => {
    const stored = localStorage.getItem("recentPlayed");
    if (stored) {
      try {
        setRecentPlayed(JSON.parse(stored));
      } catch (e) {
        console.error("Error loading recentPlayed:", e);
      }
    }
  }, []);

  // 🔥 FIXED FUNCTION
  const saveToRecent = (item) => {
    setRecentPlayed((prev) => {
      let updated = [...prev];

      // remove duplicate
      updated = updated.filter(
        (i) => !(i.id === item.id && i.type === item.type)
      );

      // add to top
      updated.unshift(item);

      // limit
      if (updated.length > 15) updated.pop();

      // save to localStorage
      localStorage.setItem("recentPlayed", JSON.stringify(updated));

      return updated; // ✅ THIS triggers realtime update
    });
  };

  return (
    <RecentContext.Provider value={{ recentPlayed, saveToRecent }}>
      {children}
    </RecentContext.Provider>
  );
};

export const useRecent = () => useContext(RecentContext);