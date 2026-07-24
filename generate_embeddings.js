import pg from "pg";
import { pipeline } from "@xenova/transformers";

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

async function generateEmbeddings() {
    const client = await pool.connect();

    try {
        const result = await client.query(
            `
      SELECT id, translation, purport
      FROM verses
      WHERE embedding IS NULL
      ORDER BY id
      `
        );

        console.log(`Found ${result.rows.length} verses`);

        for (const row of result.rows) {

            const text = `
passage: ${row.translation}

${row.purport}
`.trim();

            const output = await extractor(
                text,
                {
                    pooling: "mean",
                    normalize: true
                }
            );

            const embedding = Array.from(output.data);

            await client.query(
                `
        UPDATE verses
        SET embedding = $1
        WHERE id = $2
        `,
                [
                    JSON.stringify(embedding),
                    row.id
                ]
            );

            console.log(`Embedded verse ${row.id}`);
        }

        console.log("✅ All embeddings generated");

    } catch (error) {
        console.error(error);
    } finally {
        client.release();
        await pool.end();
    }
}

generateEmbeddings();