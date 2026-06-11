import { House, Trophy, User  } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
    return (
        <footer>
            <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex justify-around">
            <div className="flex flex-col items-center"><Link href="/"><House /> <span>Accueil</span></Link></div>
            <div className="flex flex-col items-center"><Trophy /> <span>Classement</span></div>
            <div className="flex flex-col items-center"><Link href="/profile"><User /> <span>Profil</span></Link></div>
            </nav>
        </footer>
    )
}