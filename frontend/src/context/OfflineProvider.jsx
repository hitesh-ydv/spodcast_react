import { createContext, useContext, useState } from "react";

const OfflineContext = createContext();

export const OfflineProvider = ({ children }) => {
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);

  // 👉 trigger banner for 2–3 sec
  const triggerSlowNetwork = (duration = 3000) => {
    setShowOfflineBanner(true);

    setTimeout(() => {
      setShowOfflineBanner(false);
    }, duration);
  };

  return (
    <OfflineContext.Provider value={{ showOfflineBanner, triggerSlowNetwork }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);