// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors()); // Enable CORS for cross-origin requests

// Serve static files from the public directory
app.use(express.static('public'));

// AI Model Configuration
const API_KEY = process.env.API_KEY;
const MODEL_NAME = "gemini-2.0-flash"; // Updated model name

if (!API_KEY) {
  console.error("❌ API_KEY is missing. Please set it in the .env file.");
  process.exit(1);
}

// Store chat history per user
const chatHistories = new Map();

// Function to handle AI responses with chat history
async function runChat(userInput, userId) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1000,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // Retrieve or initialize user chat history
    if (!chatHistories.has(userId)) {
      chatHistories.set(userId, [
        { role: "user", parts: [{ text: "You are Yathra, an AI travel guide. Help users with trip planning, itineraries, accommodations, food recommendations, and travel tips." }] },
        { role: "model", parts: [{ text: "Hello! I'm Yathra, your friendly AI travel guide. Where are you planning to travel?" }] },
      ]);
    }

    const chatHistory = chatHistories.get(userId);
    chatHistory.push({ role: "user", parts: [{ text: userInput }] });

    // Start chat with existing history
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: chatHistory,
    });

    const result = await chat.sendMessage(userInput);
    const responseText = result.response.text();

    // Store AI response in chat history
    chatHistory.push({ role: "model", parts: [{ text: responseText }] });

    return responseText;
  } catch (err) {
    console.error("❌ Error in AI response:", err);
    return "Sorry, I'm having trouble processing your request. Please try again later.";
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Chat Endpoint
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    const userId = req.ip; // Track users by IP (or replace with a session ID if available)

    console.log(`📩 New chat request from ${userId}:`, userInput);

    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput, userId);
    res.json({ response });
  } catch (error) {
    console.error('❌ Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`🚀 AI Chatbot API running on http://localhost:${port}`);
});