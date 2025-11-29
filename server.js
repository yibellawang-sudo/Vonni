import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from "path";                
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/translate', async (req, res) => {
    try {
        console.log('API Key:', process.env.API_KEY ? 'Found' : 'MISSING!');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const response = await fetch("https://ai.hackclub.com/proxy/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.API_KEY}`
            },
            body: JSON.stringify(req.body)
        });
        
        const data = await response.json();
        console.log('API Response status:', response.status);
        console.log('API Response:', JSON.stringify(data, null, 2));
        
        if (!response.ok) {
            throw new Error(JSON.stringify(data));
        }
        
        res.json(data);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist/index.html"));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost: ${PORT}`);
    console.log('API Key loaded:', process.env.API_KEY ? 'YES' : 'NO');
});