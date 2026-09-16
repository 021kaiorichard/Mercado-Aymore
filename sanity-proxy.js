const http = require('http');

const PROJECT_ID = 'rv1fw9tb';
const DATASET = 'production';
const API_VERSION = 'v2024-01-01';
const PORT = 3001;

const productQuery = `*[_type == "product"] | order(_createdAt desc) { _id, name, slug, category, price, description, featured, image { asset -> { _ref } } }`;
const promotionQuery = `*[_type == "promotion" && active == true] | order(_createdAt desc) { _id, title, description, discount, active, image { asset -> { _ref } }, startDate, endDate }`;

function withToken(headers) {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) return headers;
  return { ...headers, Authorization: `Bearer ${token}` };
}

async function querySanity(query) {
  const url = `https://${PROJECT_ID}.api.sanity.io/${API_VERSION}/data/query/${DATASET}?query=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: withToken({ Accept: 'application/json' }),
  });

  const text = await response.text();
  let payload = {};
  try {
    payload = JSON.parse(text);
  } catch (error) {
    payload = { error: text };
  }

  if (!response.ok) {
    throw new Error(JSON.stringify(payload, null, 2));
  }

  return payload.result || [];
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3001');

  if (url.pathname === '/api/products') {
    try {
      const result = await querySanity(productQuery);
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ result }));
      return;
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: String(error.message || error) }));
      return;
    }
  }

  if (url.pathname === '/api/promotions') {
    try {
      const result = await querySanity(promotionQuery);
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ result }));
      return;
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: String(error.message || error) }));
      return;
    }
  }

  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ ok: true, projectId: PROJECT_ID, dataset: DATASET }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Sanity proxy running at http://localhost:${PORT}`);
});
