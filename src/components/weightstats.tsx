import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"

export default function WeightStats({ userId, weightData: initialData, chartRange}: { userId: string, weightData: any[], chartRange: string}) {
    const [weightData, setWeightData] = useState<any[]>([])
    const [range, setRange] = useState("7d")

    const toLocalDate = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    }

    const getWeightChange = (days: number) => {
        const start = new Date()
        start.setDate(start.getDate() - days)
        const startStr = toLocalDate(start)
        
        const filtered = weightData.filter(row => row.date >= startStr)
        if (filtered.length < 2) return null
        const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return sorted[sorted.length - 1].weight_kg - sorted[0].weight_kg
    }

    const getWeightChangeSince = (startDate: string) => {
        const filtered = weightData.filter(row => row.date >= startDate)
        if (filtered.length < 2) return null
        const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        return sorted[sorted.length - 1].weight_kg - sorted[0].weight_kg
    }

    useEffect(() => {
        if (initialData.length > 0) {
            setWeightData(initialData)
        }
    }, [initialData])

    const change1d = getWeightChange(1)
    const change7d = getWeightChange(7)
    const change30d = getWeightChange(30)
    const change90d = 
        chartRange === "max" ? getWeightChangeSince([...weightData].sort((a, b) => a.date.localeCompare(b.date))[0]?.date) :
        chartRange === "ytd" ? getWeightChangeSince(`${new Date().getFullYear()}-01-01`) :
        chartRange === "1y" ? getWeightChange(365) :
        chartRange === "6m" ? getWeightChange(180) :
        getWeightChange(90)
    const lastLabel = ["max", "ytd"].includes(chartRange) ? "Max" : chartRange === "1y" ? "1 Y" : chartRange === "6m" ? "6 M" : "3 M"

    return (
        <div>

            <h2 className="p-4 text-center font-semibold text-m">Painon muutos</h2>

            <div className="grid grid-cols-2 md:grid-cols-1">
                <div className="p-3 text-center">
                    <p className="text-m text-white font-semibold">1 D</p>
                    <p className={`text-2xl font-bold ${change1d !== null ? change1d < 0 ? "text-red-500" : "text-[#10b981]" : ""}`}>
                        {change1d !== null ? `${change1d > 0 ? "+" : ""}${change1d.toFixed(2)} kg` : "-"}
                    </p>
                </div>

                <div className="p-3 text-center">
                    <p className="text-m text-white font-semibold">7 D</p>
                    <p className={`text-2xl font-bold ${change7d !== null ? change7d < 0 ? "text-red-500" : "text-[#10b981]" : ""}`}>
                        {change7d !== null ? `${change7d > 0 ? "+" : ""}${change7d.toFixed(2)} kg` : "-"}
                    </p>
                </div>

                <div className="p-3 text-center">
                    <p className="text-m text-white font-semibold">1 M</p>
                    <p className={`text-2xl font-bold ${change30d !== null ? change30d < 0 ? "text-red-500" : "text-[#10b981]" : ""}`}>
                        {change30d !== null ? `${change30d > 0 ? "+" : ""}${change30d.toFixed(2)} kg` : "-"}
                    </p>
                </div>

                <div className="p-3 text-center">
                    <p className="text-m text-white font-semibold">{lastLabel}</p>
                    <p className={`text-2xl font-bold ${change90d !== null ? change90d < 0 ? "text-red-500" : "text-[#10b981]" : ""}`}>
                        {change90d !== null ? `${change90d > 0 ? "+" : ""}${change90d.toFixed(2)} kg` : "-"}
                    </p>
                </div>
            </div>
        </div>
    )
}