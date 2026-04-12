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

  const saveToRecent = (item) => {
    setRecentPlayed((prev) => {
      // 🧠 Normalize values (important!)
      const newItem = {
        ...item,
        id: String(item.id),
        type: item.type || "song",
      };

      let updated = prev.filter(
        (i) =>
          !(String(i.id) === newItem.id && (i.type || "song") === newItem.type)
      );

      // add to top
      updated.unshift(newItem);

      // limit 15
      if (updated.length > 15) updated = updated.slice(0, 15);

      // save
      localStorage.setItem("recentPlayed", JSON.stringify(updated));

      return updated;
    });
  };

  return (
    <RecentContext.Provider value={{ recentPlayed, saveToRecent }}>
      {children}
    </RecentContext.Provider>
  );
};

export const useRecent = () => useContext(RecentContext);