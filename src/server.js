import "dotenv/config";
import express from "express";
import { askGita } from "./rag/chat.js";


const app = express();

app.use(express.json());

app.get("/health", (req,res)=>{
  res.json({
    status:"UP",
    service:"Bhagavad Gita AI"
  });
});


app.post("/ask", async (req, res) => {
  try {
    const answer = await askGita(req.body.question);
    res.json(answer);
  } catch (err) {
    console.error("ASK ERROR:", err);

    let message = "I am unable to answer right now. Please try again.";

    if (err.message.includes("429")) {
      message = "The AI service limit has been reached. Please try again later.";
    }

    if (err.message.includes("Embedding API")) {
      message = "The search service is temporarily unavailable. Please try again.";
    }

    if (err.message.includes("Groq")) {
      message = "The answer generation service is temporarily unavailable.";
    }

    res.status(503).json({
      error: message
    });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Gita API running on port ${PORT}`);
});