"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function Temoignage() {
  const { language } = useLanguage();

  return (
    <section id="About" className="relative bg-[#121B2D] py-20">
      {/* Rectangle flou */}
      <div
        className="absolute w-[1601px] h-[105px] -left-[133px] top-[154px] bg-[#304F6E] blur-[150px]"
      ></div>

      {/* Titre principal */}
      <div className="text-center mb-16">
        <h2 className="text-white text-[96px] font-roboto font-medium leading-[112px]">
          {language === "fr" ? "Témoignages" : "Testimonials"}
        </h2>
      </div>

      {/* Cartes des témoignages */}
      <div className="container mx-auto flex flex-col lg:flex-row justify-center items-center gap-10 lg:gap-12">
        {/* Témoignage 1 */}
        <div className="bg-[#FFFFFF4D] rounded-[40px] p-8 text-center w-[480px] h-[480px] flex flex-col items-center">
          <img
            src="/person1.png"
            alt="Jenny Wilson"
            className="w-[100px] h-[100px] rounded-full mb-6"
          />
          <h3 className="text-white text-[24px] font-medium mb-4">
            Jenny Wilson
          </h3>
          <p className="text-white text-[18px] leading-8">
            {language === "fr"
              ? "Cargoween est un outil indispensable pour notre équipe. Sa fiabilité et sa simplicité d’utilisation en font un allié précieux dans notre activité quotidienne."
              : "Cargoween is an essential tool for our team. Its reliability and simplicity make it a valuable ally in our daily operations."}
          </p>
        </div>

        {/* Témoignage 2 */}
        <div className="bg-[#FFFFFF4D] rounded-[40px] p-8 text-center w-[480px] h-[480px] flex flex-col items-center">
          <img
            src="/person2.png"
            alt="Kathryn Murphy"
            className="w-[100px] h-[100px] rounded-full mb-6"
          />
          <h3 className="text-white text-[24px] font-medium mb-4">
            Kathryn Murphy
          </h3>
          <p className="text-white text-[18px] leading-8">
            {language === "fr"
              ? "Ce système a révolutionné notre façon de travailler. Grâce à ses fonctionnalités avancées, nous avons pu optimiser nos processus tout en gagnant du temps."
              : "This system has revolutionized the way we work. Thanks to its advanced features, we have optimized our processes while saving time."}
          </p>
        </div>

        {/* Témoignage 3 */}
        <div className="bg-[#FFFFFF4D] rounded-[40px] p-8 text-center w-[480px] h-[480px] flex flex-col items-center">
          <img
            src="/person3.png"
            alt="Jacob Jones"
            className="w-[100px] h-[100px] rounded-full mb-6"
          />
          <h3 className="text-white text-[24px] font-medium mb-4">
            Jacob Jones
          </h3>
          <p className="text-white text-[18px] leading-8">
            {language === "fr"
              ? "Depuis que nous utilisons Cargoween, la gestion de nos réservations est devenue beaucoup plus fluide. L’interface est intuitive et parfaitement adaptée à nos besoins opérationnels."
              : "Since we started using Cargoween, managing our bookings has become much smoother. The interface is intuitive and perfectly suited to our operational needs."}
          </p>
        </div>
      </div>
    </section>
  );
}
