import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function createDescription(product, opts = {}) {
  const model = opts.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const prompt = `You are an expert ecommerce copywriter and SEO specialist.
Write a short SEO-optimized product title (<= 70 chars), a 60–120 word product description that includes target keywords, and 5 bullet point features. Use the product data below. Keep language persuasive and factual.

Product data:\n${JSON.stringify(product, null, 2)}\n

Output as JSON with keys: title, description, bullets, seo_keywords.`;

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: 'You are a helpful assistant that writes ecommerce product copy.' },
      { role: 'user', content: prompt }
    ],
    max_tokens: 400
  });

  const text = response.choices?.[0]?.message?.content || response.choices?.[0]?.text || '';

  try {
    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    return { title: product.title || '', description: text, bullets: [], seo_keywords: [] };
  }
}

export default { createDescription };