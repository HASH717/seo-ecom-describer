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