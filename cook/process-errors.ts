import { Search } from "@upstash/search";

import FireCrawlApp from '@mendable/firecrawl-js';
import { createSmartChunks } from "../utils/chunks";
import { errors as existingErrors } from "./errors";

const app = new FireCrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
})

const search = Search.fromEnv();
const index = search.index("knowledge");

const errors: { url: string, error: string }[] = [];

for (const { url, error } of existingErrors) {
  try {
    const scrapeResult = await app.scrapeUrl(url, {
      formats: ["markdown"],
      onlyMainContent: true,
      includeTags: ["#content>.container:first-child>div>div:first-child"]
    });

    if (!scrapeResult.success) {
      errors.push({ url, error: "Failed to scrape URL" });
      continue;
    }

    if (!scrapeResult.markdown) {
      errors.push({ url, error: "No markdown content found" });
      continue;
    }

    const chunks = createSmartChunks(scrapeResult.markdown);

    // Upsert each chunk with a unique ID
    for (let i = 0; i < chunks.length; i++) {
      await index.upsert([
        {
          id: `${url}-chunk-${i}`,
          content: {
            markdown: chunks[i],
          },
          metadata: {
            sourceUrl: url,
            chunkIndex: i,
            totalChunks: chunks.length
          }
        },
      ]);
    }

    console.log(`Upserted ${chunks.length} chunks for ${url}`);

    new Promise((resolve) => setTimeout(resolve, 3000));
  } catch (error) {
    errors.push({ url, error: (error as Error)?.message ?? "Unknown error" });
  }
}

console.log(errors);
