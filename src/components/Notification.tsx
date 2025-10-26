"use client";
import { useEffect, useState } from "react";

export default function Notification() {
  const [isVisible, setIsVisible] = useState(false);
  const notification = "🎉 New Feature: Page Transitions and Speech Synthesis!";

  useEffect(() => {
    const notificationClosed = localStorage.getItem("notificationClosed");
    const storedNotification = localStorage.getItem("notification");

    if (notificationClosed !== "true" || storedNotification !== notification) {
      setIsVisible(true);
      localStorage.setItem("notification", notification);
      localStorage.setItem("notificationClosed", "false");
    }
  }, []);

  useEffect(() => {
    // Add/remove padding to body based on visibility
    if (isVisible) {
      document.body.style.paddingTop = "32px"; // Height of notification banner
    } else {
      document.body.style.paddingTop = "0px";
    }

    return () => {
      document.body.style.paddingTop = "0px";
    };
  }, [isVisible]);

  const handleClose = () => {
    localStorage.setItem("notificationClosed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-300 text-white px-4 py-1 text-center z-50">
      <p className="text-sm text-black italic">{notification}</p>
      <button
        onClick={handleClose}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200"
      >
        ✕
      </button>
    </div>
  );
}
