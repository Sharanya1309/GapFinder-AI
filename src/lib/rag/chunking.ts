import { DocumentChunk } from '../types';

export interface ChunkOptions {
  chunkSize?: number; // target character count, default 500
  overlap?: number;   // character overlap, default 80
}

export function chunkTextWithMetadata(
  text: string,
  documentId: string,
  sourceDocument: string,
  options: ChunkOptions = {}
): DocumentChunk[] {
  const chunkSize = options.chunkSize || 500;
  const overlap = options.overlap || 80;

  if (!text || text.trim().length === 0) {
    return [];
  }

  // Split into paragraphs/lines first to preserve semantic boundaries
  const rawParagraphs = text.split(/\n\s*\n/);
  const chunks: DocumentChunk[] = [];
  let currentBuffer = '';
  let currentPage = 1;
  let currentSection = 'General Overview';
  let chunkIndex = 1;

  for (const para of rawParagraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Detect section headers (e.g. Chapter 1, Section 2.1, Module)
    if (
      trimmed.startsWith('#') ||
      /^(Chapter|Section|Module|Part)\s+\d+/i.test(trimmed) ||
      trimmed.length < 60 && trimmed.endsWith(':')
    ) {
      currentSection = trimmed.replace(/^#+\s*/, '');
    }

    // Estimate page transition (roughly every 1800 characters)
    if (currentBuffer.length > 1800) {
      currentPage += 1;
    }

    if (currentBuffer.length + trimmed.length > chunkSize && currentBuffer.length > 0) {
      // Create a chunk from currentBuffer
      chunks.push({
        id: `chunk-${documentId}-${chunkIndex}`,
        documentId,
        chunkIndex,
        content: currentBuffer.trim(),
        metadata: {
          pageNumber: currentPage,
          sectionTitle: currentSection,
          sourceDocument,
          topicTag: inferTopicTag(currentBuffer),
        },
      });
      chunkIndex += 1;

      // Keep overlap from end of current buffer
      currentBuffer = currentBuffer.slice(-overlap) + ' ' + trimmed;
    } else {
      currentBuffer = currentBuffer ? currentBuffer + '\n\n' + trimmed : trimmed;
    }
  }

  // Flush remaining buffer
  if (currentBuffer.trim().length > 0) {
    chunks.push({
      id: `chunk-${documentId}-${chunkIndex}`,
      documentId,
      chunkIndex,
      content: currentBuffer.trim(),
      metadata: {
        pageNumber: currentPage,
        sectionTitle: currentSection,
        sourceDocument,
        topicTag: inferTopicTag(currentBuffer),
      },
    });
  }

  return chunks;
}

export function inferTopicTag(content: string): string {
  const lower = content.toLowerCase();
  if (lower.includes('convolution') || lower.includes('cnn') || lower.includes('receptive field') || lower.includes('filter') || lower.includes('stride')) {
    return 'topic-cnn';
  }
  if (lower.includes('recurrent') || lower.includes('rnn') || lower.includes('lstm') || lower.includes('gru') || lower.includes('cell state')) {
    return 'topic-rnn';
  }
  if (lower.includes('attention') || lower.includes('transformer') || lower.includes('qkv') || lower.includes('query') || lower.includes('multi-head')) {
    return 'topic-transformers';
  }
  if (lower.includes('autoencoder') || lower.includes('latent') || lower.includes('bottleneck') || lower.includes('vae') || lower.includes('kl divergence')) {
    return 'topic-autoencoders';
  }
  if (lower.includes('perceptron') || lower.includes('ann') || lower.includes('backprop') || lower.includes('gradient descent') || lower.includes('sigmoid')) {
    return 'topic-ann';
  }
  return 'general';
}
