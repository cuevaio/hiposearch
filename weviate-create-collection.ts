import weaviate, { type WeaviateClient, vectorizer, generative } from 'weaviate-client';

// Best practice: store your credentials in environment variables
const weaviateUrl = process.env.WEAVIATE_REST_URL as string;
const weaviateApiKey = process.env.WEAVIATE_API_KEY as string;

const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
  weaviateUrl, // Replace with your Weaviate Cloud URL
  {
    authCredentials: new weaviate.ApiKey(weaviateApiKey), // Replace with your Weaviate Cloud API key
  }
);

await client.collections.create({
  name: 'Question',
  vectorizers: vectorizer.text2VecWeaviate(),
  generative: generative.cohere(),
});

client.close(); // Close the client connection
