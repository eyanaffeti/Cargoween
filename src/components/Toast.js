"use client";
import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
<div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-5 py-3 rounded-md shadow-lg text-white
      ${type === "success" ? "bg-green-500" : ""}
      ${type === "error" ? "bg-red-500" : ""}
      ${type === "info" ? "bg-blue-500" : ""}
      ${type === "warning" ? "bg-yellow-500 text-black" : ""}
    `}>
      {message}
    </div>
  );
}
