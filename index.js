'use strict';

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors()); // เปิดใช้งาน CORS เพื่อให้หน้าเว็บจาก GitHub Pages เรียกเข้ามาได้

// --- นี่คือประตูสำหรับให้หน้าเว็บส่งคำถามเข้ามา ---
app.post('/ask-ai', async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: 'No message provided' });
    }

    const gptReply = await fetchGPT(userMessage);
    res.json({ reply: gptReply });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

async function fetchGPT(userMessage) {
  // ฟังก์ชันนี้ยังคงเหมือนเดิม ใช้คุยกับ OpenAI
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo', // <--- แก้ไขจาก gpt-4 เป็น gpt-3.5-turbo ตรงนี้
        messages: [
          {
            role: 'system',
            content: `คุณคือเซลล์ผู้เชี่ยวชาญเรื่องรถยนต์ไฟฟ้า Aion ตอบคำถามให้ลูกค้าอย่างมืออาชีพ สุภาพ และเข้าใจง่าย

            --- ข้อมูลโปรโมชันปัจจุบัน ---
            1. โปรโมชันดอกเบี้ย 0% นาน 48 เดือน สำหรับรุ่น Aion Y Plus
            2. ฟรี! ประกันภัยชั้น 1 และค่าจดทะเบียน
            3. รับฟรีเครื่องชาร์จที่บ้าน (Home Charger) พร้อมค่าติดตั้ง
            (โปรโมชันนี้หมดเขต 31 สิงหาคม 2568)
            ---

            จงใช้ข้อมูลด้านบนนี้ในการตอบคำถามเกี่ยวกับโปรโมชันล่าสุด`
          },
          {
            role: 'user',
            content: userMessage
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('GPT Error:', error.response?.data || error.message);
    return 'ขออภัย ระบบกำลังมีปัญหา กรุณาลองใหม่อีกครั้งในภายหลัง';
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`AI backend is running on port ${port}`);
});
