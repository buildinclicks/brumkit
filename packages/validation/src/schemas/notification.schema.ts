import { z } from 'zod';
import { ValidationMessages } from '../messages';

/**
 * Schema for marking a notification as read
 */
export const markNotificationAsReadSchema = z.object({
  id: z.cuid({ error: ValidationMessages.CUID_INVALID }),
});

export type MarkNotificationAsReadInput = z.infer<
  typeof markNotificationAsReadSchema
>;
