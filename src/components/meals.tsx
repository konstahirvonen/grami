"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function Meals({ userId } : { userId: string }) {
    const [newMealOpen, setNewMealOpen] = useState(false)
    const [items, setItems] = useState([{ food: "", grams: ""}])
    const [meals, setMeals] = useState<any[]>([])
    const [meal, setMeal] = useState("")

    const addItem = () => {
        setItems([...items, { food: "", grams: "" }])
    }

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    
    const fetchMeals = async () => {
        if (!userId) return

        const { data, error } = await supabase
            .from("meal_entries")
            .select(`
                id,
                user_id,
                meal,
                time,
                meal_ingredients (
                    id,
                    food,
                    grams
                    )
                `)
            .eq("user_id", userId)
    
        if (error) {
            console.log(error.message)
        }
            
        if (data) {
            setMeals(data)
        }
    }

    useEffect(() => {
        fetchMeals()
    }, [])
    

    const handleMeals = async () => {
        const now = new Date()
        const offset = now.getTimezoneOffset() * 60000
        const localTime = new Date(now.getTime() - offset)
        
        const { data: data, error: mealError } = await supabase
            .from("meal_entries")
            .insert({
                user_id: userId,
                meal: meal,
                time: localTime.toISOString()
            })
            .select("id")
            .single()

        if (mealError) {
            console.log(mealError.message)
            return false
        }

        const insertedMealId = data.id

        const insertIngredientsRows = items.map((item) => ({
            meal_id: insertedMealId,
            food: item.food,
            grams: parseFloat(item.grams) || 0
        }))

        const { error : ingredientsError } = await supabase
            .from("meal_ingredients")
            .insert(insertIngredientsRows)
        
        if (ingredientsError) {
            console.log(ingredientsError.message)
            return false
        }

        await fetchMeals()
        return true
    }

    const handleSaveMeals = async () => {
        await handleMeals() 
        setMeal("")
        setItems([{ food: "", grams: ""}])
        setNewMealOpen(false)
    }
    
    const removeMeal = async (id: string | number) => {

        const { error } = await supabase
            .from("meal_entries")
            .delete()
            .eq("id", id)

        if (error) {
            console.log(error.message)
            return
        }
        
        setMeals(meals.filter((m: any) => m.id !== id))
    }

    return (
        <div className="bg-[#2f2f2f] border-1 border-[#404040] rounded-xl p-4">
            <h2 className="font-semibold mb-2 text-center">Ateriat</h2>

            <div>
                {meals && meals.length > 0 ? (
                    meals.map((m: any, index: number) => (
                        <div key={m.id} className="flex gap-2 flex-col">
                            <div className="bg-[#2f2f2f] border-1 border-[#404040] rounded-xl p-4 mb-4 flex items-center justify-between">
                                
                                    <div className="flex justify-between gap-4">
                                        <div className="flex items-end flex-col justify-center">
                                            <p className="font-semibold">{m.meal}</p>
                                            <p>{new Date(m.time).toLocaleTimeString("fi-FI", { hour: "2-digit", minute: "2-digit"})}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                        {m.meal_ingredients && m.meal_ingredients.map((ing: any) => (
                                            <div key={ing.id} className="border-1 border-[#404040] rounded-xl p-2 font-semibold">
                                                <p className="capitalize">{ing.food}</p>
                                                <p>Paino: {ing.grams} (g)</p>
                                                <p>Kcal: </p>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                <div className="flex items-center justify-center">
                                    <button onClick={() => {removeMeal(m.id)}} 
                                        className="hover:bg-neutral-900 cursor-pointer rounded-xl p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p></p>
                    
                )}
            </div>
            
            <div className="flex items-center justify-center">
              <button onClick={() => setNewMealOpen(true)} className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                  Lisää ateria
                </button>
            </div>

            
            {newMealOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="relative bg-[#212121] border-1 border-[#404040] rounded-xl p-4 flex flex-col gap-4 w-96">

                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">Lisää ateria</h2>
                            <button onClick={() => setNewMealOpen(false)} className="hover:bg-neutral-900 cursor-pointer rounded-full p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <input type="text" placeholder="Aterian nimi"
                            value={meal}
                            onChange={(e) => {
                                setMeal(e.target.value)
                            }}
                            className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                            />

                        {items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between gap-2">
                                <input type="text" placeholder="Ruoka-aine"
                                    className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2 flex-1"
                                    value={item.food}
                                    onChange={(e) => {
                                        const updated = [...items]
                                        updated[index].food = e.target.value
                                        setItems(updated)
                                    }}
                                />
                            
                            <input type="number" placeholder="g" 
                                className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2 w-20 text-center"
                                value={item.grams}
                                    onChange={(e) => {
                                        const updated = [...items]
                                        updated[index].grams = e.target.value
                                        setItems(updated)
                                    }}
                                />

                            <button onClick={() => removeItem(index)}
                                className="hover:bg-neutral-900 cursor-pointer rounded-xl p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>

                            </div>
                        ))}

                        <div className="flex items-center justify-center">
                            <button onClick={addItem} className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                                +
                            </button>
                        </div>

                        <div className="flex items-center justify-center">
                            <button onClick={handleSaveMeals}
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