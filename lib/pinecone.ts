import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME!);

async function initializePineconeIndex() {
  const existingIndexes = await pinecone.listIndexes();

  if (
    existingIndexes.indexes &&
    !existingIndexes.indexes.some(
      (idx) => idx.name === process.env.PINECONE_INDEX_NAME!
    )
  ) {
    await pinecone.createIndex({
      name: process.env.PINECONE_INDEX_NAME!,
      vectorType: "dense",
      dimension: 768,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
      deletionProtection: "disabled",
      tags: { environment: process.env.PINECONE_ENVIRONMENT! },
    });
  }
}

export async function storeMessage(
  embedding: number[],
  metadata: { role: string; content: string; timestamp: number }
) {
  await initializePineconeIndex();
  const id = `msg-${Date.now()}`;
  await index.upsert([{ id, values: embedding, metadata }]);
}

export async function retrieveRelevantMessages(
  queryEmbedding: number[],
  topK: number = 10
) {
  const existingIndexes = await pinecone.listIndexes();

  if (
    existingIndexes.indexes &&
    existingIndexes.indexes.some(
      (idx) => idx.name === process.env.PINECONE_INDEX_NAME!
    )
  ) {
    const results = await index.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });
    return (
      results.matches?.map(
        (match) =>
          match.metadata as { role: string; content: string; timestamp: number }
      ) || []
    );
  } else {
    return [];
  }
}
