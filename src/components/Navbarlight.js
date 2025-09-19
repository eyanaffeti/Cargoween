"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbarlight() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-[110px] flex items-center justify-between px-12 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white"
      }`}
    >
      {/* Logo */}
      <div className="absolute left-12 top-[5px] w-[120px] transition-all duration-300">
        <img src="/logodark.png" alt="Logo" className="w-full h-auto" />
      </div>

      {/* Navigation Links */}
      <div className="flex justify-center items-center space-x-8 absolute left-[354px] top-[35px]">
        <a
          href="#about"
          className="text-lg font-medium transition-all duration-300 text-[#121B2D] hover:text-[#0089B6]"
        >
          {language === "fr" ? "À propos" : "About"}
        </a>
        <a
          href="#transitaires"
          className="text-lg font-medium transition-all duration-300 text-[#121B2D] hover:text-[#0089B6]"
        >
          {language === "fr" ? "Transitaires" : "Forwarders"}
        </a>
        <a
          href="#compagnies"
          className="text-lg font-medium transition-all duration-300 text-[#121B2D] hover:text-[#0089B6]"
        >
          {language === "fr" ? "Compagnies aériennes" : "Airlines"}
        </a>
        <a
          href="#actualites"
          className="text-lg font-medium transition-all duration-300 text-[#121B2D] hover:text-[#0089B6]"
        >
          {language === "fr" ? "Actualités" : "News"}
        </a>
        <a
          href="#durabilite"
          className="text-lg font-medium transition-all duration-300 text-[#121B2D] hover:text-[#0089B6]"
        >
          {language === "fr" ? "Durabilité" : "Sustainability"}
        </a>
        <a
          href="#down"
          className="text-lg font-medium transition-all duration-300 text-[#121B2D] hover:text-[#0089B6]"
        >
          {language === "fr" ? "Contactez-nous" : "Contact"}
        </a>
      </div>

      {/* Boutons */}
      <div className="absolute right-12 flex space-x-4 items-center">
        {/* Connexion Button */}
        <button
          onClick={() => (window.location.href = "/login")}
          className="w-[282px] h-[48px] border-[2px] border-[#0089B6] text-[#121B2D] rounded-full font-medium hover:bg-[#0089B6] hover:text-white transition-all duration-300"
        >
          {language === "fr" ? "Connexion" : "Login"}
        </button>

        {/* Language Dropdown - identique à Navbar */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="w-[90px] h-[48px] border-[2px] border-[#0089B6] text-[#121B2D] rounded-full font-medium hover:bg-[#0089B6] hover:text-white transition-all duration-300"
          >
            {language === "fr" ? "FR" : "EN"}
          </button>

          {openDropdown && (
            <div className="absolute right-0 mt-2 w-[120px] rounded-[10px] shadow-lg bg-white z-50">
              <div
                onClick={() => {
                  setLanguage("fr");
                  setOpenDropdown(false);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                Français
              </div>
              <div
                onClick={() => {
                  setLanguage("en");
                  setOpenDropdown(false);
                }}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                English
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
