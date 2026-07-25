import "dotenv/config";
import express from "express";
import { askGita } from "./rag/chat.js";
import { getVerseOfTheDay } from "./rag/home.js";
import ekadashiData from "./data/ekadashi.json" with { type: "json" };


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


    const { question, language } = req.body;


    console.log("QUESTION:", question);
    console.log("LANGUAGE:", language);



    if (!question || question.trim().length < 3) {


      return res.json({

        answer: "Please ask a meaningful question."

      });

    }



    const answer = await askGita(

        question,

        language || "en"

    );



    res.json(answer);



  } catch (err) {


    console.error("ASK ERROR:", err);



    res.status(503).json({

      error: "Unable to answer right now."

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






app.get("/ekadashi", (req, res) => {


    const today = new Date();



    const upcoming = ekadashiData.ekadashi.find(item => {


        return new Date(item.date) >= today;


    });



    res.json(

        upcoming || ekadashiData.ekadashi[0]

    );


});






const PORT = process.env.PORT || 3000;



app.listen(PORT, () => {


  console.log(`Gita API running on port ${PORT}`);


});