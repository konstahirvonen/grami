"use client"

import { use, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")
    const [isError, setIsError] = useState(false)
    const router = useRouter()

    const showMessage = (text: string, error: boolean = false) => {
        setMessage(text)
        setIsError(error)
        setTimeout(() => setMessage(""), 3000)
    }

    const handleLogin = async () => {
            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                showMessage(error.message, true)
            } else {
                showMessage("Kirjautuminen onnistui!")
                router.push("/")
            }
        }

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

                <button onClick={handleLogin} className="bg-black text-white rounded px-3 py-2 cursor-pointer hover:bg-neutral-900">
                    Kirjaudu
                </button>

                <h2 className="text-center">
                    Ei käyttäjää? <Link href="/signup" className="text-blue-400">Rekisteröidy</Link>
                </h2>

                {message && (
                    <div className={`fixed top-4 left-1/2 -translate-x-1/2 text-white text-center px-4 py-2 rounded shadow-lg ${isError ? 'bg-red-800' : 'bg-green-800'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    )
}