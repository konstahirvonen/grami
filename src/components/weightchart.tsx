import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { DayPicker, getDefaultClassNames } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { DateRange } from "react-day-picker"

export default function WeightChart({ userId, weightData: initialData, range, setRange }: {userId: string, weightData: any[], range: string, setRange: (range: string) => void}) {
    const [weightData, setWeightData] = useState<any[]>([])
    const [dateRangeOpen, setDateRangeOpen] = useState(false)
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const defaultClassNames = getDefaultClassNames();

    const fetchWeightData = async (startDate: string, endDate?: string) => {
        let query = supabase
            .from("weight")
            .select("*")
            .eq("user_id", userId)
            .gte("date", startDate)
            .order("date", { ascending: true })

        if (endDate) {
            query = query.lte("date", endDate)
        }

        const { data } = await query
        if (data) setWeightData(data)
    }

    const toLocalDate = (date: Date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    }

    useEffect(() => {
        const start = new Date()
        start.setDate(start.getDate() - 7)
        fetchWeightData(toLocalDate(start))
    }, [])

    useEffect(() => {
        const start = new Date()
        if (range === "7d") start.setDate(start.getDate() - 7)
        if (range === "1m") start.setMonth(start.getMonth() - 1)
        if (range === "3m") start.setMonth(start.getMonth() - 3)
        if (range === "6m") start.setMonth(start.getMonth() - 6)
        if (range === "1y") start.setFullYear(start.getFullYear() - 1)
        if (range === "ytd") start.setFullYear(start.getFullYear(), 0, 0)
        if (range === "max") start.setFullYear(2000, 0, 1)

        fetchWeightData(toLocalDate(start))
    }, [range])

    const filteredData = weightData.filter((row) => {
        const start = new Date()
        if (range === "7d") start.setDate(start.getDate() - 7)
        else if (range === "1m") start.setMonth(start.getMonth() - 1)
        else if (range === "3m") start.setMonth(start.getMonth() - 3)
        else if (range === "6m") start.setMonth(start.getMonth() - 6)
        else if (range === "1y") start.setFullYear(start.getFullYear() - 1)
        else if (range === "ytd") start.setFullYear(start.getFullYear(), 0, 0)
        else return true
        return new Date(row.date) >= start
    })

    useEffect(() => {
        const start = new Date()
        if (range === "7d") start.setDate(start.getDate() - 7)
        else if (range === "1m") start.setMonth(start.getMonth() - 1)
        else if (range === "3m") start.setMonth(start.getMonth() - 3)
        else if (range === "6m") start.setMonth(start.getMonth() - 6)
        else if (range === "1y") start.setFullYear(start.getFullYear() - 1)
        else if (range === "ytd") start.setFullYear(start.getFullYear(), 0, 0)
        else if (range === "max") start.setFullYear(2000, 0, 1)

        fetchWeightData(toLocalDate(start))
    }, [range, initialData])

    return (
        <div className="flex flex-col h-full">
            <h2 className="font-semibold text-center">Painokuvaaja</h2>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredData}>
                    <CartesianGrid  strokeDasharray="2 2"/>
                    <XAxis dataKey="date" stroke="#ffffff" tickFormatter={(date) => new Date(date).toLocaleDateString("fi-FI", { day: "2-digit", month: "narrow"})} />
                    <YAxis stroke="#ffffff" domain={["auto", "auto"]} />
                    <Tooltip
                        formatter={(value) => [`${value} kg`, "Paino"]}
                        labelFormatter={(date) => new Date(date).toLocaleDateString("fi-FI")}
                        cursor={{
                        stroke: "",
                        }}
                        contentStyle={{
                        backgroundColor: "#303030",
                        borderColor: "#404040",
                        fontWeight: "600"
                        }}
                    />
                    <Line dataKey="weight_kg" stroke="#10b981" strokeWidth={2} dot={false}  activeDot={{ stroke: "#10b981"}}/>
                </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-2 flex-wrap mt-auto">
                <button onClick={() => setRange("7d")} className={`text-white font-semibold rounded-xl px-2 py-1 cursor-pointer ${range === "7d" ? "bg-[#10b981] hover:bg-[#0d9166]" : "hover:bg-neutral-900"}`}>7D</button>
                <button onClick={() => setRange("1m")} className={`text-white font-semibold rounded-xl px-2 py-1 cursor-pointer ${range === "1m" ? "bg-[#10b981] hover:bg-[#0d9166]" : "hover:bg-neutral-900"}`}>1M</button>
                <button onClick={() => setRange("3m")} className={`text-white font-semibold rounded-xl px-2 py-1 cursor-pointer ${range === "3m" ? "bg-[#10b981] hover:bg-[#0d9166]" : "hover:bg-neutral-900"}`}>3M</button>
                <button onClick={() => setRange("6m")} className={`text-white font-semibold rounded-xl px-2 py-1 cursor-pointer ${range === "6m" ? "bg-[#10b981] hover:bg-[#0d9166]" : "hover:bg-neutral-900"}`}>6M</button>
                <button onClick={() => setRange("1y")} className={`text-white font-semibold rounded-xl px-2 py-1 cursor-pointer ${range === "1y" ? "bg-[#10b981] hover:bg-[#0d9166]" : "hover:bg-neutral-900"}`}>1Y</button>
                <button onClick={() => setRange("ytd")} className={`text-white font-semibold rounded-xl px-2 py-1 cursor-pointer ${range === "ytd" ? "bg-[#10b981] hover:bg-[#0d9166]" : "hover:bg-neutral-900"}`}>YTD</button>
                <button onClick={() => setRange("max")} className={`text-white font-semibold rounded-xl px-2 py-1 cursor-pointer ${range === "max" ? "bg-[#10b981] hover:bg-[#0d9166]" : "hover:bg-neutral-900"}`}>Max</button>
                <button onClick={() => setDateRangeOpen(true)} className="text-white font-semibold rounded-xl px-2 py-1 hover:bg-neutral-900 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
                    </svg>
                </button>
            </div>
            {dateRangeOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="bg-[#212121] border-1 border-[#404040] rounded-xl p-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-white">Valitse aikaväli</h2>
                            <button onClick={() => setDateRangeOpen(false)} className="border-1 border-[#404040] bg-[#303030] hover:bg-neutral-900 cursor-pointer rounded-full p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex gap-2 items-center p-2">
                            <DayPicker
                                animate
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                classNames={{
                                    chevron: "fill-[#10b981]",
                                    button_next: "hover:bg-neutral-900 rounded-xl",
                                    button_previous: "hover:bg-neutral-900 rounded-xl", 
                                    today: "transparent",
                                    selected: "bg-[#10b981]",
                                    range_start: "bg-[#10b981] font-semibold text-black",
                                    range_middle: "bg-[#303030] font-semibold",
                                    range_end: "bg-[#10b981] font-semibold text-black"
                                }}
                            />
                        </div>
                        <div className="flex items-center justify-center">
                            <button
                                onClick={() => {
                                    if (dateRange?.from && dateRange?.to) {
                                        fetchWeightData(
                                            toLocalDate(dateRange.from),
                                            toLocalDate(dateRange.to)
                                        )
                                        setDateRangeOpen(false)
                                    }
                                }} 
                                className="border-1 border-[#404040] bg-[#10b981] text-white font-semibold rounded-xl px-4 py-2 hover:bg-[#0d9166] cursor-pointer">
                                Hae
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}