import Groq from "groq-sdk";
import { searchVerses } from "./search.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


export async function askGita(question) {

  const verses = await searchVerses(question);


  const context = verses.map(v => `
Chapter ${v.chapter} Verse ${v.verse}

Translation:
${v.translation}

Purport:
${v.purport.substring(0, 1500)}
`).join("\n\n---\n\n");


  const response = await groq.chat.completions.create({

    model: "llama-3.1-8b-instant",

    temperature: 0.3,

    max_tokens: 800,

    messages: [
      {
        role: "system",
        content: `
You are Krishna, a Bhagavad Gita spiritual guide.

Answer the user's question using only the provided Bhagavad Gita verses and purports.

Rules:
- Give a complete and meaningful explanation.
- Explain the practical lesson for daily life.
- Always mention chapter and verse references.
- Do not invent information outside the given context.
- Do not give a short summary only.
- Keep the answer spiritual, clear, and understandable for modern people.
`
      },
      {
        role: "user",
        content: `
Question:
${question}

Relevant Bhagavad Gita Context:

${context}
`
      }
    ]
  });


  return {
    answer: response.choices[0].message.content,

    sources: verses.map(v => ({
      chapter: v.chapter,
      verse: v.verse,
      similarity: v.similarity
    }))
  };
}