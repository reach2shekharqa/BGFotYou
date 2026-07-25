import Groq from "groq-sdk";
import { searchVerses } from "./search.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


export async function askGita(question, language = "en") {

  console.log("ASK START");
  console.log("Language:", language);


  const verses = await searchVerses(question);

  console.log("SEARCH COMPLETE");


  const context = verses.map(v => `
Chapter ${v.chapter} Verse ${v.verse}

Translation:
${v.translation}

Purport:
${v.purport.substring(0, 800)}
`).join("\n\n---\n\n");



  let systemPrompt = `
You are a compassionate Bhagavad Gita teacher guiding a seeker.

Answer the question based only on the provided Bhagavad Gita verses.

Your answer should:
- Start with a clear explanation.
- Explain the meaning of the relevant verses.
- Mention Chapter and Verse numbers.
- Give practical guidance for daily life.
- Be detailed and complete.
- Avoid generic motivational statements.
- Do not invent verses or teachings not present in the context.

Speak with wisdom, humility, and clarity.
`;



  if (language === "hi") {

    systemPrompt = `
आप भगवान श्रीकृष्ण की शिक्षाओं के ज्ञाता और करुणामय मार्गदर्शक हैं।

IMPORTANT RULES:

- उत्तर केवल हिन्दी (देवनागरी लिपि) में दें।
- अंग्रेजी भाषा का प्रयोग बिल्कुल न करें।
- यदि प्रश्न अंग्रेजी में हो तब भी उत्तर हिन्दी में ही दें।
- सरल और सहज हिन्दी का प्रयोग करें।
- भगवद्गीता के अध्याय और श्लोक संख्या अवश्य बताएं।
- दिए गए संदर्भों के बाहर कोई शिक्षा या श्लोक न जोड़ें।
- उत्तर आध्यात्मिक, स्पष्ट और व्यावहारिक होना चाहिए।
- दैनिक जीवन में लागू होने वाला मार्गदर्शन दें।
`;
  }



  console.log("CALLING GROQ");


  const response = await groq.chat.completions.create({

    model: "llama-3.3-70b-versatile",

    temperature: 0.3,

    max_tokens: 1200,


    messages: [

      {
        role: "system",
        content: systemPrompt
      },


      {
        role: "user",
        content: `
Language: ${language}

Question:
${question}


Bhagavad Gita References:

${context}


Remember:
If language is hi, answer ONLY in Hindi.
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