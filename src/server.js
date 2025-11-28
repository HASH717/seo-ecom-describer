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