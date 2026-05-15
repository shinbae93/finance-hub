import { z } from 'zod';

const schema = z.object({
  VITE_API_URL: z.string().url(),
});

const parsed = schema.safeParse(import.meta.env);
if (!parsed.success) {
  throw new Error(`Invalid web env: ${parsed.error.message}`);
}

export const env = parsed.data;
