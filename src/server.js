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

app.get("/home", async (req, res) => {

  try {

    res.json({

      verseOfDay: {

        chapter: 2,

        verse: 47,

        sanskrit:
        "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन",

        translation:
        "You have the right to perform your duty, but not to the fruits of action.",

        message:
        "Focus on your actions and surrender the results."

      },

      quote:
      "Perform your duty with devotion and without attachment."

    });


  } catch (err) {

    console.error("HOME ERROR:", err);

    res.status(500).json({
      error: "Unable to load home data"
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Gita API running on port ${PORT}`);
});