import { GoogleGenAI } from "@google/genai";
import express from "express";
import multer from "multer";
import 'dotenv/config';

//setup aplikasi
const app = express();

// setup middleware
const upload = multer();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = "gemini-flash-latest"

app.use(express.json());

const port = 3000;

app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});



app.post("/generate-text", async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
        });
        res.status(200).json({ result: response.text });
    } catch (error) {
        console.log("Error generating text:", error);
        res.status(500).json({ message: error.message });
    }
});


app.post("/generate-from-image", upload.single("image"), async (req, res) => {
    try {
        const { prompt } = req.body;
        const base64Image = req.file.buffer.toString("base64");

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt, type: "text" },
                { inlineData: { mimeType: req.file.mimetype, data: base64Image } }
            ],
        });
        res.status(200).json({ result: response.text });
    } catch (error) {
        console.log("Error generating text:", error.message);
        res.status(500).json({ message: error.message });
    }
});


app.post("/generate-from-document", upload.single("document"), async (req, res) => {
    try {
        const { prompt } = req.body;
        const base64Document = req.file.buffer.toString("base64");

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt ?? "tolong buat ringkasan dari dokumen berikut.", type: "text" },
                { inlineData: { mimeType: req.file.mimetype, data: base64Document } }
            ],
        });
        res.status(200).json({ result: response.text });
    } catch (error) {
        console.log("Error generating text:", error.message);
        res.status(500).json({ message: error.message });
    }
});


app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
    try {
        const { prompt } = req.body;
        const base64Audio = req.file.buffer.toString("base64");

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt ?? "tolong buat transkrip dari rekaman suara berikut.", type: "text" },
                { inlineData: { mimeType: req.file.mimetype, data: base64Audio } }
            ],
        });
        res.status(200).json({ result: response.text });
    } catch (error) {
        console.log("Error generating text:", error.message);
        res.status(500).json({ message: error.message });
    }
});
