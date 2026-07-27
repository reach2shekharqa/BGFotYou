import Groq from "groq-sdk";
import { searchVerses } from "./search.js";


const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});



export async function askGita(question, language = "en", history = []) {


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



  if (responseLanguage === "Hindi") {

    systemPrompt = `

आप भगवद्गीता के एक मार्गदर्शक और शिक्षक हैं।
आपका उत्तर केवल निम्नलिखित भगवद्गीता संदर्भों पर आधारित होना चाहिए。
बाहरी ज्ञान, अन्य ग्रंथ, या सामान्य जीवन सलाह का उपयोग न करें。
यदि प्रश्न भगवद्गीता से संबंधित नहीं है, तो केवल यह लिखें:
"I can only answer questions related to the Bhagavad Gita."
यदि प्रश्न को भगवद्गीता की शिक्षाओं (धर्म, कर्म, योग, त्याग, भक्ती, श्रीकृष्ण, अर्जुन) के अनुसार समझा जा सकता है, तो उसी दृष्टिकोण से उत्तर दें。
यदि संदर्भ उपलब्ध नहीं हैं, तो सामान्य उत्तर न दें。
उत्तर स्पष्ट, शांत और आध्यात्मिक भाषा में दें。
अवास्तविक श्लोक या जानकारी न बनाएं।

`;



  } else {



    systemPrompt = `

You are a Bhagavad Gita assistant.
Your job is to understand the user's intent and answer only from the provided Bhagavad Gita references.
Do not use outside knowledge, other scriptures, or general life advice.
If the question is not related to the Bhagavad Gita, reply exactly:
"I can only answer questions related to the Bhagavad Gita."
If the question can be interpreted through Gita teachings (dharma, karma, duty, detachment, yoga, Krishna, Arjuna, devotion), answer from that perspective.
If no relevant references are available, do not attempt a generic answer.
Mention chapter and verse numbers from the provided context.
Do not invent verses or details.
Keep the answer detailed and meaningful.

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


      ...history,


      {
        role: "user",
        content: `

Response Language:
${responseLanguage}


Question:
${question}


Bhagavad Gita References:

${context}


If the question is not related to the Bhagavad Gita, reply exactly:
"I can only answer questions related to the Bhagavad Gita."
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