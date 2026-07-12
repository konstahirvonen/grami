"use client"

import { supabase } from "@/lib/supabase"
import { useEffect, useRef, useState } from "react"
import AddProduct from "./addproduct"
import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import SortableMealItem from "./sortablemealitem";
import { toast } from "sonner"

export default function Meals({ userId, totalCalories, setTotalCalories, totalProtein, setTotalProtein, totalCarbs, setTotalCarbs, totalFat, setTotalFat, fetchTotals } : {
    userId: string,
    totalCalories: number,
    setTotalCalories: React.Dispatch<React.SetStateAction<number>>,
    totalProtein: number,
    setTotalProtein: React.Dispatch<React.SetStateAction<number>>,
    totalCarbs: number,
    setTotalCarbs: React.Dispatch<React.SetStateAction<number>>,
    totalFat: number,
    setTotalFat: React.Dispatch<React.SetStateAction<number>>,
    fetchTotals: (uid: string) => Promise<void>,
        }) {

    const [newMealOpen, setNewMealOpen] = useState(false)
    const [newIngredientOpen, setNewIngredientOpen] = useState(false)
    const [items, setItems] = useState([{ food: "", grams: "", count: "", productId: null as number | null, position: 0 }])
    const [meals, setMeals] = useState<any[]>([])
    const [meal, setMeal] = useState("")
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [activeIndex, setActiveIndex] = useState<number | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const [addProductsOpen, setAddProductsOpen] = useState(false)
    const [updatedGrams, setUpdatedGrams] = useState<{[key: number]: string}>({})
    const [selectedMealId, setSelectedMealId] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setSuggestions([])
                setActiveIndex(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const addItem = () => {
        setItems([...items, { food: "", grams: "", count: "", productId: null as number | null, position: items.length }])
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
                position,
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
            .eq("user_id", userId)
            .order("position", { ascending: true })
    
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
        const nextPositon = meals ? meals.length : 0
        
        const { data: data, error: mealError } = await supabase
            .from("meal_entries")
            .insert({
                user_id: userId,
                meal: meal,
                time: localTime.toISOString(),
                position: nextPositon
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
            product_id: item.productId,
            grams: parseFloat(item.grams) || 0,
            count: parseFloat(item.count) || 0
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
        const validItems = items.filter(item => item.food.trim() !== "")

        if (validItems.length === 0) {
            toast.error("Lisää vähintään yksi ruoka-aine.")
            return
        }

        const hasIncompleteRow = validItems.some(item => item.grams.trim() === "" && item.count.trim() === "")

        if (hasIncompleteRow) {
            toast.error("Gramma tai kappalemäärä puuttuu.")
            return
        }
        

        setIsLoading(true)
        await handleMeals()
        setMeal("")
        setItems([{ food: "", grams: "", count: "", productId: null as number | null, position: 0 }])
        setNewMealOpen(false)
        setIsLoading(false)
        await fetchTotals(userId)
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
        
        setMeals((prevMeals: any) => prevMeals.filter((m: any) => m.id !== id))
        await fetchTotals(userId)
    }

    const handleUpdateMeals = async (id: number) => {
        const { error } = await supabase
            .from("meal_ingredients")
            .update({ grams: parseFloat(updatedGrams[id])})
            .eq("id", id)
        
        if (error) {
            console.log(error.message)
            return
        } else {
            setUpdatedGrams(prev => ({ ...prev, [id]: "" }))
            await fetchTotals(userId)
            await fetchMeals()
        }
    }

    const handleUpdateNewIngredient = async (id: any) => {

        const validItems = items.filter(item => item.food.trim() !== "")

        if (validItems.length === 0) {
            toast.error("Lisää vähintään yksi ruoka-aine.")
            return
        }

        const hasIncompleteRow = validItems.some(item => item.grams.trim() === "" && item.count.trim() === "")

        if (hasIncompleteRow) {
            toast.error("Gramma tai kappalemäärä puuttuu.")
            return
        }

        const insertIngredientsRows = items.map((item) => ({
            meal_id: selectedMealId,
            product_id: item.productId,
            grams: parseFloat(item.grams) || 0,
            count: parseFloat(item.count) || 0
        }))

        const { error } = await supabase
            .from("meal_ingredients")
            .insert(insertIngredientsRows)

        if (error) {
            console.log(error.message)
            return
        }
        
        setIsLoading(true)
        setItems([{ food: "", grams: "", count: "", productId: null as number | null, position: 0 }])
        await fetchTotals(userId)
        await fetchMeals()
        setIsLoading(false)
        setNewIngredientOpen(false)
    } 

    const searchFoods = async (query: string) => {
        if (query.length < 2) {
            setSuggestions([])
            return
        }

        const { data, error } = await supabase
            .from("products")
            .select("*")
            .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
            .limit(10)

        if (data) setSuggestions(data)
    }

    const removeIngredient = async (id: string | number, mealId: string) => {

        const { error } = await supabase
            .from("meal_ingredients")
            .delete()
            .eq("id", id)
            
        if (error) {
            console.log(error.message)
            return
        }

        const hasIngredients = await checkIfIsIngredients(mealId)

        if (!hasIngredients) {
            await removeMeal(mealId)
            return
        }

        setMeals((prev: any) => 
            prev.map((meal: any) => {
                if (meal.id === mealId) {
                    return {
                        ...meal,
                        meal_ingredients: meal.meal_ingredients.filter((i: any) => i.id !== id)
                    }
                }
                return meal
            }))
        await fetchTotals(userId)
        
    }

    const checkIfIsIngredients = async (mealId: string) => {

        const { data, error } = await supabase
            .from("meal_entries")
            .select(`
                id,
                meal_ingredients (
                    meal_id)`
            )
            .eq("id", mealId)

        if (error) {
            console.log(console.error)
            return
        }
        
        const hasIngredients = (data?.[0]?.meal_ingredients?.length ?? 0) > 0

        return hasIngredients
    }

    const calculateIngredientTotals = (mealIngredients: any[]) => {
        let calories = 0
        let protein = 0
        let carbs = 0
        let fat = 0

        mealIngredients?.forEach((ing: any) => {
            const product = ing.products
            if (!product) return

            const isCountBased = ing.count && ing.count > 0
            const multiplier = isCountBased ? ing.count : (ing.grams || 0) / 100

            calories += (product.kcal || 0) * multiplier
            protein += (product.protein || 0) * multiplier
            carbs += (product.carbs || 0) * multiplier
            fat += (product.fat || 0) * multiplier
        })

        return { calories, protein, carbs, fat }
    }

    return (
        <div className="bg-[#2f2f2f] border-1 border-[#404040] rounded-xl px-4 py-2">
            <h2 className="font-semibold mb-2 text-center">Ateriat</h2>

            <div>
                <DragDropProvider
                    onDragEnd={(event) => {
                        const updatedMeals = move(meals, event)

                        setMeals(updatedMeals)

                        if (updatedMeals && updatedMeals.length > 0) {
                            updatedMeals.forEach(async (meal: any, index: number) => {
                                const { error } = await supabase
                                    .from("meal_entries")
                                    .update({ position: index })
                                    .eq("id", meal.id)

                                    if (error) {
                                        console.log(error.message)
                                    }
                            })
                        }
                    }}
                >
                    
                    <ul className="list">
                        {meals && meals.length > 0 ? (
                            meals.map((m: any, index: number) => {
                                const mealTotals = calculateIngredientTotals(m.meal_ingredients)

                                return (
                                    <SortableMealItem 
                                        key={m.id}
                                        m={m}
                                        index={index}
                                        meal={meal}
                                        mealTotals={mealTotals}
                                        updatedGrams={updatedGrams}
                                        setUpdatedGrams={setUpdatedGrams}
                                        removeIngredient={removeIngredient}
                                        handleUpdateMeals={handleUpdateMeals}
                                        setSelectedMealId={setSelectedMealId}
                                        setNewIngredientOpen={setNewIngredientOpen}
                                        removeMeal={removeMeal}
                                    />
                                )
                            })
                        ) : (
                            <p></p>
                        )}
                    </ul>
                </DragDropProvider>
            </div>
            
            <div className="flex items-center justify-center">
                <button onClick={() => setNewMealOpen(true)} className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                    Lisää ateria
                </button>
            </div>

            
            {newMealOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
                    <div className="relative bg-[#212121] border-1 border-[#404040] rounded-xl px-4 py-2 flex flex-col gap-2 w-full max-w-96 mx-4">

                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">Lisää ateria</h2>
                            <button onClick={() => setNewMealOpen(false)} className="hover:bg-neutral-900 cursor-pointer rounded-full p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>

                        </div>

                        <div>
                            <input type="text" placeholder="Aterian nimi"
                                className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2 w-full"
                                value={meal}   
                                onChange={(e) => {
                                    setMeal(e.target.value)
                                }}     
                            />
                        </div>

                        {items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between gap-2">
                                <div ref={dropdownRef} className="relative flex-1">

                                    <input type="text" placeholder="Ruoka-aine"
                                        className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2 w-full"
                                        value={item.food}
                                        onFocus={() => setActiveIndex(index)}
                                        onChange={(e) => {
                                            const updated = [...items]
                                            updated[index].food = e.target.value
                                            setItems(updated)
                                            setActiveIndex(index)
                                            searchFoods(e.target.value)
                                        }}
                                    />

                                    {activeIndex === index && (
                                        <div className="absolute z-10 w-full bg-[#212121] border-1 border-[#404040] rounded-xl mt-1">
                                            {suggestions.map((s) => (
                                                <div key={s.id}
                                                    onMouseDown={() => {
                                                        const updated = [...items]
                                                        updated[index].food = s.name
                                                        updated[index].productId = s.id
                                                        setItems(updated)
                                                        setSuggestions([])
                                                    }}
                                                    className="px-3 py-2 hover:bg-[#303030] cursor-pointer rounded-xl">
                                                    {s.name + " " + s.brand}
                                                </div>
                                            ))}
                                            <div onClick={() => setAddProductsOpen(true)}
                                                className="px-3 py-2 hover:bg-[#303030] cursor-pointer rounded-xl border-t border-[#404040]">
                                                + Lisää uusi tuote
                                            </div>
                                        </div>
                                    )}
                                </div>
                            
                            <input type="number" placeholder="g" 
                                className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2 w-15 text-center"
                                value={item.grams}
                                    onChange={(e) => {
                                        const updated = [...items]
                                        updated[index].grams = e.target.value
                                        setItems(updated)
                                    }}
                                />

                            <input type="number" placeholder="Kpl"
                                className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2 w-15 text-center"
                                value={item.count}
                                    onChange={(e) => {
                                        const updated = [...items]
                                        updated[index].count = e.target.value
                                        setItems(updated)
                                    }}
                                />

                            <button onClick={() => removeItem(index)}
                                className="hover:bg-neutral-900 cursor-pointer rounded-xl p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                </svg>
                            </button>

                            </div>
                        ))}


                        {addProductsOpen && (
                                        <AddProduct addProductsOpen={addProductsOpen} setAddProductsOpen={setAddProductsOpen} />
                                    )}

                        <div className="flex items-center justify-center">
                            <button onClick={addItem} className="text-[#10b981] rounded-full p-1 hover:bg-neutral-900 cursor-pointer">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center justify-center">
                            <button onClick={handleSaveMeals} disabled={isLoading}
                                className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                ) : "Tallenna"}
                            </button>
                        </div>
                        
                    </div>
                </div>
            )}

            {newIngredientOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">   
                    <div className="relative bg-[#212121] border-1 border-[#404040] rounded-xl p-4 flex flex-col gap-4 w-full max-w-96 mx-4">
                                    
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">Lisää ruoka-aine</h2>
                            <button onClick={() => setNewIngredientOpen(false)} className="hover:bg-neutral-900 cursor-pointer rounded-full p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between gap-2">
                                <div ref={dropdownRef} className="relative flex-1">
                                    <input type="text" placeholder="Ruoka-aine"
                                        className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2 w-full"
                                        value={item.food}
                                        onFocus={() => setActiveIndex(index)}
                                        onChange={(e) => {
                                            const updated = [...items]
                                            updated[index].food = e.target.value
                                            setItems(updated)
                                            setActiveIndex(index)
                                            searchFoods(e.target.value)
                                        }}
                                    />

                                    {activeIndex === index && (
                                        <div className="absolute z-10 w-full bg-[#212121] border-1 border-[#404040] rounded-xl mt-1">
                                            {suggestions.map((s) => (
                                                <div key={s.id}
                                                    onMouseDown={() => {
                                                        const updated = [...items]
                                                        updated[index].food = s.name
                                                        updated[index].productId = s.id
                                                        setItems(updated)
                                                        setSuggestions([])
                                                    }}
                                                    className="px-3 py-2 hover:bg-[#303030] cursor-pointer rounded-xl">
                                                    {s.name + " " + s.brand}
                                                </div>
                                            ))}
                                            <div onClick={() => setAddProductsOpen(true)}
                                                className="px-3 py-2 hover:bg-[#303030] cursor-pointer rounded-xl border-t border-[#404040]">
                                                + Lisää uusi tuote
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <input type="number" placeholder="g"
                                    className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2 w-15 text-center"
                                    value={item.grams}
                                    onChange={(e) => {
                                        const updated = [...items]
                                        updated[index].grams = e.target.value
                                        setItems(updated)
                                    }}
                                />

                                <input type="number" placeholder="Kpl"
                                className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2 w-15 text-center"
                                value={item.count}
                                    onChange={(e) => {
                                        const updated = [...items]
                                        updated[index].count = e.target.value
                                        setItems(updated)
                                    }}
                                />

                                
                            </div>
                        ))}
                        
                        <div className="flex items-center justify-center">
                            <button onClick={() => {handleUpdateNewIngredient(selectedMealId)}}
                                className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                ) : "Tallenna"}
                            </button>
                            {addProductsOpen && (
                                        <AddProduct addProductsOpen={addProductsOpen} setAddProductsOpen={setAddProductsOpen} />
                                    )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}