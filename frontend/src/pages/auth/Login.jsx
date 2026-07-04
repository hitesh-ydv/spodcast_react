import { GoogleLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLibrary } from "@/context/LibraryContext";
import { useRecent } from "@/context/RecentContext";
const URL = import.meta.env.VITE_API_URL2;

export default function Login() {
  const navigate = useNavigate();
  const {
    clearLibraryData,
    fetchLikedSongs,
    fetchLibrary,
  } = useLibrary();

  const {
    clearRecentPlayed,
    fetchRecent,
  } = useRecent();

  const [loading, setLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  const [mousePosition, setMousePosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const messages = [
    "Millions of songs. Unlimited vibes.",
    "Your soundtrack starts here.",
    "Discover music you'll love.",
    "Stream without limits.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () =>
      window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);


      const { data } = await axios.post(
        `${URL}/api/auth/google`,
        {
          idToken: credentialResponse.credential,
        }
      );

      localStorage.setItem("token", data.token);


      clearLibraryData();
      clearRecentPlayed();

      // Fetch new user's data
      await Promise.all([
        fetchLikedSongs(),
        fetchLibrary(),
        fetchRecent(),
      ]);

      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const bubbles = [...Array(20)];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black flex items-center justify-center">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-black to-blue-950" />

      {/* Mouse Glow */}
      <motion.div
        className="pointer-events-none absolute w-[500px] h-[500px] rounded-full"
        animate={{
          x: mousePosition.x - 250,
          y: mousePosition.y - 250,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 120,
        }}
        style={{
          background:
            "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Floating Bubbles */}
      {bubbles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/5 backdrop-blur-md"
          style={{
            width: Math.random() * 120 + 40,
            height: Math.random() * 120 + 40,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-100, -1200],
            x: [0, Math.random() * 150 - 75],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: Math.random() * 15 + 15,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 10,
          }}
        />
      ))}

      {/* Floating Music Notes */}
      {["♪", "♫", "♬", "♩"].map((note, index) => (
        <motion.div
          key={index}
          className="absolute text-white/10 text-6xl font-bold -z-0"
          style={{
            left: `${15 + index * 20}%`,
            top: `${20 + index * 15}%`,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [-10, 10, -10],
          }}
          transition={{
            duration: 5 + index,
            repeat: Infinity,
          }}
        >
          {note}
        </motion.div>
      ))}

      {/* Glow Blobs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-600/20 blur-[180px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 blur-[180px] rounded-full" />

      {/* Login Card */}
      <motion.div
        // initial={{
        //   opacity: 0,
        //   scale: 0.9,
        //   y: 40,
        // }}
        // animate={{
        //   opacity: 1,
        //   scale: 1,
        //   y: 0,
        // }}
        whileHover={{
          scale: 1.02,
          y: -5,
        }}
        transition={{
          duration: 0.7,
        }}
        className="relative w-[90%] max-w-md z-10"
      >
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl p-10 shadow-2xl">

          {/* Glass Highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

          {/* Vinyl Record */}
          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-28 h-28 rounded-full bg-black border-8 border-gray-800 mx-auto relative overflow-hidden mb-6"
          >
            <div className="absolute inset-4 rounded-full border border-gray-700" />
            <div className="absolute inset-8 rounded-full border border-gray-700" />
            <div className="absolute inset-12 rounded-full border border-gray-700" />
            <div className="absolute w-4 h-4 bg-purple-500 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </motion.div>

          {/* Equalizer */}
          {/* <div className="flex justify-center gap-1 mb-6">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-purple-500 to-blue-400"
                animate={{
                  height: [10, 30, 50, 20, 40, 10],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div> */}

          <h1 className="text-white text-4xl font-bold text-center mb-3">
            Spodcast
          </h1>

          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-gray-400 text-center mb-10 h-6"
            >
              {messages[currentMessage]}
            </motion.p>
          </AnimatePresence>

          <div className="flex justify-center min-h-[44px]">
            {loading ? (
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full"
              />
            ) : (
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => console.log("Login Failed")}
                theme="filled_black"
                shape="pill"
                size="large"
              />
            )}
          </div>

          <p className="text-center text-gray-500 text-sm mt-8">
            Continue with Google to access your playlists
          </p>
        </div>
      </motion.div>
    </div>
  );
}