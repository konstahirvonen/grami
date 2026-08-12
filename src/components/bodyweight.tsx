"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function BodyWeight({ userId, weightData: initialData, setWeightData } : {
  userId:string,
  weightData: any[],
  setWeightData: React.Dispatch<React.SetStateAction<any[]>>
  })
  
  {
    const [weight, setWeight] = useState("")
    const [previousWeight, setPreviousWeight] = useState("")
    const [date, setDate] = useState("")
    const weightData = initialData
    const [isLoading, setIsLoading] = useState(false)
    const [addPreviousOpen, setAddPreviousOpen] = useState(false)

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
          toast.error("Olet jo lisännyt painon tänään.")
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
          toast.success("Paino tallennettu!")
          setWeightData((prev: any[]) =>
            [...prev, { weight_kg: parseFloat(weight), date: today}]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          )
          setWeight("")
        }
        setIsLoading(false)
      }

    const handleAddOldWeight = async () => {
      setIsLoading(true)

      const { data: existing } = await supabase
          .from("weight")
          .select("id")
          .eq("user_id", userId)
          .eq("date", date)
          .maybeSingle()
    
        if (existing) {
          toast.error("Olet jo lisännyt valitulle päivälle.")
          setIsLoading(false)
          return
        }

      const { error } = await supabase
        .from("weight")
        .insert({
          user_id: userId,
          weight_kg: parseFloat(previousWeight),
          date: date
        })

        if (error) {
          console.log(error.message)
          setIsLoading(false)
        } else {
          toast.success("Paino tallennettu!")
          setWeightData((prev: any[]) =>
            [...prev, { weight_kg: parseFloat(previousWeight), date: date}]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          )
          setWeight("")
        }
        setIsLoading(false)
    }

    return (
        <div className="border-1 border-[#404040] bg-[#2f2f2f] px-4 py-2 rounded-xl">
          
            <div className="flex items-center justify-between mb-2">

              <div className="flex-1"></div>
              
              <div className="flex-1">
                <h2 className="font-semibold">Kehonpaino</h2>
              </div>

              <div className="flex-1 flex justify-end">
                <button onClick={() => setAddPreviousOpen(true)} 
                  className="hover:bg-neutral-900 cursor-pointer rounded-xl p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                    </svg>
                  </button>
                </div>

            </div>

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

              {addPreviousOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
                  <div className="relative bg-[#212121] border-1 border-[#404040] rounded-xl px-4 py-2 flex flex-col gap-2 w-full max-w-96 mx-4">
                    
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Lisää paino</h2>
                        <button onClick={() => setAddPreviousOpen(false)} className="hover:bg-neutral-900 cursor-pointer rounded-full p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="kg"
                        value={previousWeight}
                        onChange={(e) => setPreviousWeight(e.target.value)}
                        className="border border-[#404040] rounded-xl px-3 py-2 text-white w-full"
                      />
                      
                      <input
                        type="date"
                        placeholder="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="border border-[#404040] rounded-xl px-3 py-2 text-white w-full"
                      />

                    </div>

                    <div className="flex items-center justify-center">
                      <button onClick={handleAddOldWeight} disabled={isLoading}
                          className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                          {isLoading ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                          ) : "Tallenna"}
                      </button>
                    </div>

                  </div>
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