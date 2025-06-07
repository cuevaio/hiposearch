import { openai } from "@ai-sdk/openai";
import { Search } from "@upstash/search";
import { generateText } from "ai";


const search = Search.fromEnv();
const index = search.index("knowledge");

const query = "qué es una hipoteca?";

const result = await generateText({
  model: openai("gpt-4.1-mini"),
  prompt: query
});

console.log("NO CONTEXT");
console.log(result.text);

console.log("\n\nWITH CONTEXT");
const results = await index.search({ query, limit: 5 });


const urls = new Map<string, number>();

for (const result of results) {
  if (result.metadata && result.metadata.sourceUrl && result.metadata.totalChunks) {
    urls.set(result.metadata.sourceUrl as string, result.metadata.totalChunks as number);
  }
}

console.log(urls);

let context = `<context>\n`;

for (const [url, totalChunks] of urls.entries()) {
  const docs = await index.fetch(new Array(totalChunks).fill(0).map((_, i) => `${url}-chunk-${i}`));

  context += `<resource url="${url}">\n`;
  context += docs
    .sort((a, b) => (a?.metadata?.chunkIndex as number) - (b?.metadata?.chunkIndex as number))
    .map((doc) => doc?.content.markdown)
    .join("\n\n");
  context += "\n</resource>\n";
}

context += "</context>";

console.log(context);

const resultWithContext = await generateText({
  model: openai("gpt-4.1-mini"),
  prompt: `
  Question: ${query}
  Context:
  ${context}
  `,
  system: `
  Eres un experto en hipotecas. Responde las preguntas con el contexto que se te proporciona. Referencia a los recursos para respaldar tus respuestas.
  Usa el formato IEEE para las referencias.
  `,
});

console.log(resultWithContext.text);
