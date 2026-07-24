import "dotenv/config";
import express from "express";
import { askGita } from "./rag/chat.js";


const app = express();

app.use(express.json());


app.post("/ask", async (req, res) => {
  try {
    const answer = await chat(req.body.question);
    res.json(answer);
  } catch (err) {
    console.error("ASK ERROR:", err);
    console.error(err.stack);

    res.status(500).json({
      error: err.message,
    });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
  console.log(`Gita API running on port ${PORT}`);
});