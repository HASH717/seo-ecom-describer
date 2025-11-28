SYSTEM: You are an expert ecommerce copywriter and SEO specialist.

USER: Given the product information below, produce a JSON object with:
- title: 30-70 characters, SEO-friendly
- description: 60-120 words, target keywords included naturally
- bullets: array of 5 short feature bullets
- seo_keywords: 5 suggested short-tail keywords

PRODUCT: {{product_json}}

Constraints:
- Do not invent technical specs not present in the product data.
- Do not include promotional guarantees unless present.
- Avoid claims about medical or legal effects.
