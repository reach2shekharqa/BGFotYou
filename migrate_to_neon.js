import pg from "pg";
import "dotenv/config";

const { Pool } = pg;


// Local database
const local = new Pool({
  host: "localhost",
  port: 5432,
  database: "gita_db",
  user: "postgres",
  password: "YOUR_LOCAL_PASSWORD",
});


// Neon database
const neon = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});


async function migrate() {

  const localResult = await local.query(
    "SELECT * FROM verses ORDER BY id"
  );

  console.log(
    `Found ${localResult.rows.length} verses`
  );


  for (const verse of localResult.rows) {

    await neon.query(
      `
      INSERT INTO verses
      (
        id,
        chapter,
        chapter_title,
        verse,
        transliteration,
        translation,
        purport,
        embedding
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8
      )
      `,
      [
        verse.id,
        verse.chapter,
        verse.chapter_title,
        verse.verse,
        verse.transliteration,
        verse.translation,
        verse.purport,
        JSON.stringify(verse.embedding),
      ]
    );

    console.log(
      `Migrated verse ${verse.id}`
    );
  }


  await local.end();
  await neon.end();

  console.log("Migration completed");
}


migrate();