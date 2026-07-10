import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: NextRequest) {
    try {
        const { image } = await request.json()

        if (!image) {
            return NextResponse.json({ error: "Kuva puuttuu"}, { status: 400 })
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    parts: [
                        { text: "Lue tästä kuvasta ravintoarvot ja palauta JSON-muodossa: { kcal, protein, carbs, fat } per 100g. Palauta vain JSON, ei muuta tekstiä." },
                        { inlineData: { mimeType: "image/jpeg", data: image } }
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        kcal: { type: Type.NUMBER },
                        protein: { type: Type.NUMBER },
                        carbs: { type: Type.NUMBER },
                        fat: { type: Type.NUMBER },
                    },
                    required: ["kcal", "protein", "carbs", "fat"],
                },
            }
        })

        const text = response.text

        if (!text) {
            return NextResponse.json({ error: "Malli ei palauttanut tekstiä"}, { status: 500 })
        }

        const json = JSON.parse(text)
        return NextResponse.json(json)
    
    } catch (error: any) {
        return NextResponse.json({ error: "Käsittely epäonnistui", details: error.message }, { status: 500 })
    }
    
}