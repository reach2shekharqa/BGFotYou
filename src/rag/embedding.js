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
        inputs: `query: ${text}`,
        options: {
          wait_for_model: true
        }
      })
    }
  );

  const data = await response.json();

  console.log(
    "HF RESPONSE:",
    JSON.stringify(data).slice(0, 300)
  );

  if (!response.ok) {
    throw new Error(
      `Embedding API failed: ${JSON.stringify(data)}`
    );
  }


  // HF sometimes returns nested arrays
  if (Array.isArray(data) && Array.isArray(data[0])) {
    return data[0];
  }


  // Some providers return { embedding: [] }
  if (data.embedding) {
    return data.embedding;
  }


  // Direct array response
  if (Array.isArray(data)) {
    return data;
  }


  throw new Error(
    "Unexpected HuggingFace embedding response format"
  );
}