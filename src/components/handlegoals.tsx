"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function HandleGoals({ userId } : {userId:string}) {

    const [calories, setCalorie] = useState("")
    const [protein, setProtein] = useState("")
    const [carbs, setCarbs] = useState("")
    const [fat, setFat] = useState("")
    const [goalsOpen, setGoalsOpen] = useState(false)
    const [goals, setGoals] = useState<any>(null)

    useEffect(() => {
        if (!userId) return

        supabase
          .from("goals")
          .select("*")
          .eq("user_id", userId)
          .single()
          .then(({ data }) => {
            if (data) setGoals(data)
          })
    })

    const handleGoals = async () => {
    
        const { error } = await supabase
          .from("goals")
          .upsert({
            user_id: userId,
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

    return (

        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 bg-[#2f2f2f] border-1 border-[#404040] rounded-xl">
          <div className="p-4 text-center">
            <p className="text-m text-white font-semibold">Kalorit</p>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-m text-white font-semibold">/ {goals?.calories ?? "-"} kcal</p>
          </div>

          <div className="p-4 text-center">
            <p className="text-m text-white font-semibold">Proteiini</p>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-m text-white font-semibold">/ {goals?.protein ?? "-"} g</p>
          </div>

          <div className="p-4 text-center">
            <p className="text-m text-white font-semibold">Hiilihydraatit</p>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-m text-white font-semibold">/ {goals?.carbs ?? "-"} g</p>
          </div>

          <div className="p-4 text-center">
            <p className="text-m text-white font-semibold">Rasva</p>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-m text-white font-semibold">/ {goals?.fat ?? "-"} g</p>
          </div>

          <div className="absolute top-2 right-2">
            <button onClick={() => setGoalsOpen(true)} className="hover:bg-neutral-900 cursor-pointer rounded-xl p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
            </button>
          </div>
          
          {goalsOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
                  <div className="relative bg-[#212121] border-1 border-[#404040] rounded-xl p-4 flex flex-col gap-4 w-80">

                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold">Aseta tavoitteet</h2>
                      <button onClick={() => setGoalsOpen(false)} className="hover:bg-neutral-900 cursor-pointer rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <input type="number" placeholder="Kalorit (kcal)" value={calories}
                      onChange={(e) => setCalorie(e.target.value)}
                      className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                    />
                    <input type="number" placeholder="Proteiini (g)" value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                    />
                    <input type="number" placeholder="Hiilihydraatit (g)" value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                      className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                    />
                    <input type="number" placeholder="Rasva (g)" value={fat}
                      onChange={(e) => setFat(e.target.value)}    
                      className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"                
                    />

                    <div className="flex items-center justify-center">
                      <button onClick={handleSaveGoals}
                        className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                        Tallenna
                      </button>
                    </div>
                  </div>
                </div>
              )}
        </div>

    )
}