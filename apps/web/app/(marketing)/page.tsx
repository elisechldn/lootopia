import Navbar from "@/components/marketing/Navbar";
import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import Features from "@/components/marketing/Features";
import CallToAction from "@/components/marketing/CallToAction";
import Footer from "@/components/marketing/Footer";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white font-sans">
            <Navbar/>
            <Hero/>
            <HowItWorks/>
            <Features/>
            <CallToAction/>
            <Footer/>
        </main>
    );
}