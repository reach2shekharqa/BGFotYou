import { pipeline } from "@xenova/transformers";

let extractor;

export async function loadModel() {

  if (!extractor) {
    console.log("Loading embedding model...");

    extractor = await pipeline(
      "feature-extraction",
      "Xenova/bge-base-en-v1.5"
    );

    console.log("Embedding model ready");
  }

}


export async function createEmbedding(text) {

  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/BAAI/bge-base-en-v1.5",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: `query: ${text}`
      })
    }
  );

  if (!response.ok) {
    throw new Error(
      `Embedding API failed: ${response.status} ${await response.text()}`
    );
  }

  const data = await response.json();

console.log("HF embedding response:", JSON.stringify(data).slice(0,200));

if (Array.isArray(data[0])) {
  return data[0];
}

if (data.embedding) {
  return data.embedding;
}

return data;
}