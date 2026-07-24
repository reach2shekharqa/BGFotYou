import fs from "fs";

const rawText = fs.readFileSync("gita_raw.txt", "utf-8");
const lines = rawText.split("\n");

// Bound to main content only (Chapter 1 start to end of Chapter 18 purport)
const startIdx = lines.findIndex((l) => l.includes("CHAPTER 1 -"));
const endIdx = lines.findIndex((l) =>
  l.includes("Bhaktivedanta Purports to the Eighteenth")
);
const contentLines = lines.slice(startIdx, endIdx);

let text = contentLines.join("\n");

// Remove page-break markers and repeated copyright footer lines
text = text.replace(/\f/g, "\n");
text = text.replace(
  /\s*Copyright © 1998 The Bhaktivedanta Book Trust Int'l\. All Rights Reserved\.\s*/g,
  "\n"
);

// Split on chapter headers, keep chapter number
const chapterPattern = /-\s*CHAPTER\s+(\d+)\s*-/g;
const chapterSplits = text.split(chapterPattern);

const verses = [];

for (let i = 1; i < chapterSplits.length; i += 2) {
  const chapNum = parseInt(chapterSplits[i], 10);
  const chapText = chapterSplits[i + 1];

  const chapLines = chapText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);
  const chapTitle = chapLines.length ? chapLines[0] : "";

  const versePattern = /\n\s*TEXTS?\s+([\d\-–,\s]+?)\s*\n/g;
  const parts = chapText.split(versePattern);

  for (let j = 1; j < parts.length; j += 2) {
    const verseNumStr = parts[j].trim();
    const block = parts[j + 1];

    const transMatch = block.match(
      /TRANSLATION\s*\n([\s\S]*?)(?:\n\s*PURPORT\s*\n|$)/
    );
    let translation = transMatch ? transMatch[1].trim() : "";
    translation = translation.replace(/\s+/g, " ");

    const purportMatch = block.match(/PURPORT\s*\n([\s\S]*)/);
    let purport = purportMatch ? purportMatch[1].trim() : "";
    purport = purport.replace(/\s+/g, " ");

    const translitMatch = block.match(/^([\s\S]*?)SYNONYMS/);
    const translitRaw = translitMatch ? translitMatch[1].trim() : "";
    const translitLines = translitRaw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l);
    const transliteration = translitLines.slice(-4).join(" ");

    if (!translation) continue;

    verses.push({
      chapter: chapNum,
      chapter_title: chapTitle,
      verse: verseNumStr,
      transliteration,
      translation,
      purport,
    });
  }
}

console.log(`Parsed ${verses.length} verse blocks`);
fs.writeFileSync("gita_parsed.json", JSON.stringify(verses, null, 2), "utf-8");

for (const v of verses.slice(0, 2)) {
  console.log(JSON.stringify(v, null, 2).slice(0, 800));
  console.log("---");
}