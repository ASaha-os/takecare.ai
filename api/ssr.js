// Vercel serverless function — TanStack Start SSR handler
// Built server exports a Web Fetch API `fetch` handler via `server.fetch`

export const config = { runtime: "nodejs20.x" };

let handler;

export default async function (req, res) {
  if (!handler) {
    // Dynamic import of the built SSR bundle
    const mod = await import("../dist/server/server.js");
    const fetchFn = mod.server?.fetch ?? mod.fetch ?? mod.default?.fetch;
    if (!fetchFn) {
      res.statusCode = 500;
      res.end("SSR handler not found in build output");
      return;
    }
    handler = fetchFn;
  }

  // Build the full URL
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost";
  const url = `${proto}://${host}${req.url}`;

  // Forward all headers
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v != null) headers.set(k, Array.isArray(v) ? v.join(", ") : v);
  }

  // Buffer body for non-GET requests
  let body;
  if (req.method !== "GET" && req.method !== "HEAD") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    body = Buffer.concat(chunks);
  }

  const request = new Request(url, {
    method: req.method,
    headers,
    body: body?.length ? body : undefined,
  });

  try {
    const response = await handler(request);
    res.statusCode = response.status;
    response.headers.forEach((v, k) => res.setHeader(k, v));

    if (response.body) {
      const reader = response.body.getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    console.error("[SSR]", err);
    res.statusCode = 500;
    res.end("Internal Server Error");
  }
}
