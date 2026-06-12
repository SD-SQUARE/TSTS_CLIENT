import { z } from 'zod';
import i18n from '../../../i18n';

export const loginSchema = z.object({
    email: z.string()
        .min(1, i18n.language == 'en' ? 'Email is required.1' : 'البريد الاكتروني مطلوب')
        .email('Invalid email address format.'),

    password: z.string()
        .min(6, 'Password must be at least 6 characters long.')
        .regex(/[A-Z]/, 'Must contain an uppercase letter.')
        .regex(/[0-9]/, 'Must contain a number.')
        .regex(/[^A-Za-z0-9]/, 'Must contain a special character.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;