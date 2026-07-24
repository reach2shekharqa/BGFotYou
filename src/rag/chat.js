import Groq from "groq-sdk";
import { searchVerses } from "./search.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


export async function askGita(question) {


  console.log("ASK START");
  const verses = await searchVerses(question);

  console.log("SEARCH COMPLETE");


  const context = verses.map(v => `
Chapter ${v.chapter} Verse ${v.verse}

Translation:
${v.translation}

Purport:
${v.purport.substring(0, 800)}
`).join("\n\n---\n\n");

 console.log("CALLING GROQ");
  const response = await groq.chat.completions.create({

    model: "llama-3.3-70b-versatile",

    temperature: 0.4,

    max_tokens: 1200,

    messages: [
      {
        role: "system",
        content: `
You are a compassionate Bhagavad Gita teacher guiding a seeker.

Answer the question based only on the provided Bhagavad Gita verses.

Your answer should:
- Start with a clear explanation.
- Explain the meaning of the relevant verses.
- Mention Chapter and Verse numbers.
- Give practical guidance for daily life.
- Be detailed and complete (around 4-6 paragraphs).
- Avoid generic motivational statements.
- Do not invent verses or teachings not present in the context.

Speak with wisdom, humility, and clarity.
`
      },
      {
        role: "user",
        content: `
Question:
${question}

Bhagavad Gita References:

${context}
`
      }
    ]
  });
 console.log("GROQ RESPONSE RECEIVED");

  return {
    answer: response.choices[0].message.content,

    sources: verses.map(v => ({
      chapter: v.chapter,
      verse: v.verse,
      similarity: v.similarity
    }))
  };
}