import { createContext, useContext, useRef } from "react";

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const loadingRef = useRef(null);

  const startLoading = () => {
    loadingRef.current?.continuousStart();
  };

  const finishLoading = () => {
    loadingRef.current?.complete();
  };

  return (
    <LoadingContext.Provider
      value={{
        loadingRef,
        startLoading,
        finishLoading,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);