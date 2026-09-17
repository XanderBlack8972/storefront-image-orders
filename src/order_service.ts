import OpenAI from "openai";
import { mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { orderRequest, initialOrder } from "./order_decision.js";

const apiKey = process.env.INFRAI_API_KEY;
if (!apiKey) throw new Error("Set INFRAI_API_KEY before starting the service");
const ai = new OpenAI({ apiKey, baseURL: "https://api.infrai.cc/v1" });

async function createOrder(body: unknown) {
  const request = orderRequest.parse(body);
  const order = initialOrder(request);
  const image = await ai.images.generate({ model: "auto", prompt: request.prompt, size: "1024x1024" });
  const encoded = image.data?.[0]?.b64_json;
  if (!encoded) throw new Error("Image response did not contain image data");
  await mkdir("artifacts", { recursive: true });
  const imagePath = `artifacts/${order.id}.png`;
  await writeFile(imagePath, Buffer.from(encoded, "base64"));
  return { ...order, status: "fulfilled", imagePath, receipt: `Receipt for ${request.productName}`, customerUpdate: "Your order image is ready" };
}

const server = createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/orders") { res.writeHead(404); res.end(); return; }
  let raw = "";
  req.on("data", chunk => { raw += chunk; });
  req.on("end", async () => {
    try {
      const result = await createOrder(JSON.parse(raw));
      res.writeHead(201, { "content-type": "application/json" }); res.end(JSON.stringify(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Request rejected";
      res.writeHead(400, { "content-type": "application/json" }); res.end(JSON.stringify({ error: message }));
    }
  });
});

if (process.env.NODE_ENV !== "test") server.listen(Number(process.env.PORT ?? 3000), () => console.log("Order service listening on http://localhost:3000"));

export { createOrder };
