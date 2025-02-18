import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWifi } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const NetworkDetector = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 w-full bg-red-600 text-white text-center  shadow-md z-50 flex items-center justify-center space-x-3"
    >
      <FontAwesomeIcon icon={faWifi} className="text-2xl animate-pulse" />
      <span className="text-lg font-semibold">
      Oops! You’re offline. Check your internet connection.

      </span>
    </motion.div>
  );
};

export default NetworkDetector;
