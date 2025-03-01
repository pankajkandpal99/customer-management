import { Client } from "@elastic/elasticsearch";

if (
  process.env.NODE_ENV === "production" &&
  !process.env.ELASTICSEARCH_PROD_URL
) {
  throw new Error(
    "ELASTICSEARCH_PROD_URL environment variable is missing for production."
  );
}

// Create Elasticsearch client
export const elasticClient = new Client({
  node:
    process.env.NODE_ENV === "production"
      ? process.env.ELASTICSEARCH_PROD_URL
      : "http://localhost:9200",
  auth:
    process.env.NODE_ENV === "production"
      ? {
          username: process.env.ELASTICSEARCH_PROD_USERNAME ?? "elastic",
          password: process.env.ELASTICSEARCH_PROD_PASSWORD ?? "changeme",
        }
      : undefined,
});
