"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();

  return (
    <footer id="down" className="relative bg-[#121B2D] py-16 top-0">
      {/* Rectangle flou */}
      <div
        className="absolute w-[618px] h-[318px] right-[10px] top-[10px] bg-[#00DDFF] blur-[200px] z-0"
      ></div>

      <div className="relative container mx-auto bg-[#FFFFFF4D] rounded-[56px] shadow-lg p-10 flex flex-col lg:flex-row justify-between items-start px-6 lg:px-12 space-y-12 lg:space-y-0">
        
        {/* Logo + Map + Réseaux sociaux */}
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <div className="w-[150px]">
            <img
              src="/logo.png"
              alt="Cargoween Logo"
              className="w-full h-auto"
            />
          </div>

          {/* Map */}
          <div className="w-[400px] h-[250px] bg-gray-700 rounded-[40px] overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d802.4587377969353!2d10.67790991590578!3d36.43737348009879!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130299500c8b96b7%3A0x9063656468ec5150!2sCargoween!5e0!3m2!1sfr!2stn!4v1739154525299!5m2!1sfr!2stn"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* Réseaux sociaux */}
          <div className="flex space-x-4 mt-4">
            <a href="https://www.linkedin.com/company/cargoween/?originalSubdomain=tn" className="text-white text-[22px] hover:text-[#00DDFF]">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="#" className="text-white text-[22px] hover:text-[#00DDFF]">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#" className="text-white text-[22px] hover:text-[#00DDFF]">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>

        {/* Colonnes centrées avec espace en haut */}
        <div className="flex flex-col lg:flex-row justify-center items-start lg:space-x-32 w-full lg:w-auto mt-10">
          {/* Liens utiles */}
          <div className="text-white space-y-4 mt-10 lg:mt-40">
            <h3 className="text-[22px] font-semibold">
              {language === "fr" ? "Liens utiles" : "Useful Links"}
            </h3>
            <ul className="space-y-2">
              <li><a href="#top" className="text-[18px] hover:text-[#00DDFF]">{language === "fr" ? "Accueil" : "Home"}</a></li>
              <li><a href="#About" className="text-[18px] hover:text-[#00DDFF]">{language === "fr" ? "À propos" : "About"}</a></li>
              <li><a href="#Transitaires" className="text-[18px] hover:text-[#00DDFF]">{language === "fr" ? "Transitaires" : "Forwarders"}</a></li>
              <li><a href="#compagnies" className="text-[18px] hover:text-[#00DDFF]">{language === "fr" ? "Compagnies aériennes" : "Airlines"}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-white space-y-4 mt-10 lg:mt-40">
            <h3 className="text-[22px] font-semibold">
              {language === "fr" ? "Contact" : "Contact"}
            </h3>
            <ul className="space-y-4 text-[18px]">
              <li className="flex items-start space-x-3">
                <i className="fas fa-map-marker-alt text-[#00DDFF] mt-1"></i>
                <span>
                  Avenue de la République, Immeuble de l’Oranger,<br />
                  App N° 13.1, 1er étage, Nabeul 8000 – Tunisie
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-envelope text-[#00DDFF]"></i>
                <a href="mailto:cargoween@cargoween.com" className="hover:text-[#00DDFF]">
                  hello@cargoween.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <i className="fas fa-phone-alt text-[#00DDFF]"></i>
                <a href="tel:+21631594750" className="hover:text-[#00DDFF]">
                  +216 31 594 750
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-white text-[14px]">
        © {new Date().getFullYear()} <span className="font-bold">CargoWeen</span>.{" "}
        {language === "fr" ? "Tous droits réservés." : "All Rights Reserved."}
      </div>
    </footer>
  );
}
