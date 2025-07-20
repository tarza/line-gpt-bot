'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');

const app = express();
app.use(express.json());

// ---> โค้ดสำหรับทดสอบที่ย้ายมาตำแหน่งที่ถูกต้อง <---
app.get('/test', (req, res) => {
  res.status(200).send('Hello! The server is working!');
});

// ดึงค่าจาก Environment Variables ที่เราจะไปตั้งค่าใน Render
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

const client = new line.Client(config);

app.post('/webhook', line.middleware(config), async (req, res) => {
  const events = req.body.events;

  for (let event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userMessage = event.message.text;

      const gptReply = await fetchGPT(userMessage);

      await client.replyMessage(event.replyToken, {
        type: 'text',
        text: gptReply
      });
    }
  }

  res.sendStatus(200);
});

async function fetchGPT(userMessage) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'คุณคือเซลล์ผู้เชี่ยวชาญเรื่องรถยนต์ไฟฟ้า Aion ตอบคำถามให้ลูกค้าอย่างมืออาชีพ สุภาพ และเข้าใจง่าย'
          },
          {
            role: 'user',
            content: userMessage
          }
        ]
      },
      {
        headers: {
          // ดึง OpenAI API Key จาก Environment Variables
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
app.listen(port, () => console.log(`LINE bot is running on port ${port}`));
