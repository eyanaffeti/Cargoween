"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
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
      className={`fixed top-0 left-0 w-full h-[100px] flex items-center justify-between px-8 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-[#121B2D]"
      }`}
    >
      {/* Logo */}
      <div
        className={`absolute left-[80px] top-[10px] w-[90px] h-[91px] transition-all duration-300 ${
          isScrolled ? "" : "filter brightness-0 invert"
        }`}
      >
        <a href="#top">
          <img
            src={isScrolled ? "/logodark.png" : "/logo.png"}
            alt="Logo"
            className="w-[102px] h-auto cursor-pointer"
          />
        </a>
      </div>

      {/* Navigation Links */}
      <div className="flex justify-center items-center space-x-12 absolute left-[346px] top-[47px]">
        <a
          href="#About"
          className={`text-base font-medium transition-all duration-300 ${
            isScrolled ? "text-[#121B2D]" : "text-white"
          } hover:underline`}
        >
          {language === "fr" ? "À propos" : "About"}
        </a>
        <a
          href="#Transitaires"
          className={`text-base font-medium transition-all duration-300 ${
            isScrolled ? "text-[#121B2D]" : "text-white"
          } hover:underline`}
        >
          {language === "fr" ? "Transitaires" : "Forwarders"}
        </a>
        <a
          href="#compagnies"
          className={`text-base font-medium transition-all duration-300 ${
            isScrolled ? "text-[#121B2D]" : "text-white"
          } hover:underline`}
        >
          {language === "fr" ? "Compagnies aériennes" : "Airlines"}
        </a>
        <a
          href="#actualites"
          className={`text-base font-medium transition-all duration-300 ${
            isScrolled ? "text-[#121B2D]" : "text-white"
          } hover:underline`}
        >
          {language === "fr" ? "Actualités" : "News"}
        </a>
        <a
          href="#Durabilite"
          className={`text-base font-medium transition-all duration-300 ${
            isScrolled ? "text-[#121B2D]" : "text-white"
          } hover:underline`}
        >
          {language === "fr" ? "Durabilité" : "Sustainability"}
        </a>
        <a
          href="#down"
          className={`text-base font-medium transition-all duration-300 ${
            isScrolled ? "text-[#121B2D]" : "text-white"
          } hover:underline`}
        >
          {language === "fr" ? "Contactez-nous" : "Contact"}
        </a>
      </div>

      {/* Buttons */}
      <div className="absolute flex space-x-2 items-center left-[1274px] top-[35px]">
        {/* Connexion */}
        <button
          onClick={() => (window.location.href = "/login")}
          className={`w-[282px] h-[48px] border-[3px] rounded-[40px] font-medium transition-all ${
            isScrolled
              ? "border-[#0089B6] text-[#121B2D] hover:bg-[#0089B6] hover:text-white"
              : "border-[#0089B6] text-white hover:bg-[#0089B6] hover:text-white"
          }`}
        >
          {language === "fr" ? "Connexion" : "Login"}
        </button>

        {/* Language Dropdown - design identique */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className={`w-[90px] h-[48px] border-[3px] rounded-[40px] font-medium transition-all ${
              isScrolled
                ? "border-[#0089B6] text-[#121B2D] hover:bg-[#0089B6] hover:text-white"
                : "border-[#0089B6] text-white hover:bg-[#0089B6] hover:text-white"
            }`}
          >
            {language === "fr" ? "FR" : "EN"}
          </button>

          {/* Menu déroulant */}
          {openDropdown && (
            <div
              className={`absolute right-0 mt-2 w-[120px] rounded-[10px] shadow-lg z-50 ${
                isScrolled ? "bg-white" : "bg-white"
              }`}
            >
              <div
                onClick={() => {
                  setLanguage("fr");
                  setOpenDropdown(false);
                }}
                className={`px-4 py-2 cursor-pointer ${
                  isScrolled ? "hover:bg-gray-200" : "hover:bg-[#0089B6]"
                }`}
              >
                Français
              </div>
              <div
                onClick={() => {
                  setLanguage("en");
                  setOpenDropdown(false);
                }}
                className={`px-4 py-2 cursor-pointer ${
                  isScrolled ? "hover:bg-gray-200" : "hover:bg-[#0089B6]"
                }`}
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
