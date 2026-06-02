import { useQuery } from "@tanstack/react-query";
import api from "../api/api";

export const useArtist = (id) => {
    return useQuery({
        queryKey: ["artist", id],

        queryFn: async () => {
            const { data } = await api.get(
                `/api/artists/${id}`
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
            const { data } = await api.get(
                `/api/playlists?id=${id}&page=0&limit=50`
            );

            return data.data;
        },

        enabled: !!id,
        staleTime: 1000 * 60 * 10,
    });
};

export const useSong = (id) => {
    const songQuery = useQuery({
        queryKey: ["song", id],

        queryFn: async () => {
            const { data } = await api.get(
                `/api/songs/${id}`
            );

            return data.data;
        },

        enabled: !!id,
        staleTime: 1000 * 60 * 10,
    });

    const lyricsQuery = useQuery({
        queryKey: ["lyrics", id],

        queryFn: async () => {
            const { data } = await api.get(
                `/api/songs/${id}/lyrics`
            );

            return data.data?.lyrics || "Lyrics not available";
        },

        enabled: !!id,
        staleTime: Infinity,
    });

    const recommendationsQuery = useQuery({
        queryKey: ["recommendations", id],

        queryFn: async () => {
            const { data } = await api.get(
                `/api/songs/${id}/suggestions?limit=5`
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
            const { data } = await api.get(
                `/api/albums?id=${id}`
            );

            return data.data;
        },

        enabled: !!id,
        staleTime: 1000 * 60 * 10,
    });
};