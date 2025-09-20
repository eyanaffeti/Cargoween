"use client";

import { useState, useEffect } from "react";
import {
  FaUser, FaSearch, FaCalendar, FaBox, FaCog, FaSignOutAlt,
  FaBars, FaTimes, FaPlus, FaEdit, FaUsers, FaChevronRight, FaTachometerAlt
} from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar({ onToggle }) {
  const [isOpen, setIsOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setUser(data);
    }
    fetchUser();
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onToggle && onToggle(!isOpen);
  };

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };

  // Vérifie si user est secondaire
  const isSecondary = (user?.role || "").toLowerCase().includes("secondaire");

  return (
    <div className={`bg-[#3F6592] text-white h-screen fixed top-0 left-0 transition-all duration-300 ${isOpen ? 'w-64' : 'w-20'} z-50 flex flex-col justify-between`}>
      
      {/* Toggle Button */}
      <button
        className="absolute -right-4 top-6 bg-white text-gray-700 p-2 rounded-full shadow"
        onClick={handleToggle}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div>
        {/* Logo */}
        <div className="flex justify-center items-center p-6">
          <img src="/logo.png" alt="CargoWeen" className={`${isOpen ? "w-20 h-20" : "w-10 h-10"} transition-all duration-300`} />
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col space-y-2 px-4">
          <SidebarLink icon={<FaTachometerAlt />} text="Tableau de bord" href="/Transitaire" isOpen={isOpen} />

          {/* Section Utilisateur */}
          <div
            onClick={() => !isSecondary && setUserMenuOpen(!userMenuOpen)} // 👈 bloque si secondaire
            className={`${isSecondary ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <SidebarLink
              icon={<FaUser />}
              text="Utilisateur"
              isOpen={isOpen}
              hasSubMenu
              isSubMenuOpen={userMenuOpen}
            />
          </div>

          {/* Sous-menu uniquement si pas secondaire */}
          {isOpen && userMenuOpen && !isSecondary && (
            <div className="ml-8 flex flex-col space-y-2 text-sm">
              <SidebarSubLink icon={<FaPlus />} text="Ajouter un sous-compte" href="/Transitaire/Comptes/Ajout" />
              <SidebarSubLink icon={<FaUsers />} text="Liste des sous-comptes" href="/Transitaire/Comptes/Liste" />
            </div>
          )}

          <SidebarLink icon={<FaSearch />} text="Recherche" href="/Transitaire/Reservation" isOpen={isOpen} />
          <SidebarLink icon={<FaCalendar />} text="Réservation" href="/Transitaire/Reservation/Liste" isOpen={isOpen} />
          <SidebarLink icon={<FaBox />} text="Stock LTA" href="/Transitaire/AWBStock" isOpen={isOpen} />

          {/* Menu Paramètres */}
          <div onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}>
            <SidebarLink
              icon={<FaCog />}
              text="Paramètres"
              isOpen={isOpen}
              hasSubMenu
              isSubMenuOpen={settingsMenuOpen}
            />
          </div>
          {isOpen && settingsMenuOpen && (
            <div className="ml-8 flex flex-col space-y-2 text-sm">
              <SidebarSubLink icon={<FaEdit />} text="Modifier profil" href="/Transitaire/Profil" />
              <div onClick={handleLogout}>
                <SidebarSubLink icon={<FaSignOutAlt />} text="Se déconnecter" />
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Déconnexion en bas */}
      <div className="mb-6 px-4">
        <SidebarLink icon={<FaSignOutAlt />} text="Se Déconnecter" isOpen={isOpen} onClick={handleLogout} />
      </div>
    </div>
  );
}

function SidebarLink({ icon, text, isOpen, onClick, href, hasSubMenu = false, isSubMenuOpen = false }) {
  const content = (
    <div
      className="flex items-center space-x-3 hover:bg-white/10 p-3 rounded-lg transition-all"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        {icon}
        {isOpen && <span>{text}</span>}
      </div>
      {isOpen && hasSubMenu && (
        <span>
          <FaChevronRight className={`transform transition-transform duration-300 ${isSubMenuOpen ? "rotate-90" : ""}`} />
        </span>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function SidebarSubLink({ icon, text, href }) {
  const content = (
    <div className="flex items-center space-x-2 text-white hover:text-gray-200 cursor-pointer">
      {icon}
      <span>{text}</span>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
