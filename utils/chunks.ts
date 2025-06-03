export function createSmartChunks(text: string, targetSize: number = 1000, maxSize: number = 1500): string[] {
  if (text.length <= targetSize) {
    return [text];
  }

  const chunks: string[] = [];

  // First, split by double newlines (paragraphs)
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed target size, process current chunk
    if (currentChunk && (currentChunk.length + paragraph.length + 2) > targetSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = '';
    }

    // If paragraph itself is larger than maxSize, need to split it further
    if (paragraph.length > maxSize) {
      // First, finish current chunk if it exists
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }

      // Split large paragraph by sentences
      const sentences = paragraph.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        if (sentence.length > maxSize) {
          // If sentence is too long, split by words
          const words = sentence.split(/\s+/);
          let wordChunk = '';

          for (const word of words) {
            if (wordChunk && (wordChunk.length + word.length + 1) > maxSize) {
              chunks.push(wordChunk.trim());
              wordChunk = word;
            } else {
              wordChunk += (wordChunk ? ' ' : '') + word;
            }
          }

          if (wordChunk.trim()) {
            if (currentChunk && (currentChunk.length + wordChunk.length + 1) <= targetSize) {
              currentChunk += (currentChunk ? ' ' : '') + wordChunk;
            } else {
              if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
              }
              currentChunk = wordChunk;
            }
          }
        } else {
          // Sentence fits, try to add to current chunk
          if (currentChunk && (currentChunk.length + sentence.length + 1) > targetSize) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
          } else {
            currentChunk += (currentChunk ? ' ' : '') + sentence;
          }
        }
      }
    } else {
      // Paragraph fits within maxSize, add to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  // Add remaining chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.filter(chunk => chunk.length > 0);
}