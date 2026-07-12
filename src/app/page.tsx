"use client"

import BodyWeight from "@/components/bodyweight"
import HandleGoals from "@/components/handlegoals"
import Meals from "@/components/meals"
import WeightChart from "@/components/weightchart"
import WeightStats from "@/components/weightstats"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home({ userId } : { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [weightData, setWeightData] = useState<any[]>([])
  const [chartRange, setChartRange] = useState("7d")
  const [totalCalories, setTotalCalories] = useState(0)
  const [totalProtein, setTotalProtein] = useState(0)
  const [totalCarbs, setTotalCarbs] = useState(0)
  const [totalFat, setTotalFat] = useState(0)
  const [historyData, setHistoryData] = useState<any[]>([])

  const fetchTotals = async (uid: string) => {
        if (!uid) return

        const { data, error } = await supabase
            .from("meal_entries")
            .select(`
                id,
                user_id,
                meal,
                time,
                meal_ingredients (
                    id,
                    product_id,
                    grams,
                    count,
                    products (
                        name,
                        brand,
                        kcal,
                        protein,
                        carbs,
                        fat
                        )
                    )
                `)
            .eq("user_id", uid)
    
        if (error) {
            console.log(error.message)
            return
        }

        if (data) {
        let totalCalories = 0
        let totalProtein = 0
        let totalCarbs = 0
        let totalFat = 0

        data.forEach((meal) => {
            meal.meal_ingredients?.forEach((ing: any) => {
                const product = ing.products
                if (!product) return

                const isCountBased = ing.count && ing.count > 0
                const multiplier = isCountBased ? ing.count : (ing.grams || 0) / 100

                totalCalories += (product.kcal || 0) * multiplier
                totalProtein += (product.protein || 0) * multiplier
                totalCarbs += (product.carbs || 0) * multiplier
                totalFat += (product.fat || 0) * multiplier
            })
        })

        setTotalCalories(totalCalories)
        setTotalProtein(totalProtein)
        setTotalCarbs(totalCarbs)
        setTotalFat(totalFat)
      }    
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
            .order("date", { ascending: false })
            .then(({ data }) => {
                if (data) setWeightData(data)
            })

          supabase
            .from("day_result")
            .select("*")
            .eq("user_id", user.id)
            .order("date", { ascending: false })
            .then(({ data }) => {
              if (data) setHistoryData(data)
            })
      }
    })
  }, [])

  useEffect(() => {
        if (user) fetchTotals(user.id)
    }, [user])


  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="max-w-6xl mx-auto flex flex-col p-4">

        <HandleGoals
          userId={user.id}
          totalCalories={totalCalories}
          setTotalCalories={setTotalCalories}
          totalProtein={totalProtein}
          setTotalProtein={setTotalProtein}
          totalCarbs={totalCarbs}
          setTotalCarbs={setTotalCarbs}
          totalFat={totalFat}
          setTotalFat={setTotalFat}
          fetchTotals={fetchTotals}
          historyData={historyData}
          setHistoryData={setHistoryData}
          />

        <div className="flex flex-col md:flex-row gap-4 items-stretch">

          <BodyWeight userId={user.id} weightData={weightData} setWeightData={setWeightData} />

          <div className="border-1 border-[#404040] bg-[#2f2f2f] rounded-xl px-4 py-2 flex-1">

            {user && <WeightChart userId={user.id} weightData={weightData} range={chartRange} setRange={setChartRange} />}

          </div>

          <div className="border-1 border-[#404040] bg-[#2f2f2f] rounded-xl">

            {user && <WeightStats userId={user.id} weightData={weightData} chartRange={chartRange}/>}

          </div>

        </div>

        <div className="mt-4">

          <Meals
            userId={user.id}
            totalCalories={totalCalories}
            setTotalCalories={setTotalCalories}
            totalProtein={totalProtein}
            setTotalProtein={setTotalProtein}
            totalCarbs={totalCarbs}
            setTotalCarbs={setTotalCarbs}
            totalFat={totalFat}
            setTotalFat={setTotalFat}
            fetchTotals={fetchTotals}
            />

        </div>

        <div className="mt-4 border-1 border-[#404040] bg-[#2f2f2f] px-4 py-2 rounded-xl">
          <h2 className="font-semibold mb-2 text-center">Historia</h2>
          <div className="h-auto overflow-y-auto">
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead className="bg-[#212121]">
                <tr>
                  <th className="border border-[#404040]">PVM</th>
                  <th className="border border-[#404040]">K</th>
                  <th className="border border-[#404040]">P</th>
                  <th className="border border-[#404040]">HH</th>
                  <th className="border border-[#404040]">R</th>
                </tr>
              </thead>
              <tbody className="text-center">
                  {historyData.map((row) => (
                    <tr key={row.id ?? row.date}>
                      <td className="border border-[#404040]">{new Date(row.date).toLocaleDateString("fi-FI", { day: "2-digit", month: "narrow", year: "2-digit"})}</td>
                      <td className="border border-[#404040]">{row.calories.toFixed(2)}</td>
                      <td className="border border-[#404040]">{row.protein.toFixed(2)}</td>
                      <td className="border border-[#404040]">{row.carbs.toFixed(2)}</td>
                      <td className="border border-[#404040]">{row.fat.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  )
}