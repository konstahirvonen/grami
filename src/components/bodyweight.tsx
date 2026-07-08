"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"


export default function BodyWeight({ userId, weightData: initialData, setWeightData } : {
  userId:string,
  weightData: any[],
  setWeightData: React.Dispatch<React.SetStateAction<any[]>>
  })
  
  {
    const [weight, setWeight] = useState("")
    const [message, setMessage] = useState("")
    const weightData = initialData
    const [isLoading, setIsLoading] = useState(false)

    const showMessage = (text: string) => {
        setMessage(text)
        setTimeout(() => setMessage(""), 3000)
    }

    useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {

        if (!userId) return

        supabase
            .from("weight")
            .select("*")
            .eq("user_id", userId)
            .order("date", { ascending: false})
            .then(({ data }) => {
                if (data) setWeightData(data)
            })
        })
    }, [])

    const handleAddWeight = async () => {
        setIsLoading(true)
    
        const today = new Date().toISOString().split("T")[0]
    
        const { data: existing } = await supabase
          .from("weight")
          .select("id")
          .eq("user_id", userId)
          .eq("date", today)
          .maybeSingle()
    
        if (existing) {
          showMessage("Olet jo lisännyt painon tänään.")
          setIsLoading(false)
          return
        }
    
        const { error } = await supabase
          .from("weight")
          .insert({
            user_id: userId,
            weight_kg: parseFloat(weight),
            date: today
          })
          
        if (error) {
          console.log(error.message)
          setIsLoading(false)
        } else {
          showMessage("Paino tallennettu!")
          setWeightData((prev: any[]) =>
            [...prev, { weight_kg: parseFloat(weight), date: today}]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          )
          setWeight("")
        }
        setIsLoading(false)
      }

    return (
        <div className="border-1 border-[#404040] bg-[#2f2f2f] p-4 rounded-xl">
              <h2 className="font-semibold mb-2 text-center">Kehonpaino</h2>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="kg"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="border border-[#404040] rounded-xl px-3 py-2 text-white w-full md:w-24"
                />
                <button onClick={handleAddWeight} disabled={isLoading}
                  className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer w-20">
                  {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : "Lisää"}
                </button>
              </div>
              {message && (
                    <div className={`fixed top-4 left-1/2 -translate-x-1/2 text-white text-center px-4 py-2 rounded-xl shadow-lg ${message.includes("tallennettu") ? "bg-[#10b981]" : "bg-red-500"}`}>
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
    )
}