"use client"

import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function NavBar() {
    const [user, setUser] = useState<any>(null)
    const router = useRouter()

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
    }

    return (
        <>
            <div className="fixed top-4 left-5">
                <Link href="/" className="inline-flex items-center justify-center bg-[#303030] border-1 border-[#404040] text-white rounded-full h-10 w-10 cursor-pointer hover:bg-neutral-900 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                    </svg>
                </Link>
            </div>
                <div className="fixed top-4 right-4 flex flex-row gap-2">
                    {user ? (
                        <>
                            <button onClick={handleLogout} className="bg-[#303030] border-1 border-[#404040] text-white rounded-full px-2 py-2 cursor-pointer hover:bg-neutral-900">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                                </svg>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="bg-[#303030] border-1 border-[#404040] text-white font-semibold rounded-xl px-4 py-2 cursor-pointer hover:bg-neutral-900">
                                Kirjaudu
                            </Link>
                            <Link href="/signup" className="bg-[#303030] border-1 border-[#404040] text-white font-semibold rounded-xl px-4 py-2 cursor-pointer hover:bg-neutral-900">
                                Rekisteröidy
                            </Link>
                        </>
                    )}
            </div>
        </>
    )
}