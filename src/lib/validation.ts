import { z } from 'zod';

const datePattern = /^\d{4}-?\d{2}-?\d{2}$/;

export const filterSchema = z.object({
  entityId: z.coerce.number().int().positive().default(1),
  formulary: z.enum(['OPEN', 'MANAGED', 'HMF']).optional(),
  state: z.enum(['CA', 'IN', 'PA', 'KS', 'MN']).optional(),
  mony: z.enum(['M', 'O', 'N', 'Y']).optional(),
  manufacturer: z.string().max(200).optional(),
  drug: z.string().max(200).optional(),
  ndc: z.string().max(20).optional(),
  dateStart: z.string().regex(datePattern, 'Invalid date format').optional(),
  dateEnd: z.string().regex(datePattern, 'Invalid date format').optional(),
  groupId: z.string().max(50).optional(),
  includeFlaggedNdcs: z.boolean().default(false),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ValidatedFilters = z.infer<typeof filterSchema>;

const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.union([
    z.string().max(4096),
    z.array(z.any()), // AI SDK uses content parts
  ]),
  parts: z.array(z.any()).optional(),
  id: z.string().optional(),
});

export const chatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).max(50),
  data: z.record(z.string(), z.unknown()).optional(),
});
