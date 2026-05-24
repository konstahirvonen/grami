import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export default function WeightChart({ userId }: {userId: string}) {
    const [weightData, setWeightData] = useState<any[]>([])

    useEffect(() => {
        supabase
            .from("weight")
            .select("*")
            .eq("user_id", userId)
            .order("date", { ascending: true})
            .then(({ data }) => {
                if (data) setWeightData(data)
            })
    }, [])

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
                <CartesianGrid  strokeDasharray="2 2"/>
                <XAxis dataKey="date" stroke="#ffffff" />
                <YAxis stroke="#ffffff" domain={["auto", "auto"]} />
                <Line type="monotone" dataKey="weight_kg" stroke="#2563eb" strokeWidth={2} dot={{fill: ""}} activeDot={{stroke: ""}}/>
            </LineChart>
        </ResponsiveContainer>
    )
}