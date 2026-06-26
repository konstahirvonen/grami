"use client"

import { supabase } from "@/lib/supabase"
import { useState, useRef } from "react"

export default function AddProduct( {addProductsOpen, setAddProductsOpen} : { addProductsOpen: boolean, setAddProductsOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [name, setName] = useState("")
    const [brand, setBrand] = useState("")
    const [kcal, setKcal] = useState("")
    const [protein, setProtein] = useState("")
    const [carbs, setCarbs] = useState("")
    const [fat, setFat] = useState("")
    const [message, setMessage] = useState("")
    const [isError, setIsError] = useState(false)
    const [cameraOpen, setCameraOpen] = useState(false)
    
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

    const videoRef = useRef<HTMLVideoElement>(null)

    const openCamera = async (): Promise<void> => {
        try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        setCameraOpen(true)
        setTimeout(() => {
            if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            }
        }, 0)
        } catch (error) {
            if (error) {
                console.log("Virhe avatessa kameraa tai kameraa ei löytynyt")
            }
        }
    }

    const takePhoto = (): void => {
        const video = document.getElementById("video") as HTMLVideoElement
        const canvas = document.getElementById("photo") as HTMLCanvasElement

        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext("2d")?.drawImage(video, 0, 0)
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

                <div className="flex items-center justify-between">

                    <div className="w-10"></div>

                    <button onClick={handleAddProduct}
                        className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                        Lisää
                    </button>

                    <button onClick={openCamera}
                        className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl p-2 hover:bg-[#0d9166] cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                        </svg>
                    </button>
                </div>

                {cameraOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-20">
                        <div className="bg-[#212121] border border-[#404040] rounded-xl p-4 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold">Kamera</h2>
                                <button onClick={() => setCameraOpen(false)} className="hover:bg-neutral-900 cursor-pointer rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <video ref={videoRef} autoPlay className="rounded-xl" />
                        </div>
                    </div>
                )}

                {message && (
                    <div className={`fixed top-4 left-1/2 -translate-x-1/2 text-white text-center px-4 py-2 rounded-xl shadow-lg ${isError ? 'bg-red-800' : 'bg-[#10b981]'}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    )
}
