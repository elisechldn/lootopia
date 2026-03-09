"use client";

import {useState} from "react";

export default function RegisterForm() {
    const [agreed, setAgreed] = useState(false);

    return (
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-10">
            {/* Title */}
            <div className="flex flex-col items-center gap-3 mb-8">
                <h1 className="text-xl font-bold text-gray-900">Inscription</h1>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                     className="w-10 h-10 text-gray-900">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>
                </svg>
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-3 mb-6">
                <input
                    type="text"
                    placeholder="Nom"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
                <input
                    type="text"
                    placeholder="Prénom"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
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
                <input
                    type="password"
                    placeholder="Confirmez le mot de passe"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
            </div>

            {/* Terms */}
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer mb-6">
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={() => setAgreed(!agreed)}
                    className="w-4 h-4 rounded border-gray-300"
                />
                J&apos;accepte les conditions générales
            </label>

            {/* Submit */}
            <button
                className="w-full bg-gray-900 text-white text-sm font-semibold py-3 rounded-xl hover:bg-gray-800 transition-colors">
                Créer un compte
            </button>
        </div>
    );
}