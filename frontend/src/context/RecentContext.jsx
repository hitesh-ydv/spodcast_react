import { createContext, useContext, useEffect, useState } from "react";
import { useLoading } from "@/context/LoadingContext";
import toast from "react-hot-toast";

const RecentContext = createContext();

const API_URL = import.meta.env.VITE_API_URL2;

export const RecentProvider = ({ children }) => {
  const [recentPlayed, setRecentPlayed] = useState([]);
  const [loading, setLoading] = useState(true);

  const { startLoading, finishLoading } = useLoading();

  const removedFromRecent = () =>
    toast.success("Removed from Recents", {
      id: "recent-item",
      style: {
        background: "#fff",
        color: "#000",
        marginBottom: "100px",
      },
      duration: 2000,
    });

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
      console.log(data.data, "Fetched Recent Played");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const saveToRecent = async (item) => {

    const recentItem = {
      itemType: item.type || "song",
      itemId: String(item.id),
      title: item.name,
      artists: JSON.stringify(item.artists || item.artists.primary || []),
      image: item.image,
    };

    setRecentPlayed((prev) => {
      const filtered = prev.filter((i) => {
        const id = String(i.itemId || i.item_id);
        const type = i.itemType || i.item_type;

        return !(
          id === recentItem.itemId &&
          type === recentItem.itemType
        );
      });

      return [recentItem, ...filtered].slice(0, 10);
    });

    try {
      const token = localStorage.getItem("token");

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

  const removeRecent = async (itemType, itemId) => {
    try {
      startLoading();

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/recent/${itemType}/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      // ✅ Remove only after successful delete
      setRecentPlayed((prev) =>
        prev.filter((i) => {
          const type = i.itemType || i.item_type;
          const id = String(i.itemId || i.item_id);

          return !(type === itemType && id === String(itemId));
        })
      );

      removedFromRecent();
    } catch (err) {
      console.error(err);
    } finally {
      finishLoading();
    }
  };

  // Clear all
  const clearRecent = async () => {
    try {
      startLoading();
      const token = localStorage.getItem("token");

      await fetch(`${API_URL}/api/recent`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      finishLoading();

      setRecentPlayed([]);
    } catch (err) {
      console.error(err);
    }
  };

  const clearRecentPlayed = () => {
    setRecentPlayed([]);
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
        clearRecentPlayed,
      }}
    >
      {children}
    </RecentContext.Provider>
  );
};

export const useRecent = () => useContext(RecentContext);