import { z } from 'zod';

export const ErrorResponseSchema = z.object({
  code: z.string().min(1, 'Error code is required'),
  message: z.string().min(1, 'Error message is required'),
  errors: z.record(z.string()).optional()
});

export type ErrorResponseSchemaType = z.infer<typeof ErrorResponseSchema>;
