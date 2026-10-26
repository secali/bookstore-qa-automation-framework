import { z } from 'zod';

export const BookSchema = z.object({
  id: z.string().optional(),
  _id: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().min(10, 'Valid ISBN format is required'),
  price: z.number().positive('Price must be greater than 0'),
  category: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const BookListSchema = z.union([
  z.array(BookSchema),
  z.object({
    data: z.array(BookSchema),
    total: z.number().optional(),
    page: z.number().optional(),
    limit: z.number().optional()
  })
]);

export type BookSchemaType = z.infer<typeof BookSchema>;
