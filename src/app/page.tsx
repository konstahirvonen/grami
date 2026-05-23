"use client"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"


export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login")
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">In progress...</h1>
    </div>
  )
}