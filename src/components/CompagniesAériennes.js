"use client";
import { useLanguage } from "@/context/LanguageContext";

export default function CompagniesAeriennes() {
  const { language } = useLanguage();

  return (
    <section id="compagnies" className="relative bg-[#121B2D] py-20">
      {/* Image principale */}
      <div className="relative flex justify-center mb-32 opacity-85">
        <img
          src="/aircargo.png"
          alt="Avion Cargo"
          className="w-[1955px] h-[457px] object-cover"
        />
      </div>

      {/* Rectangle flou */}
      <div
        className="absolute w-[1601px] h-[305px] -left-[133px] top-[854px] bg-[#304F6E] blur-[150px]"
      ></div>

      {/* Titre principal */}
      <div className="text-center mb-32">
        <h2 className="text-white text-[80px] font-roboto font-medium">
          {language === "fr"
            ? "Solution Compagnies aériennes"
            : "Airlines Solution"}
        </h2>
      </div>

      {/* Image principale des étapes */}
      <div className="relative flex justify-center mb-4">
        <img
          src="/solutioncompagnies.png"
          alt="Solution Transitaires"
          className="w-[1352px] h-[400px] object-contain"
        />
      </div>

      {/* Groupes de solutions */}
      <div className="container mx-auto flex flex-col lg:flex-row justify-between items-center space-y-10 lg:space-y-0">
        <div className="flex flex-col items-center text-center space-y-4">
          <h3 className="text-white text-[40px] font-roboto font-medium">
            {language === "fr" ? "Gagnez en visibilité" : "Gain Visibility"}
          </h3>
        </div>

        <div className="flex flex-col items-center text-center space-y-4">
          <h3 className="text-white text-[40px] font-roboto font-medium">
            {language === "fr" ? "Gagner en compétitivité" : "Increase Competitiveness"}
          </h3>
        </div>

        <div className="flex flex-col items-center text-center space-y-4">
          <h3 className="text-white text-[40px] font-roboto font-medium">
            {language === "fr" ? "Améliorez vos performances" : "Improve Your Performance"}
          </h3>
        </div>
      </div>

      {/* Group 45 */}
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 mt-48">
        {/* Gagnez en visibilité */}
        <div className="flex flex-col items-start text-left space-y-4">
          <h3 className="text-white text-[48px] font-medium leading-[56px]">
            {language === "fr"
              ? "Gagnez en visibilité sur le marché"
              : "Increase Your Market Visibility"}
          </h3>
          <p className="text-white text-[24px] leading-[28px]">
            {language === "fr"
              ? "Avec cargoween.com, vos offres seront consultées par un nombre croissant de transitaires internationaux. Grâce à notre processus de vérification interne, nous garantissons la confidentialité de vos tarifs. Nous traitons aussi les demandes B2C des clients qui ne passent pas par un transitaire. Cela grâce à des partenariats solides dans divers pays à travers le monde."
              : "With cargoween.com, your offers will be viewed by a growing number of international freight forwarders. Thanks to our internal verification process, we guarantee the confidentiality of your rates. We also handle B2C requests from customers who do not go through a forwarder, thanks to solid partnerships in various countries worldwide."}
          </p>
        </div>
        <div className="flex justify-center">
          <img
            src="/visibilté d offre pour le transitaire.jpg"
            alt="Visibilité"
            className="w-[684px] h-[353px] object-contain"
          />
        </div>

        {/* Gagner en efficacité */}
        <div className="flex justify-center order-last lg:order-none">
          <img
            src="/reservation sur offre pub.jpg"
            alt="Efficacité"
            className="w-[798px] h-[408px] object-contain"
          />
        </div>
        <div className="flex flex-col items-start text-left space-y-4">
          <h3 className="text-white text-[40px] font-medium leading-[47px]">
            {language === "fr"
              ? "Gagner en efficacité et en compétitivité"
              : "Gain Efficiency and Competitiveness"}
          </h3>
          <p className="text-white text-[24px] leading-[28px]">
            {language === "fr"
              ? "Le processus actuel vous fait perdre un temps et des coûts considérables dans des opérations de réservation manuelles lourdes (appels, e-mails, devis). Notre solution vous aidera à augmenter votre efficacité et à réduire les coûts et le temps de traitement. Votre équipe commerciale pourra se concentrer alors sur des tâches à forte valeur ajoutée. Vous bénéficierez aussi automatiquement de tous les accords et partenariats que nous mettrons en place à travers le monde."
              : "The current process makes you lose considerable time and costs in heavy manual booking operations (calls, emails, quotes). Our solution will help you increase efficiency and reduce costs and processing time. Your sales team will then be able to focus on higher-value tasks. You will also automatically benefit from all agreements and partnerships we establish worldwide."}
          </p>
        </div>

        {/* Stratégie commerciale */}
        <div className="flex flex-col items-start text-left space-y-4">
          <h3 className="text-white text-[40px] font-medium leading-[47px]">
            {language === "fr"
              ? "Nous vous aiderons à définir votre stratégie commerciale"
              : "We Will Help You Define Your Commercial Strategy"}
          </h3>
          <p className="text-white text-[32px] leading-[38px]">
            {language === "fr"
              ? "Nous vous offrons des outils BI accessibles dans votre espace client sécurisé qui vous donneront une visibilité complète sur vos performances commerciales en temps réel. Nous pouvons également vous accompagner dans le processus de migration d’offres statiques à des offres dynamiques pour maximiser vos revenus."
              : "We provide BI tools accessible in your secure client area, giving you complete visibility of your commercial performance in real-time. We can also support you in migrating from static offers to dynamic offers to maximize your revenue."}
          </p>
        </div>
        <div className="flex justify-center">
          <img
            src="/Dashboard Airline.jpg"
            alt="Stratégie commerciale"
      className="w-[711px] h-[192px]] object-contain"
          />
        </div>
      </div>
    </section>
  );
}
