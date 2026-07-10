"use client"

import { supabase } from "@/lib/supabase"
import { useState, useRef, useEffect } from "react"

export default function AddProduct( {addProductsOpen, setAddProductsOpen} : { addProductsOpen: boolean, setAddProductsOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
    const [name, setName] = useState("")
    const [brand, setBrand] = useState("")
    const [kcal, setKcal] = useState("")
    const [protein, setProtein] = useState("")
    const [carbs, setCarbs] = useState("")
    const [fat, setFat] = useState("")
    const [message, setMessage] = useState("")
    const [isError, setIsError] = useState(false)
    const [imageOpen, setImageOpen] = useState(false)
    const [cameraOpen, setCameraOpen] = useState(false)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isLoading, setIsLoading] = useState(false)

    
    const showMessage = (text: string, error: boolean = false) => {
        setMessage(text)
        setIsError(error)
        setTimeout(() => setMessage(""), 3000)
    }

    const handleAddProduct = async () => {
        setIsLoading(true)
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
        setIsLoading(false)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setCapturedImage(reader.result as string)
        reader.readAsDataURL(file)
    }

    const resizeAndCompressImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = base64Str;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Canvas context failed');

                ctx.drawImage(img, 0, 0, width, height);
                

                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
                resolve(compressedBase64);
            };
            img.onerror = (err) => reject(err);
        });
    };

    const analyzeImage = async () => {
        setIsLoading(true)
        if (!capturedImage) {
            setIsLoading(false)
            return
        }

        try {
            const compressedImage = await resizeAndCompressImage(capturedImage);
            
            const base64 = compressedImage.split(",")[1];

            const response = await fetch("/api/analyze-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64 })
            });

            if (!response.ok) {
                throw new Error(`Palvelin palautti statuksen: ${response.status}`);
            }

            const data = await response.json();

            if (data.kcal !== undefined && data.kcal !== null) setKcal(data.kcal.toString())
            if (data.protein !== undefined && data.protein !== null) setProtein(data.protein.toString())
            if (data.carbs !== undefined && data.carbs != null) setCarbs(data.carbs.toString())
            if (data.fat !== undefined && data.carbs !== null) setFat(data.fat.toString())
            
            setImageOpen(false)
        } catch (error) {
            console.error("Virhe kuvan analysoinnissa:", error);
            alert("Kuvan lähetys epäonnistui.");
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (cameraOpen && stream && videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
        }
    }, [cameraOpen, stream])

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

                    <button onClick={handleAddProduct} disabled={isLoading}
                        className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : "Lisää"}
                    </button>

                    <button onClick={() => setImageOpen(true)}
                        className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl p-2 hover:bg-[#0d9166] cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                        </svg>
                    </button>
                </div>

                {imageOpen && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-20">
                        <div className="bg-[#212121] border border-[#404040] rounded-xl p-4 flex flex-col gap-4 w-80 md:w-auto h-auto">
                            <div className="flex items-center justify-between">
                                <h2 className="font-semibold">Kamera</h2>
                                <button onClick={() => setImageOpen(false)} className="hover:bg-neutral-900 cursor-pointer rounded-full p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="flex flex-col items-center gap-4">
                                {capturedImage ? (
                                    <img src={capturedImage} alt="Otettu kuva" className="rounded-xl w-full" />
                                ) : (
                                    <div className="bg-[#303030] border border-[#404040] rounded-xl w-full aspect-video flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-12 text-neutral-600">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="flex items-center justify-between gap-4">
                                    <button onClick={() => fileInputRef.current?.click()}
                                        className="border border-[#404040] bg-[#303030] rounded-xl px-4 py-2 hover:bg-neutral-900 cursor-pointer">
                                        Valitse kuva
                                    </button>
                                    <button onClick={analyzeImage} disabled={isLoading}
                                        className="bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                                        ) : "Käytä kuvaa"}
                                    </button>
                                </div>
                            </div>

                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

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
