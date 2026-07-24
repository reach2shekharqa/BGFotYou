import "dotenv/config";
import express from "express";
import { askGita } from "./rag/chat.js";


const app = express();

app.use(express.json());


app.post("/ask", async(req,res)=>{

  try {

    const result =
      await askGita(req.body.question);

    res.json(result);

  } catch(error){

    console.error(error);

    res.status(500).json({
      error:"Something went wrong"
    });

  }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
  console.log(`Gita API running on port ${PORT}`);
});