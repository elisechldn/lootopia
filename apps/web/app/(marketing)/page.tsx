import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import Features from "@/components/marketing/Features";
import CallToAction from "@/components/marketing/CallToAction";
import { apiRefreshToken } from "@/lib/auth";
export default function HomePage() {
    (async () => {
        try {
            await apiRefreshToken();
        } catch {
            // Si le rafraîchissement échoue, on ignore (l'utilisateur n'est pas connecté)
        }
    })();

    return (
        <main className="min-h-screen bg-white">
            <Hero/>
            <HowItWorks/>
            <Features/>
            <CallToAction/>
        </main>
    );
}