"use client"

import HandleGoals from "@/components/handlegoals"
import WeightChart from "@/components/weightchart"
import WeightStats from "@/components/weightstats"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [weight, setWeight] = useState("")
  const [user, setUser] = useState<any>(null)
  const [weightData, setWeightData] = useState<any[]>([])
  const [message, setMessage] = useState("")
  const [chartRange, setChartRange] = useState("7d")

  const showMessage = (text: string) => {
        setMessage(text)
        setTimeout(() => setMessage(""), 3000)
    }

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

  const handleAddWeight = async () => {

    const today = new Date().toISOString().split("T")[0]

    const { data: existing } = await supabase
      .from("weight")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle()

    if (existing) {
      showMessage("Olet jo lisännyt painon tänään.")
      return
    }

    const { error } = await supabase
      .from("weight")
      .insert({
        user_id: user.id,
        weight_kg: parseFloat(weight),
        date: today
      })
      
    if (error) {
      console.log(error.message)
    } else {
      console.log("Paino tallennettu!")
      setWeightData((prev) =>
        [...prev, { weight_kg: parseFloat(weight), date: today}]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      )
      setWeight("")
    }
  }

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
          <div className="border-1 border-[#404040] bg-[#2f2f2f] p-4 rounded-xl">
              <h2 className="font-semibold mb-2 text-white text-center">Kehonpaino</h2>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="border border-[#404040] rounded-xl px-3 py-2 text-white w-full md:w-24"
                />
                <button onClick={handleAddWeight} className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                  Lisää
                </button>
              </div>
              {message && (
                    <div className={"fixed top-4 left-1/2 -translate-x-1/2 text-white bg-red-500 text-center px-4 py-2 rounded-xl shadow-lg"}>
                        {message}
                    </div>
                )}
              
              <div className="mt-4">
                <table className="w-full">
                  <colgroup>
                    <col className="w-1/2"/>
                    <col className="w-1/2"/>
                  </colgroup>
                  <thead className="border border-[#404040] bg-[#212121]">
                    <tr>
                      <th>PVM</th>
                      <th>Paino</th>
                    </tr>
                  </thead>
                </table>
              </div>
              <div className="h-64 overflow-y-auto weight-table -mr-1">
                <table className="w-full border-separate border-spacing-0">
                  <colgroup>
                    <col className="w-1/2"/>
                    <col className="w-1/2"/>
                  </colgroup>
                  <tbody className="text-right">
                      {weightData.map((row) => (
                        <tr key={row.id ?? row.date}>
                          <td className="border border-[#404040] pr-2">{new Date(row.date).toLocaleDateString("fi-FI", { day: "2-digit", month: "narrow"})}</td>
                          <td className="border border-[#404040] pr-2">{row.weight_kg}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

          <div className="border-1 border-[#404040] bg-[#2f2f2f] rounded-xl p-4 flex-1">
            <h2 className="font-semibold text-center">Painokuvaaja</h2>
            {user && <WeightChart userId={user.id} weightData={weightData} range={chartRange} setRange={setChartRange} />}
          </div>

          <div className="border-1 border-[#404040] bg-[#2f2f2f] rounded-xl">
            {user && <WeightStats userId={user.id} weightData={weightData} chartRange={chartRange}/>}
          </div>

        </div>

      </div>
    </div>
  )
}