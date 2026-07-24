import { pool } from "../db.js";

export async function getVerseOfTheDay() {

    const result = await pool.query(`
        SELECT
            chapter,
            chapter_title,
            verse,
            transliteration,
            translation,
            purport
        FROM verses
        ORDER BY RANDOM()
        LIMIT 1
    `);

    return result.rows[0];
}