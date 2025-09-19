"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

export default function HeroSection() {
  const { language } = useLanguage();

  return (
    <section
      id="top"
      className="relative bg-[#121B2D] min-h-screen flex flex-col justify-center items-center px-6 lg:px-16 overflow-hidden"
    >
      {/* Rectangle en haut */}
      <div className="absolute top-0 left-0 w-full h-[107px] bg-[#121B2D]"></div>

      {/* Ellipse floue */}
      <motion.div
        className="absolute w-[266px] h-[266px] -left-[133px] top-[60%] bg-[#00D5FF] blur-[200px]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
      ></motion.div>

      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between w-full px-4 lg:px-16">
        {/* Texte à gauche */}
        <motion.div
          className="text-left max-w-lg space-y-6 ml-20"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.6 }}
        >
          <h1 className="text-white font-roboto text-[42px] md:text-[56px] lg:text-[54px] leading-tight">
            {language === "fr"
              ? "Simplifiez votre fret aérien"
              : "Simplify Your Air Freight"}
          </h1>
          <p className="text-white font-roboto text-[18px] md:text-[24px] leading-7">
            {language === "fr"
              ? "Cargoween.com est une plateforme digitale fiable qui vous permet de réserver instantanément vos opérations de transport aérien."
              : "Cargoween.com is a reliable digital platform that allows you to instantly book your air freight operations."}
          </p>
          <motion.button
            onClick={() => (window.location.href = "/identifier")}
            className="px-8 py-3 text-white border-4 border-[#0089B6] rounded-full text-lg font-medium hover:bg-[#0089B6] transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {language === "fr" ? "Commencer" : "Get Started"}
          </motion.button>
        </motion.div>

        {/* Vidéo à droite */}
        <motion.div
          className="w-[800px] h-[600px] rounded-2xl overflow-hidden"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }}
        >
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/MAP CargoWeen.mp4" type="video/mp4" />
            {language === "fr"
              ? "Votre navigateur ne supporte pas la lecture de vidéos."
              : "Your browser does not support video playback."}
          </video>
        </motion.div>
      </div>

      {/* Bande avec l'image des logos */}
      <div className="absolute w-full h-[75px] bottom-0 bg-[#D2E5FF] opacity-80 overflow-hidden">
        <motion.div
          className="flex items-center animate-scroll"
          initial={{ x: "100%" }}
          animate={{ x: "-100%" }}
          transition={{
            repeat: Infinity,
            duration: 10,
            ease: "linear",
          }}
        >
          <img
            src="/partenaires.png"
            alt={language === "fr" ? "Bande de logos" : "Logos strip"}
            className="h-full object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
}
