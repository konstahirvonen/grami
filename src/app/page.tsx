"use client"

import { supabase } from "@/lib/supabase"
import { refresh } from "next/cache"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [weight, setWeight] = useState("")
  const [calories, setCalorie] = useState("")
  const [protein, setProtein] = useState("")
  const [carbs, setCarbs] = useState("")
  const [fat, setFat] = useState("")
  const [goalsOpen, setGoalsOpen] = useState(false)
  const [goals, setGoals] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login")
      } else {
        setLoading(false)

        supabase
          .from("goals")
          .select("*")
          .eq("user_id", user.id)
          .single()
          .then(({ data }) => {
            if (data) setGoals(data)
          })
      }
    })
  }, [])

  const handleGoals = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    const { error } = await supabase
      .from("goals")
      .upsert({
        user_id: session?.user.id,
        calories: parseInt(calories),
        protein: parseInt(protein),
        carbs: parseInt(carbs),
        fat: parseInt(fat)
      }, { onConflict: "user_id" })

    if (error) {
      console.log(error.message)
    } else {
      console.log("Tavoitteet tallennettu!")
      setGoals({ calories: parseInt(calories), protein: parseInt(protein), carbs: parseInt(carbs), fat: parseInt(fat) })
    }
  }

  const handleSaveGoals= async () => {
    await handleGoals()
    setGoalsOpen(false)
  }

  const handleAddWeight = async () => {
    const { data: { session } } = await supabase.auth.getSession()


    //TODO: Tarkistus tähän ettei samana päivänä voi laittaa kuin yhden painon!
    const { error } = await supabase
      .from("weight")
      .insert({
        user_id: session?.user.id,
        weight_kg: parseFloat(weight),
        date: new Date().toISOString().split("T")[0]
      })
      
    if (error) {
      console.log(error.message)
    } else {
      console.log("Paino tallennettu!")
      setWeight("")
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col">

        <div className="relative grid grid-cols-4 gap-4 mb-8 border-2 border-blue-600 rounded-xl">
          <div className="p-4 text-center">
            <p className="text-sm text-white">Kalorit</p>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-white">/ {goals?.calories ?? "-"} kcal</p>
          </div>

          <div className="p-4 text-center">
            <p className="text-sm text-white">Proteiini</p>
            <p className="text-2xl font-bold text-white">g</p>
            <p className="text-sm text-white">/ {goals?.protein ?? "-"} g</p>
          </div>

          <div className="p-4 text-center">
            <p className="text-sm text-white">Hiilihydraatit</p>
            <p className="text-2xl font-bold text-white">g</p>
            <p className="text-sm text-white">/ {goals?.carbs ?? "-"} g</p>
          </div>

          <div className="p-4 text-center">
            <p className="text-sm text-white">Rasva</p>
            <p className="text-2xl font-bold text-white">g</p>
            <p className="text-sm text-white">/ {goals?.fat ?? "-"} g</p>
          </div>

          <div className="absolute top-2 right-2">
            <button onClick={() => setGoalsOpen(true)} className="hover:bg-neutral-800 cursor-pointer rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
            {goalsOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                  <div className="relative border-2 border-blue-600 rounded-xl p-6 flex flex-col gap-4 w-80">

                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold">Aseta tavoitteet</h2>
                      <button onClick={() => setGoalsOpen(false)} className="hover:bg-neutral-800 cursor-pointer rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <input type="number" placeholder="Kalorit (kcal)" value={calories}
                      onChange={(e) => setCalorie(e.target.value)}
                      className="border rounded px-3 py-2"
                    />
                    <input type="number" placeholder="Proteiini (g)" value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="border rounded px-3 py-2"
                    />
                    <input type="number" placeholder="Hiilihydraatit (g)" value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      className="border rounded px-3 py-2"
                    />
                    <input type="number" placeholder="Rasva (g)" value={fat}
                      onChange={(e) => setFat(e.target.value)}    
                      className="border rounded px-3 py-2"                
                    />

                    <div className="flex items-center justify-center">
                      <button onClick={handleSaveGoals}
                        className="text-white font-semibold rounded px-4 py-2 hover:bg-neutral-800 cursor-pointer">
                        Tallenna
                      </button>
                    </div>
                  </div>
                </div>
              )}
          </div>
          
        </div>

        <div className="border-2 border-blue-600 rounded-xl p-4 self-start">
            <h2 className="font-semibold mb-2 text-white">Kehonpaino</h2>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="border border-blue-600 rounded px-3 py-2 w-24 text-white"
              />
              <button onClick={handleAddWeight} className="text-white font-semibold rounded px-4 py-2 hover:bg-neutral-800 cursor-pointer">
                Lisää
              </button>
            </div>
        </div>
      </div>
    </div>
  )
}