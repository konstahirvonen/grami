"use client"

import BodyWeight from "@/components/bodyweight"
import HandleGoals from "@/components/handlegoals"
import Meals from "@/components/meals"
import WeightChart from "@/components/weightchart"
import WeightStats from "@/components/weightstats"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [weightData, setWeightData] = useState<any[]>([])
  const [chartRange, setChartRange] = useState("7d")

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login")
      } else {
        setUser(user)
        setLoading(false)

          supabase
            .from("weight")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false})
            .then(({ data }) => {
                if (data) setWeightData(data)
            })
      }
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="max-w-6xl mx-auto p-4 flex flex-col">
        
        <HandleGoals userId={user.id} />

        <div className="flex flex-col md:flex-row gap-4 items-stretch">

          <BodyWeight userId={user.id}/>

          <div className="border-1 border-[#404040] bg-[#2f2f2f] rounded-xl p-4 flex-1">

            {user && <WeightChart userId={user.id} weightData={weightData} range={chartRange} setRange={setChartRange} />}

          </div>

          <div className="border-1 border-[#404040] bg-[#2f2f2f] rounded-xl">

            {user && <WeightStats userId={user.id} weightData={weightData} chartRange={chartRange}/>}

          </div>

        </div>

        <div className="mt-4">

          <Meals userId={user.id} />

        </div>

      </div>
    </div>
  )
}