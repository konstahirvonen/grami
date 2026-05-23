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
    <div className="max-w-4x1 mx-auto px-4 py-8">

      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Kalorit</p>
          <p className="text-2xl font-bold text-gray-500">0</p>
          <p className="text-sm text-gray-500">/  kcal</p>
        </div>

        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Proteiini</p>
          <p className="text-2xl font-bold text-gray-500">g</p>
          <p className="text-sm text-gray-500">/ g</p>
        </div>

        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Hiilihydraatit</p>
          <p className="text-2xl font-bold text-gray-500">g</p>
          <p className="text-sm text-gray-500">/ g</p>
        </div>

        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Rasva</p>
          <p className="text-2xl font-bold text-gray-500">g</p>
          <p className="text-sm text-gray-500">/ g</p>
        </div>

        <div className="bg-gray-100 rounded-xl p-4">
          <h2 className="font-semibold mb-4 text-gray-500">Kehonpaino</h2>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="kg"
              className="border rounded px-3 py-2 w-24 text-gray-500"
            />
            <button className="bg-black text-white rounded px-4 py-2 hover: bg-neutral-800 cursor-pointer">
              Lisää
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}