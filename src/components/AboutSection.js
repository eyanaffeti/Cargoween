"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutSection() {
  const { language } = useLanguage();

  return (
    <section id="About" className="relative bg-[#121B2D] w-full py-20">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between px-10 space-y-10 lg:space-y-0 h-[550px]">
        {/* Texte */}
        <div className="text-left max-w-[800px]">
          <h2 className="text-white text-[48px] font-medium leading-tight mb-6">
            {language === "fr" ? "À Propos de Nous" : "About Us"}
          </h2>
          <p className="text-white text-[20px] leading-8">
            {language === "fr"
              ? "Nous sommes une startup Tunisienne labellisée par Startup Act depuis octobre 2022 localisée à Nabeul en Tunisie. Nous sommes spécialisés dans la digitalisation du fret aérien. Nos solutions s’adressent aux transitaires, commissionnaire en douane et compagnies aériennes à travers le monde pour les aider dans la gestion du processus de réservation du fret aérien."
              : "We are a Tunisian startup labeled by Startup Act since October 2022, based in Nabeul, Tunisia. We specialize in the digitalization of air freight. Our solutions are aimed at freight forwarders, customs brokers, and airlines worldwide to help them manage the air freight booking process."}
          </p>
        </div>

        {/* Image */}
        <div className="relative w-[643px] h-[232px]">
          <img src="/plane-image.png" alt="Plane" className="w-full h-full object-contain" />
        </div>
      </div>
    </section>
  );
}
