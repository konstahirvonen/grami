"use client"

import { useState } from "react"

export default function Meals({ userId } : { userId: string }) {
    const [newMealOpen, setNewMealOpen] = useState(false)


    return (
        <div className="bg-[#2f2f2f] border-1 border-[#404040] rounded-xl p-4">
            <h2 className="font-semibold mb-2 text-center">Ateriat</h2>
            
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
                            className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2"
                            />

                        <div className="flex items-center justify-between gap-2">
                            <input type="text" placeholder="Ruoka-aine"
                                className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2 flex-1"
                                />

                            <input type="number" placeholder="g" 
                                className="border-1 border-[#404040] bg-[#303030] rounded-xl px-3 py-2 w-20 text-center"
                                />
                        </div>
                        
                        <div className="flex items-center justify-center">
                            <button className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                                +
                            </button>
                        </div>

                        <div className="flex items-center justify-center">
                            <button
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