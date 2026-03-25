import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const envFile = fs.readFileSync(".dev.vars", "utf-8");
const match = envFile.match(/GOOGLE_AI_KEY=([^\r\n]+)/);
const API_KEY = match[1];

async function run() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        tools: [{ googleSearch: {} }]
    });

    console.log("Generating with SDK...");
    try {
        const result = await model.generateContent("List 3 burger places in Birkenhead, NZ");
        console.log("Response length:", result.response.text().length);
        console.log("Grounding Metadata keys:", Object.keys(result.response.candidates[0].groundingMetadata || {}));
    } catch(e) {
        console.error("SDK Error:", e);
    }
}
run();
