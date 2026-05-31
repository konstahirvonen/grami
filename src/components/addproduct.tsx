"use client"

import { supabase } from "@/lib/supabase"
import { useState } from "react"

export default function AddProduct( {addProductsOpen, setAddProductsOpen} : { addProductsOpen: boolean, setAddProductsOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [name, setName] = useState("")
    const [brand, setBrand] = useState("")
    const [kcal, setKcal] = useState("")
    const [protein, setProtein] = useState("")
    const [carbs, setCarbs] = useState("")
    const [fat, setFat] = useState("")
    const [message, setMessage] = useState("")
    const [isError, setIsError] = useState(false)
    
    const showMessage = (text: string, error: boolean = false) => {
        setMessage(text)
        setIsError(error)
        setTimeout(() => setMessage(""), 3000)
    }

    const handleAddProduct = async () => {

        const { data: existing } = await supabase
            .from("products")
            .select("*")
            .ilike("brand", brand)
            .ilike("name", name)
            .maybeSingle()

        if (existing) {
            showMessage("Kyseinen tuote on jo lisätty", true)
            console.log("Kyseinen tuote on jo lisätty")
            return
        }

        const { error } = await supabase
            .from("products")
            .insert({
                name: name,
                brand: brand,
                kcal: kcal,
                protein: protein,
                carbs: carbs,
                fat: fat
            })
        
        if (error) {
            console.log(error.message)
        } else {
            setAddProductsOpen(false)
        }
        
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="relative bg-[#212121] border-1 border-[#404040] rounded-xl p-4 flex flex-col gap-4 w-80">

                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Lisää ruoka-aine</h2>
                    <button onClick={() => setAddProductsOpen(false)} className="hover:bg-neutral-900 cursor-pointer rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <input type="text" placeholder="Merkki" value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                    />
                <input type="text" placeholder="Tuote" value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                    />
                <input type="number" placeholder="Kcal / 100 g" value={kcal}
                    onChange={(e) => setKcal(e.target.value)}
                    className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                    />
                <input type="number" placeholder="Proteiini / 100 g" value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                    />
                <input type="number" placeholder="Hiilihydraatit / 100 g" value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                    />
                <input type="number" placeholder="Rasva / 100 g" value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                    />

                <div className="flex items-center justify-center">
                      <button onClick={handleAddProduct}
                        className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                        Lisää
                      </button>
                </div>

                {message && (
                    <div className={`fixed top-4 left-1/2 -translate-x-1/2 text-white text-center px-4 py-2 rounded-xl shadow-lg ${isError ? 'bg-red-800' : 'bg-[#10b981]'}`}>
                        {message}
                    </div>
                )}

            </div>
        </div>
    )
}