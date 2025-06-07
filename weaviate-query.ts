import weaviate, { type WeaviateClient } from 'weaviate-client';

// Best practice: store your credentials in environment variables
const weaviateUrl = process.env.WEAVIATE_REST_URL as string;
const weaviateApiKey = process.env.WEAVIATE_API_KEY as string;

const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
  weaviateUrl, // Replace with your Weaviate Cloud URL
  {
    authCredentials: new weaviate.ApiKey(weaviateApiKey), // Replace with your Weaviate Cloud API key
  }
);

const questions = client.collections.get('Question');

const result = await questions.query.nearText('biology', {
  limit: 2,
});

result.objects.forEach((item) => {
  console.log(JSON.stringify(item.properties, null, 2));
});

client.close(); // Close the client connection