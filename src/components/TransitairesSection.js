"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function TransitairesSection() {
  const { language } = useLanguage();

  return (
    <section id="Transitaires" className="relative bg-[#121B2D] py-20 overflow-hidde">
      {/* Fond flou */}
      <div
        className="absolute w-[1601px] h-[305px] -left-[133px] top-[304px] bg-[#304F6E] blur-[150px]"
      ></div>

      {/* Titre principal */}
      <div className="text-center mb-2">
        <h2 className="text-white text-[100px] font-roboto">
          {language === "fr" ? "Solution Transitaires" : "Forwarders Solution"}
        </h2>
      </div>

      {/* Image principale des étapes */}
      <div className="relative flex justify-center mb-16">
        <img
          src="/solution.png"
          alt={language === "fr" ? "Solution Transitaires" : "Forwarders Solution"}
          className="w-[1354px] h-[408px] object-contain"
        />
      </div>

      {/* Étapes principales */}
      <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center space-y-10 lg:space-y-0">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-white text-[54px] font-medium">
            {language === "fr" ? "Rechercher" : "Search"}
          </h3>
        </div>

        <div className="flex flex-col items-center text-center">
          <h3 className="text-white text-[54px] font-medium">
            {language === "fr" ? "Comparer" : "Compare"}
          </h3>
        </div>

        <div className="flex flex-col items-center text-center">
          <h3 className="text-white text-[54px] font-medium">
            {language === "fr" ? "Réserver" : "Book"}
          </h3>
        </div>
      </div>

      <div className="container mx-auto mt-48 space-y-16">
        {/* Rechercher des devis */}
        <div className="flex flex-col lg:flex-row items-center lg:space-x-10 space-y-10 lg:space-y-0">
          <div className="lg:w-1/2">
            <h4 className="text-white text-[40px] font-roboto mb-4">
              {language === "fr"
                ? "Rechercher des devis en deux clics"
                : "Search for quotes in two clicks"}
            </h4>
            <p className="text-white text-[26px] font-roboto leading-8">
              {language === "fr"
                ? "Grâce aux partenariats avec plusieurs compagnies aériennes, vous n’avez plus besoin d’envoyer des demandes de devis pour avoir les prix correspondant à vos critères. En quelques minutes, vous pouvez accéder à toutes les offres et capacités disponibles pour votre marchandise. Il faut juste vous inscrire et remplir les champs qui correspondent au vol que vous recherchez."
                : "Thanks to partnerships with several airlines, you no longer need to send quote requests to get prices that match your criteria. In just a few minutes, you can access all available offers and capacities for your cargo. You simply need to sign up and fill in the fields that match the flight you are looking for."}
            </p>
          </div>
          <div className="lg:w-1/2">
            <img
              src="/recherche vol.jpg"
              alt={language === "fr" ? "Devis" : "Quotes"}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Comparer les offres */}
        <div className="flex flex-col lg:flex-row-reverse items-center lg:space-x-reverse lg:space-x-10 space-y-10 lg:space-y-0">
          <div className="lg:w-1/2">
            <h4 className="text-white text-[40px] font-roboto mb-4">
              {language === "fr" ? "Comparer les offres" : "Compare offers"}
            </h4>
            <p className="text-white text-[26px] font-roboto leading-8">
              {language === "fr"
                ? "Les offres qui correspondent à vos critères de recherche seront listées clairement et vous pouvez les organiser facilement selon vos préférences (prix, durée…). Les tarifs sont les mêmes que ceux des compagnies aériennes et sont disponibles en temps réel."
                : "Offers that match your search criteria will be clearly listed, and you can easily organize them according to your preferences (price, duration, etc.). The rates are the same as those from airlines and are available in real-time."}
            </p>
          </div>
          <div className="lg:w-1/2">
            <img
              src="/affiche vols.jpg"
              alt={language === "fr" ? "Comparer" : "Compare"}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Réserver */}
        <div className="flex flex-col lg:flex-row items-center lg:space-x-10 space-y-10 lg:space-y-0">
          <div className="lg:w-1/2">
            <h4 className="text-white text-[40px] font-roboto mb-4">
              {language === "fr"
                ? "Réserver et recevoir la confirmation instantanément"
                : "Book and receive instant confirmation"}
            </h4>
            <p className="text-white text-[26px] font-roboto leading-8">
              {language === "fr"
                ? "Une fois que vous avez fait votre choix, il faut juste saisir votre identifiant. Un document sera automatiquement généré pour valider votre réservation. Tous vos documents sont centralisés dans votre tableau de bord."
                : "Once you have made your choice, you just need to enter your ID. A document will be automatically generated to validate your booking. All your documents are centralized in your dashboard."}
            </p>
          </div>
          <div className="lg:w-1/2">
            <img
              src="/details reservation et ajout lta.jpg"
              alt={language === "fr" ? "Réserver" : "Book"}
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
