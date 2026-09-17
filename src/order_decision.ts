import { z } from "zod";

export const orderRequest = z.object({
  productName: z.string().min(1),
  prompt: z.string().min(1),
  customerEmail: z.string().email(),
  shippingAddress: z.string().min(1)
});

export type OrderRequest = z.infer<typeof orderRequest>;

export function initialOrder(request: OrderRequest) {
  return { id: `order_${crypto.randomUUID()}`, ...request, status: "image_pending" as const };
}
