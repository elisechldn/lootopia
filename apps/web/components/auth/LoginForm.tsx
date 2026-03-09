"use client";

import Link from "next/link";
import {useState} from "react";

function MapIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-gray-900">
            <path
                d="M15.75 8.25a.75.75 0 01.75.75c0 1.12-.492 2.126-1.27 2.812a.75.75 0 11-.992-1.124A2.243 2.243 0 0015 9a.75.75 0 01.75-.75z"/>
            <path fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM4.575 15.6a8.25 8.25 0 009.348 3.750l-3.590-3.590A3.75 3.75 0 014.575 15.6zm8.273-9.067a3.75 3.75 0 00-5.743 4.957l3.590 3.590a8.25 8.25 0 002.153-8.547z"
                  clipRule="evenodd"/>
        </svg>
    );
}

export default function LoginForm() {
    const [rememberMe, setRememberMe] = useState(false);

    return (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-10">
            {/* Title */}
            <div className="flex flex-col items-center gap-3 mb-8">
                <h1 className="text-xl font-bold text-gray-900">Connexion</h1>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                     className="w-10 h-10 text-gray-900">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>
                </svg>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-3 mb-6">
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between mb-6">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="w-4 h-4 rounded border-gray-300"
                    />
                    Se souvenir de moi
                </label>
                <Link href="/forgot-password" className="text-sm text-gray-900 underline hover:text-gray-600">
                    Mot de passe oublié ?
                </Link>
            </div>

            {/* Submit */}
            <button
                className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors">
                Se connecter
            </button>
        </div>
    );
}