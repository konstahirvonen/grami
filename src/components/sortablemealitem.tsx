import { useSortable } from "@dnd-kit/react/sortable"
import { useRef, useState } from "react";

interface MealTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface SortableMealItemProps {
  m: any;
  index: number,
  meal: string,
  mealTotals: MealTotals;
  updatedGrams: any,
  setUpdatedGrams: React.Dispatch<React.SetStateAction<any>>;
  removeIngredient: (ingId: string, mealId: string) => void;
  handleUpdateMeals: (ingId: number) => void;
  setSelectedMealId: (mealId: number) => void;
  setNewIngredientOpen: (open: boolean) => void;
  removeMeal: (mealId: string) => void;
}


export default function SortableMealItem({
    m,
    index,
    meal,
    mealTotals,
    updatedGrams,
    setUpdatedGrams,
    removeIngredient,
    handleUpdateMeals,
    setSelectedMealId,
    setNewIngredientOpen,
    removeMeal,
  }: SortableMealItemProps) {

  const [element, setElement] = useState<HTMLDivElement | null>(null)
  const handleRef = useRef<HTMLButtonElement | null>(null)

  const { isDragging } = useSortable({
    id: m.id,
    index,
    element,
    handle: handleRef
  })

  return (
    <div ref={setElement} className="flex flex-col">
        
        

        <div className="bg-[#2f2f2f] border-1 border-[#404040] rounded-xl p-2 mb-2 flex items-center gap-4">

            <button 
                ref={handleRef}
                className="hover:bg-neutral-900 cursor-grab active:cursor-grabbing rounded-full p-1 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none"/>
                    <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none"/>
                    <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/>
                    <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/>
                    <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none"/>
                    <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none"/>
                </svg>
            </button>

            <div className="flex flex-col gap-2 flex-1">

                <div className="flex">
                    <h1 className="font-semibold px-2 py-1 capitalize">{m.meal}</h1>
                    <div className="flex text-sm ml-auto items-center">
                        <span className="font-semibold mr-1 bg-blue-400 text-blue-900 rounded px-2 py-0.5">{Math.round(mealTotals.protein)}p</span>
                        <span className="font-semibold mr-1 bg-amber-400 text-amber-900 rounded px-2 py-0.5">{Math.round(mealTotals.carbs)}c</span>
                        <span className="font-semibold mr-1 bg-rose-400 text-rose-900 rounded px-2 py-0.5">{Math.round(mealTotals.fat)}f</span>
                    </div>
                    <span className="px-2 py-1">{Math.round(mealTotals.calories)} kcal</span>
                    <button onClick={() => {removeMeal(m.id)}} 
                        className="hover:bg-neutral-900 cursor-pointer rounded-xl p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                    </button>
                </div>


                <div className="flex justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                    {m.meal_ingredients && m.meal_ingredients.map((ing: any) => (
                        
                        <div key={ing.id} className="relative group border-1 border-[#404040] rounded-xl p-2 font-semibold w-64 md:w-52">
                            
                        <div className="flex gap-2 items-center justify-between">
                            <p className="capitalize cursor-default">{ing.products?.name}</p>
                            <button onClick={() => {removeIngredient(ing.id, m.id)}}  className="hover:bg-neutral-900 cursor-pointer rounded-full p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-2 opacity-0 translate-y-full group-hover:opacity-100
                                        transition-opacity bg-[#1a1a1a] border border-[#404040] rounded-xl p-3 text-xs font-normal w-56 z-50 shadow-lg">
                            <p className="font-semibold capitalize mb-1">{ing.products?.name}</p>
                            <div className="grid grid-cols-2">
                                <span className="text-neutral-400">Kalorit:</span>
                                <span>{ing.grams !== null && ing.grams !== 0 ? `${(ing.grams * ing.products?.kcal / 100).toFixed(1)}` : ing.count !== null ? `${ing.count * ing.products?.kcal}` : ""}</span>
                                <span className="text-neutral-400">Proteiini:</span>
                                <span>{ing.grams !== null && ing.grams !== 0 ? `${(ing.grams * ing.products?.protein / 100).toFixed(1)}` : ing.count !== null ? `${ing.count * ing.products?.totalProtein}` : ""}</span>
                                <span className="text-neutral-400">Hiilihydraatit:</span>
                                <span>{ing.grams !== null && ing.grams !== 0 ? `${(ing.grams * ing.products?.carbs / 100).toFixed(1)}` : ing.count !== null ? `${ing.count * ing.products?.carbs}` : ""}</span>
                                <span className="text-neutral-400">Rasva:</span>
                                <span>{ing.grams !== null && ing.grams !== 0 ? `${(ing.grams * ing.products?.fat / 100).toFixed(1)}` : ing.count !== null ? `${ing.count * ing.products?.fat}` : ""}</span>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-2 h-2 bg-[#1a1a1a] border-t border-l border-[#404040] rotate-45 -mb-1"></div>
                        </div>

                        <div className="flex gap-2 items-center justify-between mb-1">
                            <input
                                type="number" id="updateInput"
                                value={updatedGrams[ing.id] ?? ""}
                                placeholder={ing.grams !== null && ing.grams !== 0 ? `${ing.grams}  (g)` : ing.count !== null ? `${ing.count} kpl` : ""}
                                className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2 w-25 text-center"
                                onChange={(e) => {
                                    setUpdatedGrams((prev: any) => ({ ...prev, [ing.id]: e.target.value }))
                                }}
                            />
                            {updatedGrams[ing.id] && (
                                <button onClick={() => {handleUpdateMeals(ing.id)}} id="updateButton"
                                    className="bg-[#10b981] hover:bg-[#0d9166] text-white cursor-pointer rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                </button>
                            )}
                        </div>
                            
                        </div>
                        
                        
                    ))}
                        <div className="flex items-center justify-center">
                            <button onClick={() => { setSelectedMealId(m.id); setNewIngredientOpen(true) }} className="text-[#10b981] rounded-full p-1 hover:bg-neutral-900 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            </button>
                        </div>
                        
                    </div>

                </div>

            </div>

        </div>
    </div>
  )
}