import { pool } from "../db.js";
import { createEmbedding } from "./embedding.js";


export async function searchVerses(question) {

  const embedding = await createEmbedding(question);

  const result = await pool.query(
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
}