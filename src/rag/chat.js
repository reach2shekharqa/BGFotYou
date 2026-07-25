import Groq from "groq-sdk";
import { searchVerses } from "./search.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function askGita(question, language = "en") {

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


  // Default English Prompt
  let systemPrompt = `
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
`;


  // Hindi
  if (language === "hi") {

    systemPrompt = `
आप भगवान श्रीकृष्ण की शिक्षाओं के ज्ञाता और करुणामय मार्गदर्शक हैं।

उत्तर केवल दिए गए भगवद्गीता के संदर्भों के आधार पर दें।

उत्तर लिखते समय इन नियमों का पालन करें:

- उत्तर पूरी तरह हिन्दी (देवनागरी) में दें।
- अंग्रेज़ी का प्रयोग न करें, केवल अध्याय और श्लोक संख्या सामान्य अंकों में लिख सकते हैं।
- उत्तर की शुरुआत सीधे स्पष्ट उत्तर से करें।
- संबंधित श्लोक का सरल अर्थ समझाएँ।
- अध्याय और श्लोक संख्या अवश्य लिखें।
- दैनिक जीवन में उसका व्यावहारिक उपयोग बताएँ।
- उत्तर 4-6 अनुच्छेदों में विस्तृत हो।
- ऐसा कोई श्लोक या शिक्षा न जोड़ें जो दिए गए संदर्भ में मौजूद न हो।
- भाषा सरल, सहज और आध्यात्मिक हो।
- उत्तर का समापन प्रेरणादायक आध्यात्मिक संदेश से करें।
`;
  }

  console.log("CALLING GROQ");

  const response = await groq.chat.completions.create({

    model: "llama-3.3-70b-versatile",

    temperature: 0.4,

    max_tokens: 1200,

    messages: [
      {
        role: "system",
        content: systemPrompt
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