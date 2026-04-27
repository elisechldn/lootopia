import { House, Trophy, User  } from "lucide-react";

export default function Navbar() {
    return (
        <footer>
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-around">
            <div className="flex flex-col items-center"><House /> <span>Accueil</span></div>
            <div className="flex flex-col items-center"><Trophy /> <span>Classement</span></div>
            <div className="flex flex-col items-center"><User /> <span>Profil</span></div>
            </nav>
        </footer>
    )
}