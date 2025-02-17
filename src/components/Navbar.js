"use client";

import { useState, useEffect } from "react";

export default function Navbar() {

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full h-[120px] flex items-center justify-between px-8 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-[#121B2D]"
      }`}
    >
      {/* Logo */}
      <div
        className={`absolute left-[80px] top-[20px] w-[102px] h-[91px] transition-all duration-300 ${
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
      <div className="flex justify-center items-center space-x-12 absolute left-[246px] top-[57px]">
      <a
          href="#About"
          className={`text-base font-medium transition-all duration-300 ${
            isScrolled ? "text-[#121B2D]" : "text-white"
          } hover:underline`}
        >
           A propos   
        </a>
        <a
          href="#Transitaires"
          className={`text-base font-medium transition-all duration-300 ${
            isScrolled ? "text-[#121B2D]" : "text-white"
          } hover:underline`}
        >
          Transitaires
        </a>
        <a
          href="#compagnies"
          className={`text-base font-medium transition-all duration-300 ${
            isScrolled ? "text-[#121B2D]" : "text-white"
          } hover:underline`}
        >
          Compagnies aériennes
        </a>
        <a
          href="#partenaires"
          className={`text-base font-medium transition-all duration-300 ${
            isScrolled ? "text-[#121B2D]" : "text-white"
          } hover:underline`}
        >
          Cargo Avion
        </a>
        <a
          href="#actualites"
          className={`text-base font-medium transition-all duration-300 ${
            isScrolled ? "text-[#121B2D]" : "text-white"
          } hover:underline`}
        >
          Actualités
        </a>
      
        <a
          href="#Durabilite"
          className={`text-base font-medium transition-all duration-300 ${
            isScrolled ? "text-[#121B2D]" : "text-white"
          } hover:underline`}
        >
           Durabilté   
        </a>
        <a
          href="#contact"
          className={`text-base font-medium transition-all duration-300 ${
            isScrolled ? "text-[#121B2D]" : "text-white"
          } hover:underline`}
        >
          Contacter-nous
        </a>
      </div>

      {/* Buttons */}
      <div className="absolute flex space-x-2 items-center left-[1274px] top-[45px]">
        {/* Connexion Button */}
        <button         onClick={() => (window.location.href = "/login")} 

          className={`w-[282px] h-[48px] border-[3px] rounded-[40px] font-medium transition-all ${
            isScrolled
              ? "border-[#0089B6] text-[#121B2D] hover:bg-[#0089B6] hover:text-white"
              : "border-[#0089B6] text-white hover:bg-[#0089B6] hover:text-white"
          }`}
        >
          Connexion
        </button>

        {/* Language Dropdown */}
        <button
          className={`w-[68px] h-[48px] border-[3px] rounded-[40px] font-medium transition-all ${
            isScrolled
              ? "border-[#0089B6] text-[#121B2D] hover:bg-[#0089B6] hover:text-white"
              : "border-[#0089B6] text-white hover:bg-[#0089B6] hover:text-white"
          }`}
        >
          EN
        </button>
      </div>
    </nav>
  );
}
