import Header from "./_components/Header";
import ViewToggle from "./_components/ViewToggle";
import Navbar from "./Navbar";

export default function HuntPage() {
    return (
        <main className="bg-gray-100 min-h-screen">
            < Header />
            <ViewToggle />
            < Navbar />
        </main>
    )
}