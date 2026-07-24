import pg from "pg";
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

console.log("Loading embedding model...");

const extractor = await pipeline(
  "feature-extraction",
  "Xenova/bge-base-en-v1.5"
);

console.log("Model loaded");

function createEmbedding(text) {
  const output = extractor(
    `query: ${text}`,
    {
      pooling: "mean",
      normalize: true,
    }
  );

  return output;
}

async function searchGita(question) {
  const output = await createEmbedding(question);

  const embedding = Array.from(output.data);

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
      LIMIT 5;
      `,
      [
        JSON.stringify(embedding),
      ]
    );

    console.log("\nTop matching verses:\n");

    result.rows.forEach((row, index) => {
      console.log(`--- Result ${index + 1} ---`);
      console.log(
        `Chapter ${row.chapter} Verse ${row.verse}`
      );
      console.log(
        `Similarity: ${Number(row.similarity).toFixed(4)}`
      );
      console.log("\nTranslation:");
      console.log(row.translation);

      console.log("\nPurport:");
      console.log(row.purport.substring(0, 500));

      console.log("\n");
    });

  } finally {
    client.release();
  }
}


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


rl.question(
  "\nAsk Krishna: ",
  async (question) => {
    await searchGita(question);
    await pool.end();
    rl.close();
  }
);