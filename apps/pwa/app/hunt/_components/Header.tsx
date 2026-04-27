"use client"

import { User } from "lucide-react"

export default function Header() {
    return (
        <header className="flex justify-between bg-gray-800 text-white p-4">
            <h1>Bonjour Johnny !</h1>
            <User />
        </header>
    )
}