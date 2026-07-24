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

  await loadModel();

  const output = await extractor(
    `query: ${text}`,
    {
      pooling: "mean",
      normalize: true
    }
  );

  return Array.from(output.data);
}