// src/store/useScrollStore.js
import { create } from "zustand";

export const useScrollStore = create((set) => ({
  positions: {},
  setPosition: (path, pos) =>
    set((state) => ({
      positions: { ...state.positions, [path]: pos },
    })),
}));
