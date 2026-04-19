import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const OfflineBanner = ({ isOffline }) => {
  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className=" w-full z-50 flex justify-center items-center py-3 gap-3 bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg"
        >
          <WifiOff size={16} />
          <span className="text-sm font-medium">You are offline</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;