import "dotenv/config";
import express from "express";
import { askGita } from "./rag/chat.js";
import { getVerseOfTheDay } from "./rag/home.js";

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

        const verse = await getVerseOfTheDay();

        res.json({

            verseOfDay: {

                chapter: verse.chapter,
                chapter_title: verse.chapter_title,
                verse: verse.verse,
                transliteration: verse.transliteration,
                translation: verse.translation,
                purport: verse.purport

            }

        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Unable to load verse"
        });

    }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Gita API running on port ${PORT}`);
});