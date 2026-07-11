"use client"

import { use, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)


    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const { error } = await supabase.auth.signInWithPassword({ email, password })

        setIsLoading(true)
        
        if (error) {
            toast.error("Kirjautuminen epäonnistui. Tarkista sähköposti tai salasana.")
            setIsLoading(false)
        } else {
            toast.success("Kirjautuminen onnistui!")
            router.refresh()
            setTimeout(() => {router.push("/")}, 500)
        }
    }

    return (
        <form onSubmit={handleLogin}>
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col gap-4 w-full max-w-sm p-8">
                    <h1 className="text-2xl font-bold text-center">Grami</h1>

                    <input
                        type="email"
                        placeholder="Sähköposti"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                    />

                    <input 
                        type="password"
                        placeholder="Salasana"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                    />

                    <button type="submit" disabled={isLoading} className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-3 py-2 cursor-pointer hover:bg-[#0d9166] disabled:bg-black disabled:cursor-not-allowed">
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : "Kirjaudu"}
                    </button>

                    <h2 className="text-center font-semibold">
                        Ei käyttäjää? <Link href="/signup" className="text-blue-400">Rekisteröidy</Link>
                    </h2>

                </div>
            </div>
        </form>
    )
}