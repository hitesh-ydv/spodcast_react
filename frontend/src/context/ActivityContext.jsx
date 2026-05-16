import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const ActivityContext = createContext();

const STORAGE_KEY = "userActivity";

export const ActivityProvider = ({ children }) => {
  const [activity, setActivity] = useState([]);
  const [topActivity, setTopActivity] = useState([]);

  // 🔹 load from localStorage
  const loadActivity = useCallback(() => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    setActivity(data);
  }, []);

  // 🔹 record activity
  const recordActivity = (item) => {
    let updated = [...activity];

    const index = updated.findIndex((a) => a.id === item.id);

    if (index !== -1) {
      updated[index].lastPlayed = Date.now();
      updated[index].playCount += 1;
    } else {
      updated.push({
        ...item,
        lastPlayed: Date.now(),
        playCount: 1,
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setActivity(updated);
  };

  const computeTopActivity = useCallback(() => {
    const qualified = activity.filter(item => {
      if (item.type === "song") return item.playCount >= 3;
      if (["album", "playlist", "artist"].includes(item.type)) return item.playCount >= 3;
      return false;
    });

    const liked = activity.find(item => item.type === "liked");

    if (qualified.length === 0) {
      setTopActivity([]);
      return;
    }

    qualified.sort((a, b) => a.lastPlayed - b.lastPlayed);

    let result = [];

    if (liked) {
      result.push(liked, qualified[0]);

      for (let i = 1; i < qualified.length; i++) {
        result.push(qualified[i]);
        if (result.length === 8) break;
      }
    } else {
      result = qualified.slice(0, 8);
    }

    if (result.length < 2) {
      setTopActivity([]);
      return;
    }

    let count = result.length;

    if (count >= 8) count = 8;
    else if (count >= 6) count = 6;
    else if (count >= 4) count = 4;
    else count = 2;

    setTopActivity(result.slice(0, count));
  }, [activity]);

  // 🔄 load once
  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  // 🔄 recompute when activity changes
  useEffect(() => {
    computeTopActivity();
  }, [computeTopActivity]);

  return (
    <ActivityContext.Provider
      value={{
        activity,
        topActivity,
        recordActivity,
        refreshActivity: loadActivity,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => useContext(ActivityContext);