import { createContext, useContext, useEffect, useState } from "react";

const RecentContext = createContext();

const API_URL = import.meta.env.VITE_API_URL2;

export const RecentProvider = ({ children }) => {
  const [recentPlayed, setRecentPlayed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load recent from backend
  const fetchRecent = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/recent`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setRecentPlayed(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  // Save recent
  const saveToRecent = async (item) => {
    const recentItem = {
      itemType: item.type || "song",
      itemId: String(item.id),
      title: item.name,
      image: item.image,
    };

    // Optimistic update
    setRecentPlayed((prev) => {
      const filtered = prev.filter(
        (i) =>
          !(
            i.itemId === recentItem.itemId &&
            i.itemType === recentItem.itemType
          )
      );

      return [recentItem, ...filtered].slice(0, 10);
    });

    try {
      const token = localStorage.getItem("token");

      console.log("token", token);

      await fetch(`${API_URL}/api/recent`, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify(recentItem),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Remove one item
  const removeRecent = async (itemType, itemId) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(
        `${API_URL}/api/recent/${itemType}/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecentPlayed((prev) =>
        prev.filter(
          (i) =>
            !(
              i.itemType === itemType &&
              i.itemId === itemId
            )
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Clear all
  const clearRecent = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/api/recent`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRecentPlayed([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <RecentContext.Provider
      value={{
        recentPlayed,
        loading,
        fetchRecent,
        saveToRecent,
        removeRecent,
        clearRecent,
      }}
    >
      {children}
    </RecentContext.Provider>
  );
};

export const useRecent = () => useContext(RecentContext);