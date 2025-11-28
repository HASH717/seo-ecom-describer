# seo-ecom-describer

An open-source CLI + lightweight web service that converts raw product data into SEO-optimized ecommerce descriptions using OpenAI models.

---

## What I put in this repository

This document contains a ready-to-paste repository scaffold (files, code, CI, docs, examples) you can publish straight to GitHub. Files included:

* `README.md` (project overview & quickstart)
* `package.json` (Node.js project config)
* `.env.example` (environment variables)
* `src/cli.js` (simple CLI to convert CSV/JSON inputs into descriptions)
* `src/generate.js` (OpenAI API wrapper + prompt engineering)
* `src/server.js` (optional small Express web UI / API)
* `templates/prompt.md` (prompt templates you can customize)
* `examples/sample_input.json` (sample raw product data)
* `.github/workflows/ci.yml` (CI to run ESLint + tests)
* `LICENSE` (MIT)
* `CONTRIBUTING.md` (how to contribute)

---

## How to use this scaffold locally

1. Copy files into a folder `seo-ecom-describer` (or clone the repo after you publish it).
2. Create a `.env` from `.env.example` and set `OPENAI_API_KEY`.
3. `npm install` then run the CLI, or run the server for an HTTP endpoint.

---

## Files (full content)

### package.json

```json
{
  "name": "seo-ecom-describer",
  "version": "0.1.0",
  "description": "Turn raw product data into SEO-optimized ecommerce descriptions using OpenAI",
  "main": "src/cli.js",
  "scripts": {
    "start": "node src/server.js",
    "cli": "node src/cli.js",
    "lint": "eslint .",
    "test": "node test/run-tests.js"
  },
  "keywords": ["seo","ecommerce","openai","descriptions"],
  "license": "MIT",
  "dependencies": {
    "dotenv": "^16.0.0",
    "express": "^4.18.0",
    "openai": "^4.0.0",
    "csv-parse": "^5.0.0",
    "commander": "^10.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "jest": "^29.0.0"
  }
}
```

---

### .env.example

```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
PORT=3000
```

---

### src/generate.js

```js
// src/generate.js
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function createDescription(product, opts = {}) {
  const model = opts.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';

  // Basic prompt template — keep it short and authoritative.
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
    // If output is JSON, parse; otherwise return raw text under description.
    const parsed = JSON.parse(text);
    return parsed;
  } catch (err) {
    return { title: product.title || '', description: text, bullets: [], seo_keywords: [] };
  }
}

export default { createDescription };
```

> Note: this uses the modern `openai` npm package and the Chat Completions style `client.chat.completions.create()` call — adapt this call to the exact SDK version you use.

---

### src/cli.js

```js
// src/cli.js
import { program } from 'commander';
import fs from 'fs';
import { createDescription } from './generate.js';

program
  .option('-i, --input <file>', 'JSON file of product objects', 'examples/sample_input.json')
  .option('-o, --output <file>', 'Output JSON file', 'examples/output.json')
  .parse(process.argv);

const options = program.opts();

async function run() {
  const raw = JSON.parse(fs.readFileSync(options.input, 'utf8'));
  const out = [];

  for (const product of raw) {
    console.log('Generating for:', product.sku || product.title || 'unknown');
    const result = await createDescription(product);
    out.push({ product, result });
  }

  fs.writeFileSync(options.output, JSON.stringify(out, null, 2), 'utf8');
  console.log('Done — output written to', options.output);
}

run();
```

---

### src/server.js (minimal API)

```js
// src/server.js
import express from 'express';
import bodyParser from 'body-parser';
import { createDescription } from './generate.js';

const app = express();
app.use(bodyParser.json());

app.post('/generate', async (req, res) => {
  try {
    const product = req.body;
    const out = await createDescription(product);
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Listening on', port));
```

---

### templates/prompt.md

```
SYSTEM: You are an expert ecommerce copywriter and SEO specialist.

USER: Given the product information below, produce a JSON object with:
- title: 30-70 characters, SEO-friendly
- description: 60-120 words, target keywords included naturally
- bullets: array of 5 short feature bullets
- seo_keywords: 5 suggested short-tail keywords

PRODUCT: {{product_json}}

Constraints:
- Do not invent technical specs not present in the product data.
- Do not include promotional guarantees (e.g., "money-back guarantee") unless present in product data.
- Avoid claims about medical or legal effects.
```

---

### examples/sample_input.json

```json
[
  {
    "sku": "TSHIRT-RED-XL",
    "title": "Classic Cotton T-Shirt",
    "brand": "Motrani Apparel",
    "color": "Red",
    "size": "XL",
    "material": "100% combed cotton",
    "features": ["Pre-shrunk", "Tagless", "Machine washable"],
    "target_keywords": ["cotton t-shirt","red t-shirt","comfortable tee"]
  }
]
```

---

### .github/workflows/ci.yml

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

---

### LICENSE (MIT)

```
MIT License

Copyright (c) YEAR Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
... (standard MIT text)
```

---

### CONTRIBUTING.md

```
- Fork the repo
- Open a branch
- Add tests for new features
- Open a PR with a clear description
```

---

## README: Quick instructions to publish to GitHub

1. Create local repo and commit:

```bash
git init
git add .
git commit -m "Initial commit — seo-ecom-describer scaffold"
```

2. Create a GitHub repo and push (two ways):

* Using GH CLI (recommended):

```bash
gh repo create yourusername/seo-ecom-describer --public --source=. --push
```

* Or create on github.com and follow their push instructions.

3. Add the OpenAI API key to GitHub Secrets (Settings → Secrets → Actions → NEW):

* Name: `OPENAI_API_KEY`
* Value: your key

4. Enable GitHub Actions if you want the CI.

---

## Security & cost recommendations

* Keep `OPENAI_API_KEY` secret; never commit your `.env`.
* Add rate limiting / batching to avoid high costs when converting large catalogs.
* Use a smaller model like `gpt-4o-mini` or any lower-cost model for bulk generation, and reserve larger models for high-value SKUs.

---

## Extending the project

* Add embeddings + semantic keyword generation to produce category pages and internal linking suggestions.
* Add a small admin UI where a human can approve edits or tweak keywords.
* Add fine-tuning or retrieval-augmented generation (RAG) if you want product- or brand-specific voice.

---

## Tests (suggested)

* unit tests for prompt sanitization
* integration test that runs a mocked OpenAI client

---

## CONTRIBUTORS

HASH717
