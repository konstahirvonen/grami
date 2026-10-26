"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type WeightEntry = {
  id: number
  user_id?: string
  weight_kg: number
  date: string
}

export default function BodyWeight({ userId, weightData: initialData, setWeightData } : {
  userId:string,
  weightData: WeightEntry[],
  setWeightData: React.Dispatch<React.SetStateAction<WeightEntry[]>>
  })
  
  {
    const [weight, setWeight] = useState("")
    const [previousWeight, setPreviousWeight] = useState("")
    const [date, setDate] = useState("")
    const weightData = initialData
    const [isLoading, setIsLoading] = useState(false)
    const [addPreviousOpen, setAddPreviousOpen] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [changeWeightOpen, setChangeWeightOpen] = useState(false)
    const [selectedWeightId, setSelectedWeightId] = useState<number | null>(null)
    const [updateWeight, setUpdateWeight] = useState("")

    const toLocalDate = (value: Date) => {
      return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
    }

    const handleDownloadLast30Days = async () => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 29)

      const { data, error } = await supabase
        .from("weight")
        .select("date, weight_kg")
        .eq("user_id", userId)
        .gte("date", toLocalDate(startDate))
        .lte("date", toLocalDate(new Date()))
        .order("date", { ascending: true })

      if (error) {
        toast.error("Painodatan lataus epäonnistui.")
        return
      }

      const rows = data ?? []
      const csv = [
        "Päivämäärä,Paino (kg)",
        ...rows.map((row) => `${row.date},${row.weight_kg}`),
      ].join("\n")
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `kehonpaino-${toLocalDate(new Date())}.csv`
      link.click()
      URL.revokeObjectURL(url)
      setMenuOpen(false)
      toast.success(`${rows.length} painomerkintää ladattu.`)
    }

    useEffect(() => {
      if (!userId) return

      supabase
      .from("weight")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false})
      .then(({ data }) => {
        if (data) setWeightData(data)
      })
    }, [setWeightData, userId])

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
    
        const { data, error } = await supabase
          .from("weight")
          .insert({
            user_id: userId,
            weight_kg: parseFloat(weight),
            date: today
          })
          .select("id, user_id, weight_kg, date")
          .single();
          
        if (error) {
          console.log(error.message)
          setIsLoading(false)
        } else {
          toast.success("Paino tallennettu!")
          setWeightData((prev: WeightEntry[]) =>
            [...prev, data].sort(
              (a, b) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )
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

      const { error, data } = await supabase
        .from("weight")
        .insert({
          user_id: userId,
          weight_kg: parseFloat(previousWeight),
          date: date
        })
        .select("id, user_id, weight_kg, date")
        .single();

        if (error) {
          console.log(error.message)
          setIsLoading(false)
        } else {
          toast.success("Paino tallennettu!")
          setWeightData((prev: WeightEntry[]) =>
            [...prev, data]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
          )
          setPreviousWeight("")
          setDate("")
          setAddPreviousOpen(false)
        }
        setIsLoading(false)
    }

    const selectedWeight = weightData.find(
      (row) => row.id === selectedWeightId
    )

    const handleUpdateWeight = async () => {
      setIsLoading(true)

      const { data, error } = await supabase
        .from("weight")
        .update({
          weight_kg: updateWeight,
        })
        .eq("id", selectedWeightId)
        .eq("user_id", userId)
        .select("id, date, weight_kg")
        .single()

      if (error) {
      console.log(error.message)
      setIsLoading(false)
      } else {
        toast.success("Paino päivitetty!")
        setWeightData((prev: WeightEntry[]) =>
          prev
            .map((row) => row.id === data.id ? {...row, ...data} : row
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())  
        )
        setUpdateWeight("")
        setChangeWeightOpen(false)
      }
      setIsLoading(false)
    }

    return (
        <div className="relative border-1 border-[#404040] bg-[#2f2f2f] px-4 py-2 rounded-xl">
          
            <div className="flex items-center justify-between mb-2">

              <div className="flex-1"></div>
              
              <div className="flex-1">
                <h2 className="font-semibold">Kehonpaino</h2>
              </div>

              <div className="flex-1 flex justify-end">
                <button onClick={() => setMenuOpen((open) => !open)} 
                  aria-label="Kehonpainon toiminnot"
                  aria-expanded={menuOpen}
                  className="hover:bg-neutral-900 cursor-pointer rounded-xl p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute left-0 right-0 top-9 z-10 rounded-xl border border-[#404040] bg-[#212121] p-1 shadow-lg">
                      <button
                        onClick={() => {
                          setAddPreviousOpen(true)
                          setMenuOpen(false)
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-900 cursor-pointer"
                      >
                        Lisää aiempi paino
                      </button>
                      <button
                        onClick={handleDownloadLast30Days}
                        className="w-full rounded-lg px-3 py-2 text-left hover:bg-neutral-900 cursor-pointer"
                      >
                        Lataa viimeiset 30 päivää
                      </button>
                    </div>
                  )}
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
                        <h2 className="font-semibold">Lisää paino jälkeenpäin</h2>
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
                          <td className="border border-[#404040] pr-1">{row.weight_kg}

                            <button onClick={() => {setChangeWeightOpen(true); setSelectedWeightId(row.id)}} className="hover:bg-neutral-900 cursor-pointer rounded-full p-1 translate-y-0.25 ml-1">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                              </svg>
                            </button>

                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {changeWeightOpen && selectedWeight && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
                  <div className="relative bg-[#212121] border-1 border-[#404040] rounded-xl px-4 py-2 flex flex-col gap-2 w-full max-w-96 mx-4">
                    
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Muuta painoa</h2>
                        <button onClick={() => setChangeWeightOpen(false)} className="hover:bg-neutral-900 cursor-pointer rounded-full p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="kg"
                        value={updateWeight}
                        onChange={(e) => setUpdateWeight(e.target.value)}
                        className="border border-[#404040] rounded-xl px-3 py-2 text-white w-full"
                      />

                      <input
                        placeholder="date"
                        value={new Date(selectedWeight.date).toLocaleDateString("fi-FI", { day: "2-digit", month: "narrow"})}
                        readOnly
                        className="border border-[#404040] rounded-xl px-3 py-2 text-white w-full"
                      />
                    </div>

                    <div className="flex items-center justify-center">
                      <button onClick={handleUpdateWeight} disabled={isLoading}
                          className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                          {isLoading ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                          ) : "Tallenna"}
                      </button>
                    </div>

                  </div>
                </div>
                )}
              </div>
            </div>
    )
}