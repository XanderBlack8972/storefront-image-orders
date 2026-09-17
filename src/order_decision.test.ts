import assert from "node:assert/strict";
import { orderRequest } from "./order_decision.js";

const result = orderRequest.safeParse({ productName: "Canvas tote", prompt: "white studio product photo", shippingAddress: "1 Market St" });
assert.equal(result.success, false, "checkout must reject an order without a customer email");
console.log("checkout boundary test passed");
