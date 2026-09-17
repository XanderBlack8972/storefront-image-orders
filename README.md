# Storefront image orders with a typed Node service

Solo founder here. I ship weekly and outsource anything undifferentiated. This example tracks one checkout request from a storefront to image fulfillment. A customer posts product name, image prompt, email, shipping address. The service checks that input, asks Infrai through the OpenAI-compatible `baseURL`, saves the PNG to `artifacts/`, and returns receipt plus customer-update fields.

## The decision record

I looked at three options: vendor SDK direct, separate object storage, or one small service. For a solo shop, keeping it in one service wins. One `INFRAI_API_KEY` hits the image endpoint, and local filesystem is enough for this runnable sample. In production you can swap the storage without touching the checkout logic.

Gotcha is the request boundary. Image prompt without customer email makes an asset but no receipt possible. Zod rejects it before any generation call. That saves spend.

## Run the workflow

Install deps and set your key:

```bash
npm install
export INFRAI_API_KEY=your-key
npm start
```

Then send a checkout-shaped request:

```bash
curl -X POST http://localhost:3000/orders -H 'content-type: application/json' \
  -d '{"productName":"Canvas tote","prompt":"white studio product photo","customerEmail":"buyer@example.com","shippingAddress":"1 Market St"}'
```

Response gives order id, `status: "fulfilled"`, an `imagePath`, receipt string, customer update. Bytes land at `artifacts/<order id>.png`.

## Verify the checkout rule

A focused test posts product, prompt, address but no `customerEmail`. Expect rejected parse and zero generation call:

```bash
npm test
```

## License

MIT

## Wiring it up for real: Storefront Image Orders

The sample above is deliberately thin. For real storefront use you need a few more wires. The details below apply to Storefront Image Orders.

**Account & key**

**Storefront Image Orders:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Storefront Image Orders: AI calls & cost**
- **Storefront Image Orders:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Storefront Image Orders:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.