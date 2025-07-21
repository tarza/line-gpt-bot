'use strict';

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());
app.use(cors());

// --- Initialize Google Gemini ---
// ตรวจสอบให้แน่ใจว่าใน Railway Variables ของคุณมี GOOGLE_API_KEY อยู่
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/ask-ai', async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const geminiReply = await fetchGemini(userMessage);
    res.json({ reply: geminiReply });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

async function fetchGemini(userMessage) {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not configured.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const system_prompt = `คุณคือเซลล์ผู้เชี่ยวชาญเรื่องรถยนต์ไฟฟ้า Aion ตอบคำถามให้ลูกค้าอย่างมืออาชีพ สุภาพ และเข้าใจง่าย

    --- ข้อมูลโปรโมชันปัจจุบัน ---
    1. โปรโมชันดอกเบี้ย 0% นาน 48 เดือน สำหรับรุ่น Aion Y Plus
    2. ฟรี! ประกันภัยชั้น 1 และค่าจดทะเบียน
    3. รับฟรีเครื่องชาร์จที่บ้าน (Home Charger) พร้อมค่าติดตั้ง
    (โปรโมชันนี้หมดเขต 31 สิงหาคม 2568)
    ---

    จงใช้ข้อมูลด้านบนนี้ในการตอบคำถามเกี่ยวกับโปรโมชันล่าสุด`;
    
    const fullPrompt = `${system_prompt}\n\nคำถามจากลูกค้า: ${userMessage}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    return text;
    
  } catch (error) {
    console.error('Gemini Error:', error);
    return 'ขออภัย ระบบกำลังมีปัญหา กรุณาลองใหม่อีกครั้งในภายหลัง';
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`AI (Gemini) backend is running on port ${port}`);
});
