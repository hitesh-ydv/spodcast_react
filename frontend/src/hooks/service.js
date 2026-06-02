import { useQuery } from "@tanstack/react-query";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export const useArtist = (id) => {
    return useQuery({
        queryKey: ["artist", id],

        queryFn: async () => {
            const { data } = await axios.get(
                `${API_URL}/api/artists/${id}`
            );

            return data.data;
        },

        enabled: !!id,
        staleTime: 1000 * 60 * 10,
    });
};

export const usePlaylist = (id) => {
    return useQuery({
        queryKey: ["playlist", id],

        queryFn: async () => {
            const { data } = await axios.get(
                `${API_URL}/api/playlists?id=${id}&page=0&limit=50`
            );

            return data.data;
        },

        enabled: !!id,

        staleTime: 1000 * 60 * 10, // 10 min
    });
};

export const useSong = (id) => {
    const songQuery = useQuery({
        queryKey: ["song", id],
        queryFn: async () => {
            const { data } = await axios.get(
                `${API_URL}/api/songs/${id}`
            );
            return data.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 10,
    });

    const lyricsQuery = useQuery({
        queryKey: ["lyrics", id],
        queryFn: async () => {
            const { data } = await axios.get(
                `${API_URL}/api/songs/${id}/lyrics`
            );
            return data.data?.lyrics || "Lyrics not available";
        },
        enabled: !!id,
        staleTime: Infinity, // lyrics rarely change
    });

    const recommendationsQuery = useQuery({
        queryKey: ["recommendations", id],
        queryFn: async () => {
            const { data } = await axios.get(
                `${API_URL}/api/songs/${id}/suggestions?limit=5`
            );
            return data.data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 30,
    });

    return {
        songQuery,
        lyricsQuery,
        recommendationsQuery,
    };
};

export const useAlbum = (id) => {
  return useQuery({
    queryKey: ["album", id],

    queryFn: async () => {
      const { data } = await axios.get(
        `${API_URL}/api/albums?id=${id}`
      );

      return data.data;
    },

    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 min
  });
};