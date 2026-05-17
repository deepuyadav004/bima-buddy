import OpenAI from "openai";

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
const apiVersion = process.env.AZURE_OPENAI_API_VERSION ?? "2024-08-01-preview";

if (!endpoint || !apiKey || !deployment) {
  throw new Error(
    "AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_KEY, AZURE_OPENAI_DEPLOYMENT must all be set"
  );
}

// Normalize endpoint (no trailing slash)
const normalized = endpoint.replace(/\/+$/, "");

/**
 * Azure-flavored OpenAI client.
 * Use as: openai.chat.completions.create({ model: AZURE_OPENAI_DEPLOYMENT, ... })
 * Azure routes requests to your deployment based on the model name in the URL.
 */
export const openai = new OpenAI({
  apiKey,
  baseURL: `${normalized}/openai/deployments/${deployment}`,
  defaultQuery: { "api-version": apiVersion },
  defaultHeaders: { "api-key": apiKey },
});

export const AZURE_DEPLOYMENT = deployment;
