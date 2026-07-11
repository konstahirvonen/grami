"use client"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

export default function SignUpPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [confirmPassword, setConfirmPassword] = useState("")
    const handleSignUp = async () => {

        if (password !== confirmPassword) {
            toast.error("Salasanat eivät täsmää")
            return
        }

        const { error } = await supabase.auth.signUp({ email, password })

        setIsLoading(true)

        if (error) {
                toast.error(error.message)
                setIsLoading(false)
            } else {
                toast.success("Rekisteröinti onnistui!")
                supabase.auth.signOut()
                setTimeout(() => {router.push("/login")}, 500)
        }
    }


    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col gap-4 w-full max-w-sm p-8">
                <h1 className="text-2xl font-bold text-center">Luo uusi käyttäjä</h1>

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

                <input 
                    type="password"
                    placeholder="Vahvista salasana"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                />

                <button onClick={handleSignUp} disabled={isLoading} className="bg-[#10b981] border-1 border-[#404040] text-white font-semibold rounded-xl px-3 py-2 cursor-pointer hover:bg-[#0d9166] disabled:bg-black disabled:cursor-not-allowed">
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : "Rekisteröidy"}
                </button>

            </div>
        </div>
    )
}