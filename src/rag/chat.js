import Groq from "groq-sdk";
import { searchVerses } from "./search.js";


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


export async function askGita(question) {


  const verses = await searchVerses(question);


  const context = verses.map(v => `
Chapter ${v.chapter} Verse ${v.verse}

${v.translation}

${v.purport}
`).join("\n---\n");


  const response =
    await groq.chat.completions.create({

      model: "llama-3.1-8b-instant",

      messages:[
        {
          role:"system",
          content:
          `
You are a Bhagavad Gita assistant.
Answer only from provided context.
Always mention chapter and verse.
Do not invent information.
`
        },
        {
          role:"user",
          content:
          `
Question:
${question}

Context:
${context}
`
        }
      ]
    });


  return {
    answer:
      response.choices[0].message.content,

    sources:
      verses.map(v=>({
        chapter:v.chapter,
        verse:v.verse,
        similarity:v.similarity
      }))
  };

}