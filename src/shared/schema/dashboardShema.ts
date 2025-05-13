import { z } from "zod";

export const suggestionSchema = z.object({
  topic: z.string().min(1, { message: 'Topic is required' }),
  message: z.string().min(1, { message: 'Message is required' }),
})
