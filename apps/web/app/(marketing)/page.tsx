import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import Features from "@/components/marketing/Features";
import CallToAction from "@/components/marketing/CallToAction";

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white">
            <Hero/>
            <HowItWorks/>
            <Features/>
            <CallToAction/>
        </main>
    );
}