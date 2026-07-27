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




  let responseLanguage = "English";


  if (
    language &&
    (
      language.toLowerCase() === "hi" ||
      language.toLowerCase().includes("hindi")
    )
  ) {

    responseLanguage = "Hindi";

  }



  let systemPrompt;



  if(responseLanguage === "Hindi"){


    systemPrompt = `

आप भगवान श्रीकृष्ण के भगवद्गीता ज्ञान के करुणामय मार्गदर्शक हैं।

आपका उत्तर केवल हिन्दी (देवनागरी) में होना चाहिए।

नियम:

- प्रश्न किसी भी भाषा में हो सकता है, लेकिन उत्तर हिन्दी में दें।
- अंग्रेजी शब्दों का प्रयोग न करें।
- अध्याय और श्लोक संख्या जैसे BG 2.47 लिख सकते हैं।
- दिए गए भगवद्गीता संदर्भों के आधार पर ही उत्तर दें।
- श्लोक का सरल अर्थ समझाएं।
- दैनिक जीवन में उपयोगी मार्गदर्शन दें।
- उत्तर स्पष्ट, शांत और आध्यात्मिक भाषा में दें।
- काल्पनिक श्लोक या जानकारी न बनाएं।

`;



  } else {



    systemPrompt = `

You are a compassionate Bhagavad Gita teacher guiding a seeker.

Answer ONLY in English.

Rules:

- Base your answer only on provided Bhagavad Gita references.
- Explain relevant Chapter and Verse numbers.
- Explain practical meaning for daily life.
- Give clear spiritual guidance.
- Do not invent verses or teachings.
- Keep the answer detailed and meaningful.

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

Response Language:
${responseLanguage}


Question:
${question}


Bhagavad Gita References:

${context}


Generate the final answer now.

`
      }


    ]

  });



  console.log("GROQ RESPONSE RECEIVED");



  return {


    answer:
      response.choices[0].message.content,



    sources: verses.map(v => ({


      chapter: v.chapter,

      verse: v.verse,

      similarity: v.similarity


    }))


  };


}