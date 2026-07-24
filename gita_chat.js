import "dotenv/config";
import pg from "pg";
import Groq from "groq-sdk";
import { pipeline } from "@xenova/transformers";
import readline from "readline";

const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "gita_db",
  user: "postgres",
  password: "Postgres@123",
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


console.log("Loading embedding model...");

const extractor = await pipeline(
  "feature-extraction",
  "Xenova/bge-base-en-v1.5"
);

console.log("Embedding model loaded");


async function createEmbedding(question) {

  const output = await extractor(
    `query: ${question}`,
    {
      pooling: "mean",
      normalize: true
    }
  );

  return Array.from(output.data);
}


async function searchVerses(question) {

  const embedding = await createEmbedding(question);

  const client = await pool.connect();

  try {

    const result = await client.query(
      `
      SELECT
        chapter,
        verse,
        translation,
        purport,
        1 - (embedding <=> $1) AS similarity
      FROM verses
      ORDER BY embedding <=> $1
      LIMIT 5
      `,
      [
        JSON.stringify(embedding)
      ]
    );

    return result.rows;

  } finally {
    client.release();
  }
}


async function askGita(question) {

  const verses = await searchVerses(question);


  const context = verses.map((v) => {

    return `
Chapter ${v.chapter}, Verse ${v.verse}

Translation:
${v.translation}

Purport:
${v.purport}
`;

  }).join("\n-----------------\n");


  const response =
    await groq.chat.completions.create({

      model: "llama-3.1-8b-instant",

      messages: [
        {
          role: "system",
          content:
          `
You are a Bhagavad Gita assistant.

Answer only using the provided Gita context.
Explain clearly and respectfully.
Mention chapter and verse references when relevant.
`
        },
        {
          role: "user",
          content:
          `
Question:
${question}

Gita Context:

${context}
`
        }
      ]
    });


  console.log("\nAnswer:\n");
  console.log(
    response.choices[0].message.content
  );
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


rl.question(
  "\nAsk Krishna: ",
  async(question)=>{

    await askGita(question);

    await pool.end();
    rl.close();

  }
);