// Generated by ts-to-zod
import { z } from 'zod'

export const payloadSchema = z.object({
  amount: z.number(),
  channel: z.string(),
  product: z.string(),
  promoCode: z.string().optional(),
  userId: z.string(),
})
