"use client"

import { use, useState } from "react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col gap-4 w-full max-w-sm p-8">
                <h1 className="text-2xl font-bold text-center">Grami</h1>

                <input
                    type="email"
                    placeholder="Sähköposti"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border rounded px-3 py-2"
                />

                <input 
                    type="password"
                    placeholder="Salasana"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded px-3 py-2"
                />

                <button className="bg-black text-white rounded px-3 py-2">
                    Kirjaudu
                </button>
            </div>
        </div>
    )
}