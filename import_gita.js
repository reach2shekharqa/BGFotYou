import fs from "fs";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  port: 5432,
  database: "gita_db",
  user: "postgres",
  password: "Postgres@123",
});

const verses = JSON.parse(
  fs.readFileSync("gita_parsed.json", "utf-8")
);

console.log(`Found ${verses.length} verses`);

async function importVerses() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const verse of verses) {
      await client.query(
        `
        INSERT INTO verses
        (
          chapter,
          chapter_title,
          verse,
          transliteration,
          translation,
          purport
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        `,
        [
          verse.chapter,
          verse.chapter_title,
          verse.verse,
          verse.transliteration,
          verse.translation,
          verse.purport,
        ]
      );
    }

    await client.query("COMMIT");

    console.log("✅ Gita verses imported successfully");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

importVerses();