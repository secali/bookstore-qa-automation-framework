import { z } from 'zod';

export const AuthSuccessSchema = z.object({
  token: z.string().optional(),
  user: z
    .object({
      id: z.string().optional(),
      _id: z.string().optional(),
      name: z.string(),
      email: z.string().email(),
      role: z.string().optional()
    })
    .optional(),
  message: z.string().optional()
});

export type AuthSuccessSchemaType = z.infer<typeof AuthSuccessSchema>;
