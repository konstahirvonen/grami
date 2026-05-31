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

          const totalCalories = data.reduce((sum, meal) => {
            const mealCalories = meal.meal_ingredients.reduce((s: number, ing: any) => {
              return s + (ing.grams * ing.products?.kcal / 100)
              }, 0)
            return sum + mealCalories
          }, 0)

          const totalProtein = data.reduce((sum, meal) => {
            const mealProtein = meal.meal_ingredients.reduce((s: number, ing: any) => {
              return s + (ing.grams * ing.products?.protein / 100)
            }, 0)
            return sum + mealProtein
          }, 0)

          const totalCarbs = data.reduce((sum, meal) => {
            const mealCarbs = meal.meal_ingredients.reduce((s: number, ing: any) => {
              return s + (ing.grams * ing.products?.carbs / 100)
            }, 0)
            return sum + mealCarbs
          }, 0)

          const totalFat = data.reduce((sum, meal) => {
            const mealFat = meal.meal_ingredients.reduce((s: number, ing: any) => {
              return s + (ing.grams * ing.products?.fat / 100)
            }, 0)
            return sum + mealFat
          }, 0)

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
            .order("date", { ascending: false})
            .then(({ data }) => {
                if (data) setWeightData(data)
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
      <div className="max-w-6xl mx-auto flex flex-col">

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
          fetchTotals={fetchTotals}/>

        <div className="flex flex-col md:flex-row gap-4 items-stretch">

          <BodyWeight userId={user.id} weightData={weightData} setWeightData={setWeightData} />

          <div className="border-1 border-[#404040] bg-[#2f2f2f] rounded-xl p-4 flex-1">

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
          fetchTotals={fetchTotals}/>

        </div>
      </div>
    </div>
  )
}