import { pool } from "../db.js";
import { createEmbedding } from "./embedding.js";


export async function searchVerses(question) {

  const embedding = await createEmbedding(question);

  const vector = `[${embedding.join(",")}]`;

const result = await pool.query(
 `
 SELECT *,
 1 - (embedding <=> $1) AS similarity
 FROM verses
 ORDER BY embedding <=> $1
 LIMIT 5
 `,
 [vector]
);

  return result.rows;
}