// utils/logoutChannel.js

const channel = new BroadcastChannel("spodcast-auth");

export const broadcastLogout = () => {
  channel.postMessage({
    type: "LOGOUT",
    timestamp: Date.now(),
  });
};

export const listenForLogout = (logoutCallback) => {
  const handler = (event) => {
    if (event.data?.type === "LOGOUT") {
      logoutCallback();
    }
  };

  channel.addEventListener("message", handler);

  return () => {
    channel.removeEventListener("message", handler);
  };
};