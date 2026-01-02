import { pipeline, Pipeline } from '@xenova/transformers';
let embeddingPipeline: Pipeline | null = null;
export async function initEmbeddings(): Promise<void> {
  if (!embeddingPipeline) {
    console.log('Loading embedding model (first run may take time)...');
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
    console.log('Embedding model loaded');
  }
}
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!embeddingPipeline) {
    await initEmbeddings();
  }
  const truncated = text.substring(0, 2000);
  const output = await embeddingPipeline!(truncated, {
    pooling: 'mean',
    normalize: true
  });
  return Array.from(output.data);
}
export async function generateExchangeEmbedding(
  userMessage: string,
  assistantMessage: string
): Promise<number[]> {
  const combined = `User: ${userMessage}\n\nAssistant: ${assistantMessage}`;
  return generateEmbedding(combined);
}
