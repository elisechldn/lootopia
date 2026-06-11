"use client"

import { User } from "lucide-react"
import Link from "next/link"

export default function Header() {
    return (
        <header className="flex justify-between bg-gray-800 text-white p-4">
            <h1>Bonjour Johnny !</h1>
            <Link href="/profile">
            <User />
            </Link>
        </header>
    )
}