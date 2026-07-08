import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {

    const { image } = await request.json()

    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
            {
                parts: [
                    { text: "Lue tästä kuvasta ravintoarvot ja palauta JSON-muodossa: { kcal, protein, carbs, fat } per 100g. Palauta vain JSON, ei muuta tekstiä." },
                    { inlineData: { mimeType: "image/jpeg", data: image } }
                ]
            }
        ]
    })

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    
    try {
        const json = JSON.parse(text.replace(/```json|```/g, "").trim())
        return NextResponse.json(json)
    } catch {
        return NextResponse.json({ error: "Parsing failed" }, { status: 500 } )
    }
}